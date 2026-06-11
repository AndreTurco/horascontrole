const express = require('express');
const cors = require('cors');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const os = require('os');
const qrcode = require('qrcode-terminal');
const localtunnel = require('localtunnel');
const { spawn, exec } = require('child_process');
const https = require('https');
const dns = require('dns');

// Configurar servidores DNS públicos para o Node.js resolver domínios externos de forma robusta no Windows
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    console.warn('[AVISO] Não foi possível definir servidores DNS públicos:', e.message);
}

const app = express();
// Porta 3080 para evitar conflitos na porta 3000
const PORT = 3080;
const isPackaged = process.pkg || (process.versions && process.versions.electron && !process.defaultApp);
const basePath = isPackaged ? path.dirname(process.execPath) : __dirname;
const xlsxPath = path.join(basePath, 'Controle_de_Horas_Trabalho-1.xlsx');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gerenciador de conexões em tempo real (SSE)
let sseClients = [];

function sendSSEUpdate(type, data = {}) {
    const payload = JSON.stringify({ type, ...data });
    sseClients.forEach(client => {
        try {
            client.res.write(`data: ${payload}\n\n`);
        } catch (e) {
            // Cliente desconectado
        }
    });
}

async function saveWorkbook(workbook, filePath) {
    await workbook.xlsx.writeFile(filePath);
    sendSSEUpdate('reload');
}

// Rota de stream do SSE para atualizações em tempo real
app.get('/api/updates-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);

    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    req.on('close', () => {
        sseClients = sseClients.filter(client => client.id !== clientId);
    });
});

// Middleware para desativar cache em todas as rotas de API
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Fila de Gravação Segura para Concorrência
let excelLock = Promise.resolve();
async function safeExcelOp(fn) {
    const next = () => fn();
    const current = excelLock.then(next, next);
    excelLock = current;
    return current;
}

function handleExcelError(res, err, contextMessage) {
    console.error(`[EXCEL-ERROR] ${contextMessage}:`, err);
    if (err.code === 'EBUSY') {
        return res.status(500).json({ error: 'A planilha Excel está aberta no Microsoft Excel ou sendo sincronizada pelo OneDrive. Por favor, feche o Excel no computador e tente salvar novamente!' });
    }
    return res.status(500).json({ error: `${contextMessage}: ${err.message}` });
}

// Criar Cópia de Backup Automática
function createBackup(srcPath) {
    try {
        const backupDir = path.join(path.dirname(srcPath), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const ext = path.extname(srcPath);
        const base = path.basename(srcPath, ext);
        const now = new Date();
        const timestamp = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        const destPath = path.join(backupDir, `${base}_${timestamp}${ext}`);
        fs.copyFileSync(srcPath, destPath);
        console.log(`[BACKUP] Cópia de segurança criada em: ${destPath}`);
    } catch (err) {
        console.error('[BACKUP-ERROR] Falha ao criar cópia de segurança:', err);
    }
}

// Garantir que a planilha existe ou criá-la do zero para 2026 (Portabilidade)
async function ensureExcelFileExists() {
    if (!fs.existsSync(xlsxPath)) {
        console.log('[INIT] Planilha Controle_de_Horas_Trabalho-1.xlsx não encontrada. Criando uma nova planilha pré-configurada para 2026...');
        const workbook = new ExcelJS.Workbook();
        
        // 1. Controle de Horas Sheet
        const sheet = workbook.addWorksheet('Controle de Horas');
        
        // Setup Headers
        sheet.getRow(1).values = [
            'Data', 'Dia da Semana', 'Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2',
            'Horas do Dia', 'Valor do Dia (R$)', 'Valor Hora', 'Observações',
            'Status Pagamento', 'Saída Casa', 'Chegada Casa', 'Tempo Trajeto', 'Tempo Fora Casa'
        ];
        sheet.getRow(1).font = { bold: true };
        
        // Default Hourly Rate in I2 (9th column, 2nd row)
        sheet.getRow(2).getCell(9).value = 12.0;
        
        // Populate the days of the year 2026
        const ptWeekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        
        let rowIdx = 2;
        const startDate = new Date('2026-01-01T00:00:00Z');
        const endDate = new Date('2026-12-31T00:00:00Z');
        
        for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
            const dateStr = d.toISOString().substring(0, 10);
            const weekdayStr = ptWeekdays[d.getUTCDay()];
            
            const row = sheet.getRow(rowIdx);
            row.getCell(1).value = new Date(dateStr + 'T00:00:00Z');
            row.getCell(2).value = weekdayStr;
            row.getCell(11).value = 'Pendente'; // Status Pagamento
            
            rowIdx++;
        }
        
        // 2. Gestão Financeira Sheet
        const finSheet = workbook.addWorksheet('Gestão Financeira');
        finSheet.getRow(1).values = ['ID', 'Data', 'Descrição', 'Tipo', 'Valor', 'Categoria'];
        finSheet.getRow(1).font = { bold: true };
        
        // 3. Investimentos Sheet
        const investSheet = workbook.addWorksheet('Investimentos');
        investSheet.getRow(1).values = ['ID', 'Data', 'Origem', 'Valor', 'Tipo'];
        investSheet.getRow(1).font = { bold: true };
        
        await saveWorkbook(workbook, xlsxPath);
        console.log('[INIT] Planilha 2026 criada e salva com sucesso!');
    }
}

// Formatar Célula de Hora para HH:MM
function formatCellTime(cellValue) {
    if (!cellValue) return null;
    if (typeof cellValue === 'string') {
        return cellValue.substring(0, 5);
    }
    if (cellValue instanceof Date) {
        const hours = cellValue.getUTCHours().toString().padStart(2, '0');
        const minutes = cellValue.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    if (typeof cellValue === 'object' && cellValue.result) {
        return formatCellTime(cellValue.result);
    }
    return null;
}

// Formatar Célula de Data para YYYY-MM-DD
function formatCellDate(cellValue) {
    if (!cellValue) return null;
    if (cellValue instanceof Date) {
        return cellValue.toISOString().substring(0, 10);
    }
    if (typeof cellValue === 'string') {
        return cellValue.substring(0, 10);
    }
    if (typeof cellValue === 'object' && cellValue.result) {
        return formatCellDate(cellValue.result);
    }
    return null;
}

// Converter HH:MM para Minutos
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// Converter Minutos para string de Hora HH:MM
function minutesToTimeStr(totalMinutes) {
    if (totalMinutes <= 0) return '00:00';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Calcular minutos trabalhados nos turnos
function calculateWorkedMinutes(e1, s1, e2, s2) {
    let minutes = 0;
    if (e1 && s1) {
        let diff = timeToMinutes(s1) - timeToMinutes(e1);
        if (diff < 0) diff += 24 * 60; // Suporte a virada de turno
        minutes += diff;
    }
    if (e2 && s2) {
        let diff = timeToMinutes(s2) - timeToMinutes(e2);
        if (diff < 0) diff += 24 * 60;
        minutes += diff;
    }
    return minutes;
}

// Calcular tempo de trajeto ida e volta em minutos
function calculateCommuteMinutes(saidaCasa, e1, s1, e2, s2, chegadaCasa) {
    if (!saidaCasa || !chegadaCasa) return 0;
    let morningCommute = 0;
    if (e1) {
        let diff = timeToMinutes(e1) - timeToMinutes(saidaCasa);
        if (diff < 0) diff += 24 * 60;
        morningCommute = diff;
    }
    let eveningCommute = 0;
    const lastExit = s2 ? s2 : s1;
    if (lastExit) {
        let diff = timeToMinutes(chegadaCasa) - timeToMinutes(lastExit);
        if (diff < 0) diff += 24 * 60;
        eveningCommute = diff;
    }
    return morningCommute + eveningCommute;
}

// Calcular tempo total fora de casa em minutos
function calculateTimeOutsideMinutes(saidaCasa, chegadaCasa) {
    if (!saidaCasa || !chegadaCasa) return 0;
    let diff = timeToMinutes(chegadaCasa) - timeToMinutes(saidaCasa);
    if (diff < 0) diff += 24 * 60;
    return diff;
}

// Garantir a inicialização correta das planilhas, colunas e cabeçalhos
async function ensureSheetStructure(workbook) {
    // 1. Planilha Controle de Horas
    let sheet = workbook.getWorksheet('Controle de Horas');
    if (!sheet) {
        throw new Error('A planilha "Controle de Horas" é obrigatória e não foi encontrada.');
    }
    
    const headerRow = sheet.getRow(1);
    headerRow.getCell(10).value = "Observações";
    headerRow.getCell(11).value = "Status Pagamento";
    headerRow.getCell(12).value = "Saída de Casa";
    headerRow.getCell(13).value = "Chegada em Casa";
    headerRow.getCell(14).value = "Tempo de Trajeto";
    headerRow.getCell(15).value = "Tempo Fora de Casa";
    
    // 2. Planilha Gestão Financeira
    let finSheet = workbook.getWorksheet('Gestão Financeira');
    if (!finSheet) {
        finSheet = workbook.addWorksheet('Gestão Financeira');
        finSheet.getRow(1).values = ['ID', 'Data', 'Descrição', 'Tipo', 'Valor', 'Categoria'];
        finSheet.getRow(1).font = { bold: true };
    }
    
    // 3. Planilha Investimentos
    let investSheet = workbook.getWorksheet('Investimentos');
    if (!investSheet) {
        investSheet = workbook.addWorksheet('Investimentos');
        investSheet.getRow(1).values = ['ID', 'Data', 'Origem', 'Valor', 'Tipo'];
        investSheet.getRow(1).font = { bold: true };
    }
}

// Sincronizar Aporte Automático de 20% com base no Pagamento
function syncAutoInvestment(investSheet, dateStr, earnings, status) {
    const key = `Ponto de ${dateStr}`;
    
    // Buscar se o aporte automático já existe para este dia
    let targetRowIndex = null;
    const rowCount = investSheet.rowCount;
    for (let r = 2; r <= rowCount; r++) {
        const orig = investSheet.getRow(r).getCell(3).value;
        if (orig && String(orig) === key) {
            targetRowIndex = r;
            break;
        }
    }

    if (status === 'Pago' && earnings > 0) {
        const investVal = Number((earnings * 0.20).toFixed(2));
        if (targetRowIndex) {
            // Atualiza o valor atual
            investSheet.getRow(targetRowIndex).getCell(4).value = investVal;
        } else {
            // Adiciona novo aporte
            investSheet.addRow([
                'auto_inv_' + Date.now() + Math.floor(Math.random() * 100),
                new Date(dateStr + 'T00:00:00Z'),
                key,
                investVal,
                'Automático'
            ]);
        }
    } else {
        // Se voltou para "Pendente" ou os ganhos zeraram, deleta o aporte correspondente
        if (targetRowIndex) {
            investSheet.deleteRows(targetRowIndex, 1);
        }
    }
}

// Sincronizar de forma autônoma os Aportes Automáticos de 20% do faturamento Pago
async function autoSyncInvestments(workbook) {
    const sheet = workbook.getWorksheet('Controle de Horas');
    const investSheet = workbook.getWorksheet('Investimentos');
    
    // 1. Obter valor global da hora (Célula I2)
    let globalRate = 12.0;
    const i2Val = sheet.getRow(2).getCell(9).value;
    if (i2Val !== null && typeof i2Val === 'number') {
        globalRate = i2Val;
    } else if (i2Val !== null && typeof i2Val === 'object' && i2Val.result !== undefined) {
        globalRate = Number(i2Val.result);
    }
    
    // 2. Mapear aportes esperados com base nos registros do Controle de Horas
    const expectedInvestments = new Map(); // key: "Ponto de YYYY-MM-DD" -> { expectedVal, dateStr }
    const rowCount = sheet.rowCount;
    
    for (let r = 2; r <= rowCount; r++) {
        const row = sheet.getRow(r);
        const rawDate = row.getCell(1).value;
        if (!rawDate) continue;
        
        const dateStr = formatCellDate(rawDate);
        if (!dateStr) continue;
        
        const statusPag = row.getCell(11).value || 'Pendente';
        
        // Calcular ganhos do dia
        const e1 = formatCellTime(row.getCell(3).value);
        const s1 = formatCellTime(row.getCell(4).value);
        const e2 = formatCellTime(row.getCell(5).value);
        const s2 = formatCellTime(row.getCell(6).value);
        
        const customRateVal = row.getCell(9).value;
        let dayRate = globalRate;
        if (r !== 2 && customRateVal !== null) {
            if (typeof customRateVal === 'number') {
                dayRate = customRateVal;
            } else if (typeof customRateVal === 'object' && customRateVal.result !== undefined) {
                dayRate = Number(customRateVal.result);
            }
        }
        
        // Priorizar faturamento manual da Coluna 8
        const col8Val = row.getCell(8).value;
        let earnings = 0;
        if (col8Val !== null && col8Val !== undefined && col8Val !== '') {
            if (typeof col8Val === 'number') {
                earnings = col8Val;
            } else if (typeof col8Val === 'object' && col8Val.result !== undefined) {
                earnings = Number(col8Val.result);
            } else if (typeof col8Val === 'string' && !isNaN(Number(col8Val))) {
                earnings = Number(col8Val);
            }
        }
        
        if (earnings <= 0) {
            const workedMinutes = calculateWorkedMinutes(e1, s1, e2, s2);
            earnings = (workedMinutes / 60) * dayRate;
        }
        
        if (statusPag === 'Pago' && earnings > 0) {
            const expectedVal = Number((earnings * 0.20).toFixed(2));
            const key = `Ponto de ${dateStr}`;
            expectedInvestments.set(key, { expectedVal, dateStr });
        }
    }
    
    // 3. Rastrear registros automáticos existentes na planilha de Investimentos
    const invRowCount = investSheet.rowCount;
    const existingAutoRows = []; // { rowIndex, key, amount }
    
    for (let r = 2; r <= invRowCount; r++) {
        const row = investSheet.getRow(r);
        const id = row.getCell(1).value;
        if (!id) continue;
        
        const origin = row.getCell(3).value;
        const amount = Number(row.getCell(4).value || 0);
        const typeVal = String(row.getCell(5).value || '');
        const isAuto = typeVal.includes('Autom') || typeVal.includes('auto') || typeVal.includes('Auto');
        
        if (isAuto && origin && String(origin).startsWith('Ponto de ')) {
            existingAutoRows.push({
                rowIndex: r,
                key: String(origin),
                amount: amount
            });
        }
    }
    
    // 4. Analisar e aplicar reconciliação
    let hasChanges = false;
    const matchedKeys = new Set();
    const rowsToDelete = [];
    
    for (const existing of existingAutoRows) {
        if (expectedInvestments.has(existing.key)) {
            matchedKeys.add(existing.key);
        } else {
            // Se o ponto não é mais "Pago" ou foi apagado, marca para remoção
            rowsToDelete.push(existing.rowIndex);
        }
    }
    
    // Excluir registros obsoletos (de trás para frente para manter os índices estáveis)
    if (rowsToDelete.length > 0) {
        rowsToDelete.sort((a, b) => b - a);
        for (const rIndex of rowsToDelete) {
            investSheet.deleteRows(rIndex, 1);
        }
        hasChanges = true;
        console.log(`[SYNC-INVEST] Removidos ${rowsToDelete.length} aportes automáticos obsoletos.`);
    }
    
    // Adicionar registros faltantes
    for (const [key, { expectedVal, dateStr }] of expectedInvestments.entries()) {
        if (!matchedKeys.has(key)) {
            investSheet.addRow([
                'auto_inv_' + Date.now() + Math.floor(Math.random() * 1000),
                new Date(dateStr + 'T00:00:00Z'),
                key,
                expectedVal,
                'Automático'
            ]);
            hasChanges = true;
            console.log(`[SYNC-INVEST] Criado aporte automático faltante para ${key}: R$ ${expectedVal}`);
        }
    }
    
    return hasChanges;
}

// Obter dados combinados das planilhas
async function getSpreadsheetData() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(xlsxPath);
    
    await ensureSheetStructure(workbook);
    
    // Sincronização automática em tempo real para manter as planilhas 100% íntegras
    const hasChanges = await autoSyncInvestments(workbook);
    if (hasChanges) {
        createBackup(xlsxPath);
        await saveWorkbook(workbook, xlsxPath);
        console.log('[SYNC-INVEST] Aportes automáticos de 20% conciliados e gravados com sucesso!');
    }
    
    const sheet = workbook.getWorksheet('Controle de Horas');
    const finSheet = workbook.getWorksheet('Gestão Financeira');
    const investSheet = workbook.getWorksheet('Investimentos');
    
    // Taxa horária padrão em I2
    let globalRate = 12.0;
    const i2Val = sheet.getRow(2).getCell(9).value;
    if (i2Val !== null && typeof i2Val === 'number') {
        globalRate = i2Val;
    } else if (i2Val !== null && typeof i2Val === 'object' && i2Val.result !== undefined) {
        globalRate = Number(i2Val.result);
    }

    const rows = [];
    const rowCount = sheet.rowCount;
    let totalEarningsSinceJan = 0;
    let pendingEarnings = 0;

    for (let r = 2; r <= rowCount; r++) {
        const row = sheet.getRow(r);
        const rawDate = row.getCell(1).value;
        if (!rawDate) continue;

        const dateStr = formatCellDate(rawDate);
        const weekday = row.getCell(2).value;
        const e1 = formatCellTime(row.getCell(3).value);
        const s1 = formatCellTime(row.getCell(4).value);
        const e2 = formatCellTime(row.getCell(5).value);
        const s2 = formatCellTime(row.getCell(6).value);
        
        const customRateVal = row.getCell(9).value;
        let dayRate = globalRate;
        if (r !== 2 && customRateVal !== null) {
            if (typeof customRateVal === 'number') {
                dayRate = customRateVal;
            } else if (typeof customRateVal === 'object' && customRateVal.result !== undefined) {
                dayRate = Number(customRateVal.result);
            }
        }

        const obs = row.getCell(10).value || null;
        const statusPag = row.getCell(11).value || 'Pendente';
        const saidaCasa = formatCellTime(row.getCell(12).value);
        const chegadaCasa = formatCellTime(row.getCell(13).value);

        // Cálculos
        const workedMinutes = calculateWorkedMinutes(e1, s1, e2, s2);
        const hoursFraction = workedMinutes / 60;
        const hoursFormatted = minutesToTimeStr(workedMinutes);
        
        // Priorizar faturamento manual da Coluna 8 se existir, senão calcula
        const col8Val = row.getCell(8).value;
        let earnings = 0;
        let manualEarningsVal = null;
        if (col8Val !== null && col8Val !== undefined && col8Val !== '') {
            if (typeof col8Val === 'number') {
                earnings = col8Val;
                manualEarningsVal = col8Val;
            } else if (typeof col8Val === 'object' && col8Val.result !== undefined) {
                earnings = Number(col8Val.result);
                manualEarningsVal = Number(col8Val.result);
            } else if (typeof col8Val === 'string' && !isNaN(Number(col8Val))) {
                earnings = Number(col8Val);
                manualEarningsVal = Number(col8Val);
            }
        }
        
        if (earnings <= 0) {
            earnings = hoursFraction * dayRate;
        }

        const commuteMinutes = calculateCommuteMinutes(saidaCasa, e1, s1, e2, s2, chegadaCasa);
        const timeOutsideMinutes = calculateTimeOutsideMinutes(saidaCasa, chegadaCasa);

        const commuteFormatted = minutesToTimeStr(commuteMinutes);
        const timeOutsideFormatted = minutesToTimeStr(timeOutsideMinutes);

        totalEarningsSinceJan += earnings;
        if (statusPag === 'Pendente') {
            pendingEarnings += earnings;
        }

        rows.push({
            rowNum: r,
            date: dateStr,
            weekday: weekday,
            entrada1: e1,
            saida1: s1,
            entrada2: e2,
            saida2: s2,
            horasMinutos: hoursFormatted,
            horasFracionarias: hoursFraction,
            minutosTrabalhados: workedMinutes,
            ganhos: earnings,
            ganhosManuais: manualEarningsVal,
            valorHora: r === 2 ? globalRate : customRateVal,
            observacoes: obs,
            statusPagamento: statusPag,
            saidaCasa: saidaCasa,
            chegadaCasa: chegadaCasa,
            tempoTrajeto: commuteFormatted,
            minutosTrajeto: commuteMinutes,
            tempoForaCasa: timeOutsideFormatted,
            minutosForaCasa: timeOutsideMinutes
        });
    }

    // Carregar Lançamentos Financeiros (Aba Mobills)
    const financeEntries = [];
    const finRowCount = finSheet.rowCount;
    for (let r = 2; r <= finRowCount; r++) {
        const row = finSheet.getRow(r);
        const id = row.getCell(1).value;
        if (!id) continue;

        financeEntries.push({
            rowNum: r,
            id: String(id),
            date: formatCellDate(row.getCell(2).value),
            description: String(row.getCell(3).value || ''),
            type: String(row.getCell(4).value || ''),
            amount: Number(row.getCell(5).value || 0),
            category: String(row.getCell(6).value || 'Outros')
        });
    }

    // Carregar Investimentos (Aba Investimentos)
    const investEntries = [];
    const invRowCount = investSheet.rowCount;
    let totalInvested = 0;

    for (let r = 2; r <= invRowCount; r++) {
        const row = investSheet.getRow(r);
        const id = row.getCell(1).value;
        if (!id) continue;

        const val = Number(row.getCell(4).value || 0);
        totalInvested += val;

        investEntries.push({
            rowNum: r,
            id: String(id),
            date: formatCellDate(row.getCell(2).value),
            origin: String(row.getCell(3).value || 'Aporte Manual'),
            amount: val,
            type: (() => {
                const rawType = String(row.getCell(5).value || 'Manual');
                if (rawType.includes('Autom') || rawType.includes('auto') || rawType.includes('Auto')) {
                    return 'Automático';
                }
                return 'Manual';
            })()
        });
    }

    return {
        globalRate,
        totalEarningsSinceJan,
        pendingEarnings,
        totalInvested,
        rows,
        financeEntries,
        investEntries
    };
}

// API: Criar backup físico e fazer download imediato
app.get('/api/backup/download', async (req, res) => {
    try {
        await safeExcelOp(async () => {
            createBackup(xlsxPath);
        });
        
        // Transmitir arquivo Excel para o navegador
        res.download(xlsxPath, 'Controle_de_Horas_Trabalho-1.xlsx', (err) => {
            if (err) {
                console.error('[BACKUP-DOWNLOAD] Erro ao enviar arquivo:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Erro ao transferir arquivo de backup' });
                }
            }
        });
    } catch (err) {
        console.error('[BACKUP-ERROR] Falha na operação de backup:', err);
        res.status(500).json({ error: 'Erro interno ao processar backup' });
    }
});

// API: Retornar todos os dados e finanças combinados
app.get('/api/data', async (req, res) => {
    try {
        const data = await safeExcelOp(() => getSpreadsheetData());
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Falha ao carregar dados do arquivo Excel' });
    }
});

// API: Alterar valor global da hora (Célula I2)
app.post('/api/rate', async (req, res) => {
    try {
        const { globalRate } = req.body;
        if (globalRate === undefined || isNaN(Number(globalRate))) {
            return res.status(400).json({ error: 'Valor da hora inválido' });
        }

        await safeExcelOp(async () => {
            createBackup(xlsxPath);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);
            
            const sheet = workbook.getWorksheet('Controle de Horas');
            sheet.getRow(2).getCell(9).value = Number(globalRate);
            await saveWorkbook(workbook, xlsxPath);
        });

        res.json({ success: true, message: 'Valor global de hora atualizado com sucesso' });
    } catch (err) {
        return handleExcelError(res, err, 'Erro ao gravar taxa horária');
    }
});

// API: Edição manual absoluta de qualquer dia (Colunas 1 a 15)
app.post('/api/save', async (req, res) => {
    try {
        const {
            rowNum,
            entrada1,
            saida1,
            entrada2,
            saida2,
            valorHora,
            observacoes,
            statusPagamento,
            saidaCasa,
            chegadaCasa,
            date,
            weekday,
            ganhos // Capture manual earnings!
        } = req.body;

        if (!rowNum || isNaN(Number(rowNum))) {
            return res.status(400).json({ error: 'Número de linha inválido' });
        }

        await safeExcelOp(async () => {
            createBackup(xlsxPath);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);
            
            const sheet = workbook.getWorksheet('Controle de Horas');
            const investSheet = workbook.getWorksheet('Investimentos');
            const row = sheet.getRow(Number(rowNum));

            // Edição absoluta de Data e Dia da Semana
            if (date) {
                row.getCell(1).value = new Date(date + 'T00:00:00Z');
            }
            if (weekday) {
                row.getCell(2).value = weekday;
            }

            // Grava Marcações de Horas
            row.getCell(3).value = entrada1 || null;
            row.getCell(4).value = saida1 || null;
            row.getCell(5).value = entrada2 || null;
            row.getCell(6).value = saida2 || null;

            // Grava Taxa de Hora Individual
            if (Number(rowNum) === 2) {
                if (valorHora !== undefined && valorHora !== null) {
                    row.getCell(9).value = Number(valorHora);
                }
            } else {
                row.getCell(9).value = (valorHora !== undefined && valorHora !== null && valorHora !== '') ? Number(valorHora) : null;
            }

            // Grava Observações
            row.getCell(10).value = observacoes || null;

            // Grava Status Pagamento
            const currentStatus = statusPagamento || 'Pendente';
            row.getCell(11).value = currentStatus;

            // Grava Saída e Chegada em Casa
            row.getCell(12).value = saidaCasa || null;
            row.getCell(13).value = chegadaCasa || null;

            // Grava recálculo de trajetos
            const workedMinutes = calculateWorkedMinutes(entrada1, saida1, entrada2, saida2);
            const commuteMinutes = calculateCommuteMinutes(saidaCasa, entrada1, saida1, entrada2, saida2, chegadaCasa);
            const timeOutsideMinutes = calculateTimeOutsideMinutes(saidaCasa, chegadaCasa);

            row.getCell(14).value = commuteMinutes > 0 ? minutesToTimeStr(commuteMinutes) : null;
            row.getCell(15).value = timeOutsideMinutes > 0 ? minutesToTimeStr(timeOutsideMinutes) : null;

            // Determinar faturamento
            const r2 = sheet.getRow(2);
            const i2Val = r2.getCell(9).value;
            let globalRateVal = 12.0;
            if (i2Val !== null) {
                if (typeof i2Val === 'number') {
                    globalRateVal = i2Val;
                } else if (typeof i2Val === 'object' && i2Val.result !== undefined) {
                    globalRateVal = Number(i2Val.result);
                }
            }

            let dayRate = globalRateVal;
            const customRateVal = row.getCell(9).value;
            if (Number(rowNum) !== 2 && customRateVal !== null) {
                if (typeof customRateVal === 'number') {
                    dayRate = customRateVal;
                } else if (typeof customRateVal === 'object' && customRateVal.result !== undefined) {
                    dayRate = Number(customRateVal.result);
                }
            }

            let finalEarnings = 0;
            if (ganhos !== undefined && ganhos !== null && ganhos !== '') {
                finalEarnings = Number(ganhos);
                row.getCell(8).value = finalEarnings;
            } else {
                finalEarnings = Number(((workedMinutes / 60) * dayRate).toFixed(2));
                row.getCell(8).value = finalEarnings;
            }

            // Sincronizar Aporte Automático de 20%
            const targetDateStr = date || formatCellDate(row.getCell(1).value);
            syncAutoInvestment(investSheet, targetDateStr, finalEarnings, currentStatus);

            await saveWorkbook(workbook, xlsxPath);
        });

        res.json({ success: true, message: 'Dados salvos com sucesso na planilha!' });
    } catch (err) {
        return handleExcelError(res, err, 'Erro ao gravar edições manuais na planilha');
    }
});

// API: Marcar lote como Pago de forma retroativa (E gera investimentos correspondentes)
app.post('/api/pay-batch', async (req, res) => {
    try {
        const { dateLimit } = req.body;
        if (!dateLimit) {
            return res.status(400).json({ error: 'Data limite de corte inválida' });
        }

        await safeExcelOp(async () => {
            createBackup(xlsxPath);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);
            
            const sheet = workbook.getWorksheet('Controle de Horas');
            const investSheet = workbook.getWorksheet('Investimentos');
            
            // Taxa horária padrão em I2
            let globalRate = 12.0;
            const i2Val = sheet.getRow(2).getCell(9).value;
            if (i2Val !== null && typeof i2Val === 'number') {
                globalRate = i2Val;
            } else if (i2Val !== null && typeof i2Val === 'object' && i2Val.result !== undefined) {
                globalRate = Number(i2Val.result);
            }

            const rowCount = sheet.rowCount;
            const cutOffTime = new Date(dateLimit + 'T23:59:59Z').getTime();

            for (let r = 2; r <= rowCount; r++) {
                const row = sheet.getRow(r);
                const rawDate = row.getCell(1).value;
                if (rawDate) {
                    const dateStr = formatCellDate(rawDate);
                    const rowTime = new Date(dateStr + 'T00:00:00Z').getTime();
                    if (rowTime <= cutOffTime) {
                        row.getCell(11).value = 'Pago';
                        
                        // Calcular faturamento da linha
                        const e1 = formatCellTime(row.getCell(3).value);
                        const s1 = formatCellTime(row.getCell(4).value);
                        const e2 = formatCellTime(row.getCell(5).value);
                        const s2 = formatCellTime(row.getCell(6).value);
                        
                        const customRateVal = row.getCell(9).value;
                        let dayRate = globalRate;
                        if (r !== 2 && customRateVal !== null) {
                            if (typeof customRateVal === 'number') {
                                dayRate = customRateVal;
                            } else if (typeof customRateVal === 'object' && customRateVal.result !== undefined) {
                                dayRate = Number(customRateVal.result);
                            }
                        }
                        
                        const workedMinutes = calculateWorkedMinutes(e1, s1, e2, s2);
                        const earnings = (workedMinutes / 60) * dayRate;
                        
                        // Sincronizar aporte automático
                        syncAutoInvestment(investSheet, dateStr, earnings, 'Pago');
                    }
                }
            }
            await saveWorkbook(workbook, xlsxPath);
        });

        res.json({ success: true, message: `Todos os registros até ${dateLimit} foram quitados e 20% reinvestido!` });
    } catch (err) {
        return handleExcelError(res, err, 'Erro ao quitar pagamentos em lote na planilha');
    }
});

// API: Gestão Financeira - Salvar Lançamento (Com suporte a edição)
app.post('/api/finance/save', async (req, res) => {
    try {
        const { id, date, description, type, amount, category } = req.body;
        
        if (!date || !description || !type || isNaN(Number(amount))) {
            return res.status(400).json({ error: 'Parâmetros financeiros obrigatórios inválidos' });
        }

        await safeExcelOp(async () => {
            createBackup(xlsxPath);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);

            const finSheet = workbook.getWorksheet('Gestão Financeira');
            const rowCount = finSheet.rowCount;
            
            let targetRow = null;
            const entryId = id || 'fin_' + Date.now() + Math.floor(Math.random() * 100);

            if (id) {
                for (let r = 2; r <= rowCount; r++) {
                    const cellId = finSheet.getRow(r).getCell(1).value;
                    if (cellId && String(cellId) === String(id)) {
                        targetRow = finSheet.getRow(r);
                        break;
                    }
                }
            }

            if (!targetRow) {
                targetRow = finSheet.addRow([]);
            }

            targetRow.getCell(1).value = entryId;
            targetRow.getCell(2).value = new Date(date + 'T00:00:00Z');
            targetRow.getCell(3).value = description;
            targetRow.getCell(4).value = type;
            targetRow.getCell(5).value = Number(amount);
            targetRow.getCell(6).value = category || 'Outros';

            await saveWorkbook(workbook, xlsxPath);
        });

        res.json({ success: true, message: 'Lançamento financeiro gravado com sucesso!' });
    } catch (err) {
        return handleExcelError(res, err, 'Erro ao gravar transação na planilha');
    }
});

// API: Gestão Financeira - Excluir Lançamento
app.post('/api/finance/delete', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID de transação financeiro ausente' });
        }

        await safeExcelOp(async () => {
            createBackup(xlsxPath);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);

            const finSheet = workbook.getWorksheet('Gestão Financeira');
            const rowCount = finSheet.rowCount;
            let targetRowIndex = null;

            for (let r = 2; r <= rowCount; r++) {
                const cellId = finSheet.getRow(r).getCell(1).value;
                if (cellId && String(cellId) === String(id)) {
                    targetRowIndex = r;
                    break;
                }
            }

            if (targetRowIndex) {
                finSheet.deleteRows(targetRowIndex, 1);
                await saveWorkbook(workbook, xlsxPath);
            }
        });

        res.json({ success: true, message: 'Lançamento financeiro excluído!' });
    } catch (err) {
        return handleExcelError(res, err, 'Falha ao deletar transação financeira');
    }
});

// API: Investimentos - Salvar ou Editar Aporte Manual
app.post('/api/invest/save', async (req, res) => {
    try {
        const { id, date, origin, amount } = req.body;
        
        if (!date || !origin || isNaN(Number(amount))) {
            return res.status(400).json({ error: 'Parâmetros de investimento obrigatórios inválidos' });
        }

        await safeExcelOp(async () => {
            createBackup(xlsxPath);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);

            const investSheet = workbook.getWorksheet('Investimentos');
            const rowCount = investSheet.rowCount;
            
            let targetRow = null;
            const investId = id || 'inv_' + Date.now() + Math.floor(Math.random() * 100);

            if (id) {
                for (let r = 2; r <= rowCount; r++) {
                    const cellId = investSheet.getRow(r).getCell(1).value;
                    if (cellId && String(cellId) === String(id)) {
                        targetRow = investSheet.getRow(r);
                        break;
                    }
                }
            }

            if (!targetRow) {
                targetRow = investSheet.addRow([]);
            }

            targetRow.getCell(1).value = investId;
            targetRow.getCell(2).value = new Date(date + 'T00:00:00Z');
            targetRow.getCell(3).value = origin;
            targetRow.getCell(4).value = Number(amount);
            targetRow.getCell(5).value = 'Manual';

            await saveWorkbook(workbook, xlsxPath);
        });

        res.json({ success: true, message: 'Registro de investimento gravado com sucesso!' });
    } catch (err) {
        return handleExcelError(res, err, 'Erro ao gravar transação de investimento');
    }
});

// API: Investimentos - Excluir Aporte
app.post('/api/invest/delete', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID de transação de investimento ausente' });
        }

        await safeExcelOp(async () => {
            createBackup(xlsxPath);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);

            const investSheet = workbook.getWorksheet('Investimentos');
            const rowCount = investSheet.rowCount;
            let targetRowIndex = null;

            for (let r = 2; r <= rowCount; r++) {
                const cellId = investSheet.getRow(r).getCell(1).value;
                if (cellId && String(cellId) === String(id)) {
                    targetRowIndex = r;
                    break;
                }
            }

            if (targetRowIndex) {
                investSheet.deleteRows(targetRowIndex, 1);
                await saveWorkbook(workbook, xlsxPath);
            }
        });

        res.json({ success: true, message: 'Investimento excluído da planilha!' });
    } catch (err) {
        return handleExcelError(res, err, 'Falha ao deletar transação de investimento');
    }
});

// API: Bater Ponto Rápido (1 Toque)
app.post('/api/clock-in', async (req, res) => {
    try {
        const { date, time } = req.body;
        if (!date || !time) {
            return res.status(400).json({ error: 'Parâmetros de data ou hora ausentes.' });
        }
        
        let result = await safeExcelOp(async () => {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);
            
            const sheet = workbook.getWorksheet('Controle de Horas');
            const rowCount = sheet.rowCount;
            
            let targetRowNum = null;
            for (let r = 2; r <= rowCount; r++) {
                const rawDate = sheet.getRow(r).getCell(1).value;
                if (rawDate && formatCellDate(rawDate) === date) {
                    targetRowNum = r;
                    break;
                }
            }
            
            if (!targetRowNum) {
                return { error: `Dia de hoje (${date}) não encontrado na planilha.` };
            }
            
            createBackup(xlsxPath);
            const row = sheet.getRow(targetRowNum);
            
            const entrada1 = formatCellTime(row.getCell(3).value);
            const saida1 = formatCellTime(row.getCell(4).value);
            const entrada2 = formatCellTime(row.getCell(5).value);
            const saida2 = formatCellTime(row.getCell(6).value);

            // Prevenir cliques múltiplos no mesmo minuto
            let lastFilledTime = null;
            if (saida2) lastFilledTime = saida2;
            else if (entrada2) lastFilledTime = entrada2;
            else if (saida1) lastFilledTime = saida1;
            else if (entrada1) lastFilledTime = entrada1;

            if (lastFilledTime && lastFilledTime === time) {
                return { error: `Você já bateu ponto às ${time}. Aguarde pelo menos 1 minuto para evitar duplicados.` };
            }
            
            let slotName = '';
            if (!entrada1) {
                row.getCell(3).value = time;
                slotName = 'Entrada 1';
            } else if (!saida1) {
                row.getCell(4).value = time;
                slotName = 'Saída 1';
            } else if (!entrada2) {
                row.getCell(5).value = time;
                slotName = 'Entrada 2';
            } else if (!saida2) {
                row.getCell(6).value = time;
                slotName = 'Saída 2';
            } else {
                return { error: 'Todos os turnos de hoje já foram preenchidos!' };
            }
            
            // Recalcular worked minutes e trajetos
            const nE1 = row.getCell(3).value;
            const nS1 = row.getCell(4).value;
            const nE2 = row.getCell(5).value;
            const nS2 = row.getCell(6).value;
            
            const saidaCasa = formatCellTime(row.getCell(12).value);
            const chegadaCasa = formatCellTime(row.getCell(13).value);
            
            const workedMinutes = calculateWorkedMinutes(nE1, nS1, nE2, nS2);
            const commuteMinutes = calculateCommuteMinutes(saidaCasa, nE1, nS1, nE2, nS2, chegadaCasa);
            const timeOutsideMinutes = calculateTimeOutsideMinutes(saidaCasa, chegadaCasa);
            
            row.getCell(14).value = commuteMinutes > 0 ? minutesToTimeStr(commuteMinutes) : null;
            row.getCell(15).value = timeOutsideMinutes > 0 ? minutesToTimeStr(timeOutsideMinutes) : null;
            
            await saveWorkbook(workbook, xlsxPath);
            
            return {
                success: true,
                message: `Ponto de ${slotName} registrado com sucesso às ${time}!`
            };
        });
        
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.json(result);
    } catch (err) {
        return handleExcelError(res, err, 'Erro interno ao registrar ponto rápido');
    }
});

// API: Automatização Android via Wi-Fi do MacroDroid
app.post('/api/auto-arrival', async (req, res) => {
    try {
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0');
            
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + 
            String(now.getMinutes()).padStart(2, '0');

        let result = await safeExcelOp(async () => {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(xlsxPath);
            await ensureSheetStructure(workbook);
            
            const sheet = workbook.getWorksheet('Controle de Horas');
            const rowCount = sheet.rowCount;
            
            let targetRowNum = null;
            for (let r = 2; r <= rowCount; r++) {
                const rawDate = sheet.getRow(r).getCell(1).value;
                if (rawDate && formatCellDate(rawDate) === dateStr) {
                    targetRowNum = r;
                    break;
                }
            }

            if (!targetRowNum) {
                return { error: `Dia de hoje (${dateStr}) não encontrado na planilha.` };
            }

            createBackup(xlsxPath);
            const row = sheet.getRow(targetRowNum);
            
            // Ler marcações de trabalho
            const entrada1 = formatCellTime(row.getCell(3).value);
            const saida1 = formatCellTime(row.getCell(4).value);
            const entrada2 = formatCellTime(row.getCell(5).value);
            const saida2 = formatCellTime(row.getCell(6).value);
            
            // O salvamento automático da hora que chego em casa deve se dar apenas nos dias em que eu preencho a hora de entrada e a hora de saida do trabalho
            if (!entrada1 || (!saida1 && !saida2)) {
                return { error: `Chegada automática via Wi-Fi ignorada: Horário de entrada e saída do trabalho não preenchidos no dia de hoje (${dateStr}).` };
            }

            createBackup(xlsxPath);
            
            // Gravar Chegada em Casa (M/13)
            row.getCell(13).value = timeStr;
            const saidaCasa = formatCellTime(row.getCell(12).value);
            
            // recalcular trajetos salvos
            const commuteMinutes = calculateCommuteMinutes(saidaCasa, entrada1, saida1, entrada2, saida2, timeStr);
            const timeOutsideMinutes = calculateTimeOutsideMinutes(saidaCasa, timeStr);

            row.getCell(14).value = commuteMinutes > 0 ? minutesToTimeStr(commuteMinutes) : null;
            row.getCell(15).value = timeOutsideMinutes > 0 ? minutesToTimeStr(timeOutsideMinutes) : null;

            await saveWorkbook(workbook, xlsxPath);
            
            console.log(`[AUTOMAÇÃO] Chegada em casa registrada automaticamente às ${timeStr} via Wi-Fi no dia ${dateStr}!`);
            
            return {
                success: true,
                message: `Chegada em casa registrada automaticamente via Wi-Fi às ${timeStr}!`,
                data: {
                    date: dateStr,
                    chegadaCasa: timeStr,
                    tempoTrajeto: minutesToTimeStr(commuteMinutes),
                    tempoForaCasa: minutesToTimeStr(timeOutsideMinutes)
                }
            };
        });

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.json(result);
    } catch (err) {
        return handleExcelError(res, err, 'Falha interna na automação de conexão Wi-Fi');
    }
});

// Inicia Servidor, descobre IPs locais e cria Túnel Externo Seguro
// Variável global para armazenar a URL atual do túnel e do APK
let currentTunnelUrl = '';
let currentApkUrl = '';
let sshProcess = null;

// Rota de download do APK com controle de status
let isApkCompiling = false;
let apkCompilationError = null;

app.get('/controle-horas.apk', (req, res) => {
    const apkPath = path.join(basePath, 'controle-horas.apk');
    if (fs.existsSync(apkPath)) {
        res.setHeader('Content-Disposition', 'attachment; filename=controle-horas.apk');
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        return res.sendFile(apkPath);
    }
    
    if (isApkCompiling) {
        return res.status(503).send(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Compilando Aplicativo...</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; color: #fff; text-align: center; padding: 50px; }
                        .spinner { border: 4px solid rgba(255,255,255,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #9d4edd; animation: spin 1s linear infinite; margin: 30px auto; }
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        h1 { color: #9d4edd; }
                    </style>
                </head>
                <body>
                    <h1>O Aplicativo está sendo compilado!</h1>
                    <p>O servidor está gerando o seu APK personalizado pré-configurado na nuvem via PWABuilder.</p>
                    <div class="spinner"></div>
                    <p>Por favor, aguarde cerca de 30 a 60 segundos e <strong>atualize esta página</strong>.</p>
                </body>
            </html>
        `);
    }

    if (apkCompilationError) {
        return res.status(500).send(`Erro na compilação do APK: ${apkCompilationError}. Verifique o console do servidor.`);
    }

    return res.status(404).send('APK não disponível e não está sendo compilado. Certifique-se de que o túnel de internet está ativo.');
});

// API: Obter informações de rede para conexão do celular
app.get('/api/network-info', (req, res) => {
    const networkInterfaces = os.networkInterfaces();
    const ips = [];
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    res.json({
        tunnelUrl: currentTunnelUrl || null,
        apkUrl: currentApkUrl || null,
        localIps: ips,
        port: PORT
    });
});

// Função auxiliar para atualizar o arquivo tunnel_url.json com a URL do túnel e do APK
function updateTunnelUrlJson() {
    const jsonFilePath = path.join(basePath, 'tunnel_url.json');
    const data = {
        url: currentTunnelUrl || null,
        apkUrl: currentApkUrl || null,
        updated: new Date().toISOString()
    };
    try {
        fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('  [ERRO] Falha ao escrever tunnel_url.json:', e.message);
    }
}

// Função auxiliar para limpar informações do túnel e excluir os arquivos de referência
function clearTunnelUrlJson() {
    currentTunnelUrl = '';
    currentApkUrl = '';
    const urlFilePath = path.join(basePath, 'url_acesso.txt');
    const jsonFilePath = path.join(basePath, 'tunnel_url.json');
    try { fs.unlinkSync(urlFilePath); } catch (e) {}
    try { fs.unlinkSync(jsonFilePath); } catch (e) {}
}

// Função para iniciar e reconectar o túnel remoto automaticamente (Tenta Serveo SSH primeiro, depois Localtunnel)
async function startTunnel(retryCount = 0) {
    const urlFilePath = path.join(basePath, 'url_acesso.txt');

    if (sshProcess) {
        try { sshProcess.kill(); } catch (e) {}
        sshProcess = null;
    }

    console.log(`  [INFO] Estabelecendo conexão para acesso remoto (Tentativa ${retryCount + 1})...`);

    try {
        // Tentar o túnel localhost.run primeiro via SSH nativo
        const lhrUrl = await tryLocalhostRunTunnel();
        currentTunnelUrl = lhrUrl;

        console.log();
        console.log(`  ===================================================`);
        console.log(`  TÚNEL REMOTO ATIVO (LOCALHOST.RUN):`);
        console.log(`  > ${currentTunnelUrl}`);
        console.log();
        console.log(`  Escaneie o QR Code abaixo para abrir no celular:`);
        qrcode.generate(currentTunnelUrl, { small: true });
        console.log(`  ===================================================`);

        fs.writeFileSync(urlFilePath, currentTunnelUrl, 'utf8');
        updateTunnelUrlJson();

        // Disparar compilação do APK em segundo plano
        generateApkPackage(currentTunnelUrl).catch(err => {
            console.error('[APK-ERRO] Falha na compilação em segundo plano:', err.message);
        });

    } catch (err) {
        console.warn(`  [Aviso] localhost.run indisponível (${err.message}). Tentando fallback com Serveo SSH...`);

        try {
            // Tentar o túnel alternativo (Serveo) via SSH nativo
            const serveoUrl = await tryServeoTunnel();
            currentTunnelUrl = serveoUrl;

            console.log();
            console.log(`  ===================================================`);
            console.log(`  TÚNEL REMOTO ATIVO (SERVEO - TUNEL ALTERNATIVO):`);
            console.log(`  > ${currentTunnelUrl}`);
            console.log();
            console.log(`  Escaneie o QR Code abaixo para abrir no celular:`);
            qrcode.generate(currentTunnelUrl, { small: true });
            console.log(`  ===================================================`);

            fs.writeFileSync(urlFilePath, currentTunnelUrl, 'utf8');
            updateTunnelUrlJson();

            // Disparar compilação do APK em segundo plano
            generateApkPackage(currentTunnelUrl).catch(err => {
                console.error('[APK-ERRO] Falha na compilação em segundo plano:', err.message);
            });

        } catch (serveoErr) {
            console.warn(`  [Aviso] Serveo SSH indisponível (${serveoErr.message}). Tentando fallback com localtunnel...`);

            try {
                const tunnel = await localtunnel({ port: PORT });
                currentTunnelUrl = tunnel.url;

                console.log();
                console.log(`  ===================================================`);
                console.log(`  TÚNEL REMOTO ATIVO (LOCALTUNNEL FALLBACK):`);
                console.log(`  > ${currentTunnelUrl}`);
                console.log();
                console.log(`  Escaneie o QR Code abaixo para abrir no celular:`);
                qrcode.generate(currentTunnelUrl, { small: true });
                console.log(`  ===================================================`);

                fs.writeFileSync(urlFilePath, currentTunnelUrl, 'utf8');
                updateTunnelUrlJson();

                // Disparar compilação do APK
                generateApkPackage(currentTunnelUrl).catch(err => {
                    console.error('[APK-ERRO] Falha na compilação em segundo plano:', err.message);
                });

                tunnel.on('close', () => {
                    console.log('  [INFO] Túnel localtunnel fechado. Tentando reconectar em 10 segundos...');
                    clearTunnelUrlJson();
                    setTimeout(() => startTunnel(retryCount + 1), 10000);
                });

                tunnel.on('error', (err) => {
                    console.error('  [Erro] Erro no localtunnel:', err.message);
                    try { tunnel.close(); } catch (e) {}
                });

            } catch (ltErr) {
                console.error('  [Erro] Falha ao iniciar todos os túneis (localhost.run, Serveo e localtunnel):', ltErr.message);
                console.log('  [INFO] Tentando novamente toda a pilha de conexões em 15 segundos...');
                setTimeout(() => startTunnel(retryCount + 1), 15000);
            }
        }
    }
}

// Função para estabelecer túnel via SSH com o localhost.run
function tryLocalhostRunTunnel() {
    return new Promise((resolve, reject) => {
        console.log('  [INFO] Iniciando túnel SSH do localhost.run...');
        const ssh = spawn('ssh', [
            '-o', 'StrictHostKeyChecking=no',
            '-R', `80:localhost:${PORT}`,
            'nokey@localhost.run'
        ]);

        sshProcess = ssh;
        let resolved = false;
        let outputBuffer = '';

        const timer = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                ssh.kill();
                reject(new Error('Timeout de 15s excedido sem resposta do localhost.run'));
            }
        }, 15000);

        const checkOutput = (data) => {
            const str = data.toString();
            outputBuffer += str;
            const match = str.match(/https:\/\/[a-zA-Z0-9.-]+\.lhr\.(?:life|rocks)/);
            if (match && !resolved) {
                resolved = true;
                clearTimeout(timer);
                resolve(match[0]);
            }
        };

        ssh.stdout.on('data', checkOutput);
        ssh.stderr.on('data', checkOutput);

        ssh.on('close', (code) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                reject(new Error(`Conexão SSH do localhost.run fechada com código de saída ${code}`));
            } else {
                console.log('  [INFO] Conexão do localhost.run caiu. Tentando reconectar...');
                clearTunnelUrlJson();
                setTimeout(() => startTunnel(0), 10000);
            }
        });

        ssh.on('error', (err) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                reject(err);
            }
        });
    });
}

// Função para estabelecer túnel via SSH com o Serveo
function tryServeoTunnel() {
    return new Promise((resolve, reject) => {
        console.log('  [INFO] Iniciando túnel SSH do Serveo...');
        const ssh = spawn('ssh', [
            '-o', 'StrictHostKeyChecking=no',
            '-R', `80:localhost:${PORT}`,
            'serveo.net'
        ]);

        sshProcess = ssh;
        let resolved = false;
        let outputBuffer = '';

        const timer = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                ssh.kill();
                reject(new Error('Timeout de 15s excedido sem resposta do serveo.net'));
            }
        }, 15000);

        ssh.stdout.on('data', (data) => {
            const str = data.toString();
            outputBuffer += str;
            const match = str.match(/https:\/\/(?!console\.)[a-zA-Z0-9.-]+\.(?:serveo\.net|serveousercontent\.com)/);
            if (match && !resolved) {
                resolved = true;
                clearTimeout(timer);
                resolve(match[0]);
            }
        });

        ssh.stderr.on('data', (data) => {
            const str = data.toString();
            if (str.includes('Warning') || str.includes('Forwarding')) {
                const match = str.match(/https:\/\/(?!console\.)[a-zA-Z0-9.-]+\.(?:serveo\.net|serveousercontent\.com)/);
                if (match && !resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    resolve(match[0]);
                }
            }
        });

        ssh.on('close', (code) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                reject(new Error(`Conexão SSH fechada com código de saída ${code}`));
            } else {
                console.log('  [INFO] Conexão do Serveo caiu. Tentando reconectar...');
                clearTunnelUrlJson();
                setTimeout(() => startTunnel(0), 10000);
            }
        });

        ssh.on('error', (err) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                reject(err);
            }
        });
    });
}

// Função auxiliar de DNS over HTTPS para resolver IP de domínios ignorando restrições locais do Windows
function resolveHostIp(hostname) {
    const tryGoogle = () => new Promise((resolve, reject) => {
        const req = https.get(`https://8.8.8.8/resolve?name=${encodeURIComponent(hostname)}&type=A`, {
            rejectUnauthorized: false,
            timeout: 5000
        }, (res) => {
            if (res.statusCode !== 200) return reject(new Error('Google DoH status ' + res.statusCode));
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.Answer && json.Answer.length > 0) {
                        const aRecord = json.Answer.find(ans => ans.type === 1);
                        if (aRecord && aRecord.data) return resolve(aRecord.data);
                    }
                    reject(new Error('No A record'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Google DoH timeout')); });
    });

    const tryCloudflare = () => new Promise((resolve, reject) => {
        const req = https.get(`https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}&type=A`, {
            headers: { 'Accept': 'application/dns-json' },
            rejectUnauthorized: false,
            timeout: 5000
        }, (res) => {
            if (res.statusCode !== 200) return reject(new Error('Cloudflare DoH status ' + res.statusCode));
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.Answer && json.Answer.length > 0) {
                        const aRecord = json.Answer.find(ans => ans.type === 1);
                        if (aRecord && aRecord.data) return resolve(aRecord.data);
                    }
                    reject(new Error('No A record'));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Cloudflare DoH timeout')); });
    });

    return tryGoogle().catch(err => {
        console.warn(`  [DNS] Falha no Google DoH (${err.message}). Tentando Cloudflare DoH...`);
        return tryCloudflare();
    });
}

// Função para fazer o upload do APK para o Catbox.moe
function uploadToCatbox(filePath) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
        const filename = path.basename(filePath);
        
        let fileBuffer;
        try {
            fileBuffer = fs.readFileSync(filePath);
        } catch (err) {
            return reject(err);
        }
        
        let body = [];
        body.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="reqtype"\r\n\r\nfileupload\r\n`));
        body.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="fileToUpload"; filename="${filename}"\r\nContent-Type: application/vnd.android.package-archive\r\n\r\n`));
        body.push(fileBuffer);
        body.push(Buffer.from(`\r\n--${boundary}--\r\n`));
        
        const payload = Buffer.concat(body);
        
        const options = {
            hostname: 'catbox.moe',
            path: '/user/api.php',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Connection': 'keep-alive'
            },
            timeout: 60000
        };
        
        const req = https.request(options, (res) => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(resData.trim());
                } else {
                    reject(new Error(`Catbox upload failed with status ${res.statusCode}: ${resData}`));
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Catbox upload timeout')); });
        
        req.write(payload);
        req.end();
    });
}

// Função para gerar o APK via API do PWABuilder
function generateApkPackage(tunnelUrl) {
    if (isApkCompiling) {
        console.log('  [APK] Uma compilação de APK já está em andamento. Ignorando.');
        return Promise.resolve();
    }

    isApkCompiling = true;
    apkCompilationError = null;

    console.log();
    console.log(`  ===================================================`);
    console.log(`  [APK] INICIANDO COMPILAÇÃO DO APK NA NUVEM...`);
    console.log(`  [APK] URL de Origem: ${tunnelUrl}`);
    console.log(`  [APK] Isso pode levar de 30 a 60 segundos...`);
    console.log(`  ===================================================`);

    const zipPath = path.join(basePath, 'fetchedTemplate.zip');
    const extractPath = path.join(basePath, 'decompressedTemplate');
    const apkDestPath = path.join(basePath, 'controle-horas.apk');

    try { fs.unlinkSync(zipPath); } catch (e) {}
    try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (e) {}

    return new Promise((resolve, reject) => {
        let hostNameOnly = 'localhost';
        try {
            hostNameOnly = new URL(tunnelUrl).host;
        } catch (err) {
            console.error('  [APK-ERRO] Erro ao extrair host do túnel URL:', err.message);
        }

        const postData = JSON.stringify({
            appVersion: "1.0.0.0",
            appVersionCode: 1,
            backgroundColor: "#0b0f19",
            display: "standalone",
            enableNotifications: true,
            enableSiteSettingsShortcut: true,
            fallbackType: "customtabs",
            features: {
                locationDelegation: { enabled: true },
                playBilling: { enabled: false }
            },
            host: hostNameOnly,
            iconUrl: `${tunnelUrl}/clock-512.png`,
            includeSourceCode: false,
            isChromeOSOnly: false,
            isMetaQuest: false,
            launcherName: "Controle de Horas",
            maskableIconUrl: "",
            monochromeIconUrl: "",
            name: "Controle de Horas Premium",
            navigationColor: "#0b0f19",
            navigationColorDark: "#0b0f19",
            navigationDividerColor: "#0b0f19",
            navigationDividerColorDark: "#0b0f19",
            orientation: "any",
            packageId: "com.andreturco.horascontrole",
            shortcuts: [],
            signing: {
                file: null,
                alias: "my-key-alias",
                fullName: "Controle de Horas Admin",
                organization: "PWABuilder",
                organizationalUnit: "Engineering",
                countryCode: "US",
                keyPassword: "",
                storePassword: ""
            },
            signingMode: "new",
            splashScreenFadeOutDuration: 300,
            startUrl: "/",
            themeColor: "#0b0f19",
            themeColorDark: "#0b0f19",
            webManifestUrl: `${tunnelUrl}/manifest.json`,
            pwaUrl: tunnelUrl,
            fullScopeUrl: `${tunnelUrl}/`,
            minSdkVersion: 23
        });

        const url = 'https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage';
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'platform-identifier': 'PWABuilder',
                'platform-identifier-version': '1.0.0',
                'correlation-id': 'controle-horas-correlation-id'
            },
            timeout: 90000,
            lookup: (hostname, opts, cb) => {
                resolveHostIp(hostname)
                    .then(ip => {
                        console.log(`  [DNS-DOH] Resolvido ${hostname} -> ${ip}`);
                        if (opts.all) {
                            cb(null, [{ address: ip, family: 4 }]);
                        } else {
                            cb(null, ip, 4);
                        }
                    })
                    .catch(err => {
                        console.warn(`  [DNS-AVISO] Falha no DoH para ${hostname} (${err.message}). Usando lookup padrão do Windows...`);
                        dns.lookup(hostname, opts, cb);
                    });
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                let errData = '';
                res.on('data', chunk => errData += chunk);
                res.on('end', () => {
                    const errMsg = `PWABuilder API retornou erro ${res.statusCode}: ${errData}`;
                    isApkCompiling = false;
                    apkCompilationError = errMsg;
                    reject(new Error(errMsg));
                });
                return;
            }

            const fileStream = fs.createWriteStream(zipPath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log('  [APK] Download concluído. Extraindo pacote no Windows...');
                
                const psCommand = `powershell -Command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${extractPath}'; Get-ChildItem -Path '${extractPath}' -Filter '*.apk' -Recurse | Select-Object -First 1 | Move-Item -Destination '${apkDestPath}' -Force"`;
                
                exec(psCommand, (error, stdout, stderr) => {
                    try { fs.unlinkSync(zipPath); } catch (e) {}
                    try { fs.rmSync(extractPath, { recursive: true, force: true }); } catch (e) {}

                    if (error) {
                        const errMsg = `Erro ao extrair/mover o APK: ${stderr || error.message}`;
                        isApkCompiling = false;
                        apkCompilationError = errMsg;
                        return reject(new Error(errMsg));
                    }

                    console.log('  [APK] Uploading APK to Catbox.moe for permanent download link...');
                    uploadToCatbox(apkDestPath)
                        .then(uploadedUrl => {
                            currentApkUrl = uploadedUrl;
                            updateTunnelUrlJson();
                            isApkCompiling = false;
                            console.log();
                            console.log(`  ===================================================`);
                            console.log(`  [APK] APK COMPILADO E HOSPEDADO NA NUVEM!`);
                            console.log(`  [APK] Link Permanente de Download: ${currentApkUrl}`);
                            console.log();
                            console.log(`  Escaneie o QR Code abaixo no celular para baixar o APK:`);
                            qrcode.generate(currentApkUrl, { small: true });
                            console.log(`  ===================================================`);
                            console.log();
                            resolve();
                        })
                        .catch(err => {
                            console.error('  [APK-ERRO] Falha ao enviar APK para Catbox:', err.message);
                            // Fallback to local tunnel URL
                            currentApkUrl = `${tunnelUrl}/controle-horas.apk`;
                            updateTunnelUrlJson();
                            isApkCompiling = false;
                            console.log();
                            console.log(`  ===================================================`);
                            console.log(`  [APK] APK COMPILADO COM LINK TÚNEL LOCAL (FALLBACK):`);
                            console.log(`  [APK] Link de Download: ${currentApkUrl}`);
                            console.log();
                            console.log(`  Escaneie o QR Code abaixo no celular para baixar o APK:`);
                            qrcode.generate(currentApkUrl, { small: true });
                            console.log(`  ===================================================`);
                            console.log();
                            resolve();
                        });
                });
            });

            fileStream.on('error', (err) => {
                isApkCompiling = false;
                apkCompilationError = err.message;
                reject(err);
            });
        });

        req.on('error', (e) => {
            isApkCompiling = false;
            apkCompilationError = e.message;
            reject(e);
        });

        req.on('timeout', () => {
            req.destroy();
            const errMsg = 'Timeout de conexão com o servidor do PWABuilder (90s)';
            isApkCompiling = false;
            apkCompilationError = errMsg;
            reject(new Error(errMsg));
        });

        req.write(postData);
        req.end();
    });
}

// Inicia Servidor, descobre IPs locais e cria Túnel Externo Seguro com auto-reconnect
app.listen(PORT, async () => {
    try {
        await ensureExcelFileExists();
    } catch (err) {
        console.error('[INIT-ERROR] Falha ao inicializar planilha:', err);
    }
    console.log(`===================================================`);
    console.log(`   SERVIDOR DE CONTROLE DE HORAS PREMIUM INICIADO!`);
    console.log(`===================================================`);
    console.log(`  Computador Local (Porta ${PORT}):`);
    console.log(`  > http://localhost:${PORT}`);
    console.log();

    const networkInterfaces = os.networkInterfaces();
    const ips = [];
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }

    if (ips.length > 0) {
        console.log(`  Acesso Celular Android (mesma rede Wi-Fi):`);
        ips.forEach(ip => {
            const url = `http://${ip}:${PORT}`;
            console.log(`  > ${url}`);
            console.log();
            console.log(`  Escaneie o QR Code abaixo no Android (na mesma rede):`);
            qrcode.generate(url, { small: true });
            console.log();
        });
    }
    
    // Iniciar túnel de rede remoto auto-reconectável
    setTimeout(() => startTunnel(0), 1500);
});

