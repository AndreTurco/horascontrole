// ==========================================================================
// MODO OFFLINE TOTAL — INDEXEDDB LOCAL (SEM SERVIDOR)
// ==========================================================================
const DB_NAME = 'controle_horas_db';
const DB_VERSION = 5;
let db = null;

async function initDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('config')) {
                d.createObjectStore('config', { keyPath: 'key' });
            }
            if (!d.objectStoreNames.contains('rows')) {
                const rs = d.createObjectStore('rows', { keyPath: 'rowNum' });
                rs.createIndex('date', 'date', { unique: false });
            }
            if (!d.objectStoreNames.contains('finance')) {
                const fs = d.createObjectStore('finance', { keyPath: 'id' });
                fs.createIndex('date', 'date', { unique: false });
            }
            if (!d.objectStoreNames.contains('invest')) {
                const is = d.createObjectStore('invest', { keyPath: 'id' });
                is.createIndex('date', 'date', { unique: false });
            }
            if (!d.objectStoreNames.contains('notes')) {
                const ns = d.createObjectStore('notes', { keyPath: 'id' });
                ns.createIndex('updatedAt', 'updatedAt', { unique: false });
            }
            // MODO SERVIÇOS & LEMBRETES (INDEXEDDB V5)
            if (!d.objectStoreNames.contains('services')) {
                const ss = d.createObjectStore('services', { keyPath: 'id' });
                ss.createIndex('date', 'date', { unique: false });
            }
            if (!d.objectStoreNames.contains('reminders')) {
                const rms = d.createObjectStore('reminders', { keyPath: 'id' });
                rms.createIndex('datetime', 'datetime', { unique: false });
            }
        };
        req.onsuccess = (e) => { db = e.target.result; resolve(db); };
        req.onerror = (e) => reject(e.target.error);
    });
}

function dbGet(store, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

let isImportingData = false;

function dbPut(store, value) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        const req = tx.objectStore(store).put(value);
        req.onsuccess = () => {
            resolve(req.result);
            if (!isImportingData) {
                onDatabaseWrite();
            }
        };
        req.onerror = () => reject(req.error);
    });
}

function dbDelete(store, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        const req = tx.objectStore(store).delete(key);
        req.onsuccess = () => {
            resolve();
            if (!isImportingData) {
                onDatabaseWrite();
            }
        };
        req.onerror = () => reject(req.error);
    });
}

function dbGetAll(store) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
const state = {
    globalRate: 12.0,
    investPercent: 20, // Porcentagem de investimento automático (editável)
    totalEarningsSinceJan: 0.0,
    pendingEarnings: 0.0,
    rows: [],
    filteredRows: [],
    
    // Gestão Financeira (Aba Mobills)
    financeEntries: [],
    filteredFinanceEntries: [],
    
    // Investimentos (Aba Investimentos)
    investEntries: [],
    filteredInvestEntries: [],
    totalInvested: 0.0,
    
    // Serviços e Vendas (Modo Serviços)
    servicesEntries: [],
    filteredServicesEntries: [],
    
    // Lembretes e Alarmes
    remindersEntries: [],
    
    // Configurações do Usuário e IA
    appMode: 'hours',
    userAge: 30,
    userGender: 'Feminino',
    geminiKey: '',
    
    // Filtros e Configurações
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    goalEarnings: 1500.0,
    activeTab: 'dashboard',
    viewMode: 'list',
    
    // Intervalo Customizado
    rangeStart: '',
    rangeEnd: '',
    
    // Alarmes (Salvos localmente)
    alarms: {
        departure: '07:15',
        arrival: '18:30'
    },
    
    // Instâncias do Chart.js
    chart: null,
    financeChart: null,
    comparisonChart: null,
    yearlyChart: null,
    
    // Privacidade
    hideFinancials: false
};

function switchTab(tabName) {
    state.activeTab = tabName;
    
    // Atualizar abas visíveis
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const content = document.getElementById(`tab-${tabName}`);
    if (content) content.classList.add('active');
    
    // Atualizar classe ativa no menu de navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Gatilhos específicos de abas
    if (tabName === 'dashboard') {
        setTimeout(renderCharts, 50);
    }
}

// Sem servidor — funções de compatídade removidas

// Categoria Financeira com seus respectivo ícones e cores Mobills
const categoriesMeta = {
    'Moradia': { icon: 'fa-house-chimney', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    'Alimentação': { icon: 'fa-utensils', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    'Transporte': { icon: 'fa-bus', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    'Lazer': { icon: 'fa-gamepad', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
    'Serviços': { icon: 'fa-screwdriver-wrench', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    'Cartão Crédito': { icon: 'fa-credit-card', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
    'Trabalho': { icon: 'fa-briefcase', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
    'Outros': { icon: 'fa-tags', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)' }
};

const weekdaysPt = {
    'Sunday': 'Domingo',
    'Monday': 'Segunda-feira',
    'Tuesday': 'Terça-feira',
    'Wednesday': 'Quarta-feira',
    'Thursday': 'Quinta-feira',
    'Friday': 'Sexta-feira',
    'Saturday': 'Sábado'
};

const ptMonths = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializar IndexedDB
    try {
        await initDB();
        console.log('[DB] IndexedDB inicializado com sucesso!');
    } catch (e) {
        console.error('[DB] Falha ao inicializar IndexedDB:', e);
    }

    // 2. Carregar configurações salvas
    const savedGoal = localStorage.getItem('goalEarnings');
    if (savedGoal) {
        state.goalEarnings = parseFloat(savedGoal);
        const goalEl = document.getElementById('input-goal-earnings');
        if (goalEl) goalEl.value = state.goalEarnings;
    }

    // Carregar porcentagem de investimento
    const savedInvestPercent = localStorage.getItem('investPercent');
    if (savedInvestPercent) {
        state.investPercent = parseFloat(savedInvestPercent);
        const investPctEl = document.getElementById('input-invest-percent');
        if (investPctEl) investPctEl.value = state.investPercent;
    }
    
    const savedAlarms = localStorage.getItem('alarms');
    if (savedAlarms) {
        state.alarms = JSON.parse(savedAlarms);
        const depEl = document.getElementById('alarm-departure');
        const arrEl = document.getElementById('alarm-arrival');
        if (depEl) depEl.value = state.alarms.departure;
        if (arrEl) arrEl.value = state.alarms.arrival;
    }
    
    // Configurações do tema (Sempre escuro por padrão)
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');

    // Carregar configuração de privacidade (ocultar valores)
    state.hideFinancials = localStorage.getItem('hideFinancials') === 'true';
    updateHideFinancialsUI();

    // Carregar nome do usuário
    let savedUserName = localStorage.getItem('app_user_name') || 'Premium';
    if (savedUserName.trim().toLowerCase() === 'aline') {
        savedUserName = 'Premium';
        localStorage.setItem('app_user_name', 'Premium');
    }
    const greetingEl = document.getElementById('dashboard-greeting-title');
    if (greetingEl) {
        greetingEl.innerText = `Olá, ${savedUserName}`;
    }
    const inputUserName = document.getElementById('input-user-name');
    if (inputUserName) {
        inputUserName.value = savedUserName;
    }
    
    const filterMonthEl = document.getElementById('filter-month');
    if (filterMonthEl) filterMonthEl.value = state.selectedMonth;

    // 2.5 Configuração Inicial (Setup)
    const isSetupDone = localStorage.getItem('app-setup-done');
    if (!isSetupDone) {
        const overlay = document.getElementById('setup-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            
            // Pausar o carregamento principal até o usuário interagir
            await new Promise(resolve => {
                document.getElementById('btn-start-clean').addEventListener('click', async () => {
                    const name = document.getElementById('setup-user-name').value.trim();
                    if (name) {
                        localStorage.setItem('app_user_name', name);
                        const greetingEl = document.getElementById('dashboard-greeting-title');
                        if (greetingEl) greetingEl.innerText = `Olá, ${name}`;
                        const inputUserName = document.getElementById('input-user-name');
                        if (inputUserName) inputUserName.value = name;
                    }

                    if (typeof PREFILLED_EXCEL_BASE64 !== 'undefined' && PREFILLED_EXCEL_BASE64) {
                        try {
                            overlay.innerHTML = '<div style="color:white; font-size:1.2rem; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; margin-bottom:1rem; color:#10b981;"></i><br>Carregando seus dados Premium...</div>';
                            isImportingData = true;
                            const res = await fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${PREFILLED_EXCEL_BASE64}`);
                            const blob = await res.blob();
                            const file = new File([blob], "Controle_Premium.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                            await processExcelFile(file, true); // skipConfirm = true
                            isImportingData = false;
                            
                            // Forçar fetch dos dados e atualização dos gráficos
                            await fetchData();
                            setTimeout(renderCharts, 100);
                        } catch (err) {
                            console.error("Erro ao carregar dados pre-existentes", err);
                        }
                    }

                    localStorage.setItem('app-setup-done', 'true');
                    overlay.style.display = 'none';
                    resolve();
                });
                
                const importBtn = document.getElementById('btn-trigger-welcome-import');
                const fileInput = document.getElementById('input-welcome-import');
                if (importBtn && fileInput) {
                    importBtn.addEventListener('click', () => fileInput.click());
                    fileInput.addEventListener('change', async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        const name = document.getElementById('setup-user-name').value.trim();
                        if (name) {
                            localStorage.setItem('app_user_name', name);
                            const greetingEl = document.getElementById('dashboard-greeting-title');
                            if (greetingEl) greetingEl.innerText = `Olá, ${name}`;
                            const inputUserName = document.getElementById('input-user-name');
                            if (inputUserName) inputUserName.value = name;
                        }
                        
                        try {
                            overlay.innerHTML = '<div style="color:white; font-size:1.2rem; text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; margin-bottom:1rem; color:#10b981;"></i><br>Importando dados...</div>';
                            isImportingData = true;
                            // The processExcelFile function will trigger the read and save
                            await processExcelFile(file);
                            isImportingData = false;
                            
                            localStorage.setItem('app-setup-done', 'true');
                            setTimeout(() => {
                                overlay.style.display = 'none';
                                resolve();
                            }, 500);
                        } catch (err) {
                            alert("Erro ao importar a planilha! Começando com banco vazio.");
                            console.error(err);
                            localStorage.setItem('app-setup-done', 'true');
                            overlay.style.display = 'none';
                            resolve();
                        }
                    });
                }
            });
        }
    }

    // 3. Carregar dados do IndexedDB
    await fetchData();

    // 4. Iniciar Relógio
    startClock();

    // 5. Eventos e helpers
    bindEvents();
    initNotifications();
    initInvestmentsCalc();
    initBackupHandlers();
    applyMathParserToInputs();
    
    // 5b. Inicializar APIs públicas de internet e persistência
    initStoragePersistence();
    loadMotivationalQuote();
    fetchCurrencyRates();
    fetchHolidays();
    checkTimeSync();
    fetchWeather();
    
    // 5c. Inicializar Google Drive (Cloud Sync)
    initGoogleDrive();
    
    // 6. Registrar PWA Service Worker
    registerServiceWorker();

    setSyncStatus('connected', 'Offline Mode ✔');
});

// ==========================================================================
// INDEXEDDB DATA LAYER (OFFLINE)
// ==========================================================================

async function fetchData() {
    try {
        setSyncStatus('syncing', 'Carregando...');

        // Carregar configurações
        const cfgRate = await dbGet('config', 'globalRate');
        if (cfgRate) state.globalRate = cfgRate.value;
        const cfgInvPct = await dbGet('config', 'investPercent');
        if (cfgInvPct) state.investPercent = cfgInvPct.value;
        
        // Configurações do Usuário e IA (Gemini V5)
        const cfgGeminiKey = await dbGet('config', 'geminiKey');
        if (cfgGeminiKey) state.geminiKey = cfgGeminiKey.value;
        const cfgUserAge = await dbGet('config', 'userAge');
        if (cfgUserAge) state.userAge = cfgUserAge.value;
        const cfgUserGender = await dbGet('config', 'userGender');
        if (cfgUserGender) state.userGender = cfgUserGender.value;
        const cfgUserName = await dbGet('config', 'userName');
        if (cfgUserName) {
            state.userName = cfgUserName.value;
        } else {
            state.userName = localStorage.getItem('app_user_name') || 'Premium';
            await dbPut('config', { key: 'userName', value: state.userName });
        }
        
        // Carregar linhas de ponto
        let rows = await dbGetAll('rows');

        // Primeiro acesso: popular com dados da planilha pré-preenchida se não estiver no modo limpo
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode') || 'user';
        if (rows.length === 0 && mode !== 'clean' && typeof PREFILLED_EXCEL_BASE64 !== 'undefined' && PREFILLED_EXCEL_BASE64) {
            console.log('[DB] Populando banco com dados da planilha pré-preenchida (mode=user)...');
            await seedFromPrefilledExcel();
            rows = await dbGetAll('rows');
        }

        // Calcular campos derivados
        rows.forEach(row => {
            recalcRow(row, state.globalRate);
        });

        state.rows = rows.sort((a, b) => a.date.localeCompare(b.date));

        // Totais acumulados
        let totalEarnings = 0, pendingEarnings = 0;
        state.rows.forEach(row => {
            totalEarnings += row.ganhos || 0;
            if (row.statusPagamento !== 'Pago') pendingEarnings += row.ganhos || 0;
        });
        state.totalEarningsSinceJan = totalEarnings;
        state.pendingEarnings = pendingEarnings;

        // Carregar finanças, investimentos, serviços e lembretes
        state.financeEntries = await dbGetAll('finance');
        state.investEntries = await dbGetAll('invest');
        state.servicesEntries = await dbGetAll('services') || [];
        state.remindersEntries = await dbGetAll('reminders') || [];
        
        await autoSyncInvestments();
        state.totalInvested = state.investEntries.reduce((s, e) => s + (e.amount || 0), 0);

        // Atualizar UI
        const rateValEl = document.getElementById('kpi-rate-val');
        if (rateValEl) rateValEl.innerText = `R$ ${state.globalRate.toFixed(2)}/h`;
        const rateInputEl = document.getElementById('input-global-rate');
        if (rateInputEl) rateInputEl.value = state.globalRate;

        // Atualizar porcentagem de investimento na UI
        const investPctEl = document.getElementById('input-invest-percent');
        if (investPctEl) investPctEl.value = state.investPercent;
        
        // Atualizar UI de Perfil e Gemini
        const nameInputEl = document.getElementById('input-user-name');
        if (nameInputEl) nameInputEl.value = state.userName || 'Premium';
        const gEl = document.getElementById('dashboard-greeting-title');
        if (gEl) gEl.innerText = `Olá, ${state.userName || 'Premium'}`;
        
        const ageEl = document.getElementById('input-user-age');
        if (ageEl) ageEl.value = state.userAge || 30;
        const genderEl = document.getElementById('input-user-gender');
        if (genderEl) genderEl.value = state.userGender || 'Feminino';
        const geminiEl = document.getElementById('input-gemini-key');
        if (geminiEl) geminiEl.value = state.geminiKey || '';

        // Restaurar modo ativo
        state.appMode = localStorage.getItem('app_active_mode') || 'hours';
        setTimeout(() => {
            if (window.setAppMode) window.setAppMode(state.appMode);
        }, 100);

        populateCategoriesDropdown();
        applyFilters();
        setSyncStatus('connected', 'Salvo Localmente');
    } catch (err) {
        console.error('[DB] Erro ao carregar dados:', err);
        setSyncStatus('offline', 'Erro no Banco');
        showToast('Erro ao carregar dados do dispositivo!', 'error');
    }
}

function recalcRow(row, globalRate) {
    const wMin = calculateWorkedMinutes(row.entrada1, row.saida1, row.entrada2, row.saida2);
    row.minutosTrabalhados = wMin;
    row.horasMinutos = minutesToTimeStr(wMin);
    row.horasFracionarias = wMin / 60;

    let dayRate = globalRate;
    if (row.valorHora !== null && row.valorHora !== '' && row.valorHora !== undefined) {
        dayRate = parseFloat(row.valorHora);
    }
    if (row.ganhosManuais !== null && row.ganhosManuais !== undefined && row.ganhosManuais !== '') {
        row.ganhos = parseFloat(row.ganhosManuais);
    } else {
        row.ganhos = (wMin / 60) * dayRate;
    }

    const commuteMinutes = calculateCommuteMinutes(row.saidaCasa, row.entrada1, row.saida1, row.entrada2, row.saida2, row.chegadaCasa);
    const timeOutsideMinutes = calculateTimeOutsideMinutes(row.saidaCasa, row.chegadaCasa);
    row.tempoTrajeto = minutesToTimeStr(commuteMinutes);
    row.minutosTrajeto = commuteMinutes;
    row.tempoForaCasa = minutesToTimeStr(timeOutsideMinutes);
    row.minutosForaCasa = timeOutsideMinutes;
}

async function seedFromPrefilledExcel() {
    try {
        isImportingData = true; // Set flag
        if (typeof PREFILLED_EXCEL_BASE64 === 'undefined' || !PREFILLED_EXCEL_BASE64) {
            console.warn('[DB-SEED] Base64 da planilha não encontrado.');
            return;
        }

        console.log('[DB-SEED] Convertendo base64 da planilha...');
        const binaryString = atob(PREFILLED_EXCEL_BASE64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const sheet = workbook.getWorksheet('Controle de Horas');
        if (!sheet) {
            console.error('[DB-SEED] Planilha "Controle de Horas" não encontrada!');
            return;
        }

        let importedGlobalRate = state.globalRate;
        const i2Val = sheet.getRow(2).getCell(9).value;
        if (i2Val !== null && i2Val !== undefined) {
            if (typeof i2Val === 'number') {
                importedGlobalRate = i2Val;
            } else if (typeof i2Val === 'object' && i2Val.result !== undefined) {
                importedGlobalRate = Number(i2Val.result);
            }
        }

        const importedRows = [];
        const rowCount = sheet.rowCount;
        for (let r = 2; r <= rowCount; r++) {
            const excelRow = sheet.getRow(r);
            const rawDate = excelRow.getCell(1).value;
            if (!rawDate) continue;

            const dateStr = formatCellDate(rawDate);
            if (!dateStr) continue;

            const rowData = {
                rowNum: r - 1,
                date: dateStr,
                weekday: excelRow.getCell(2).value || '',
                entrada1: formatCellTime(excelRow.getCell(3).value),
                saida1: formatCellTime(excelRow.getCell(4).value),
                entrada2: formatCellTime(excelRow.getCell(5).value),
                saida2: formatCellTime(excelRow.getCell(6).value),
                valorHora: excelRow.getCell(9).value !== null ? Number(excelRow.getCell(9).value) : importedGlobalRate,
                observacoes: excelRow.getCell(10).value || '',
                statusPagamento: excelRow.getCell(11).value || 'Pendente',
                saidaCasa: formatCellTime(excelRow.getCell(12).value),
                chegadaCasa: formatCellTime(excelRow.getCell(13).value)
            };

            recalcRow(rowData, importedGlobalRate);
            importedRows.push(rowData);
        }

        const importedFinance = [];
        const finSheet = workbook.getWorksheet('Gestão Financeira');
        if (finSheet) {
            const finRowCount = finSheet.rowCount;
            for (let r = 2; r <= finRowCount; r++) {
                const excelRow = finSheet.getRow(r);
                const id = excelRow.getCell(1).value;
                const dateVal = formatCellDate(excelRow.getCell(2).value);
                if (!dateVal) continue;

                const entry = {
                    id: id || generateId(),
                    date: dateVal,
                    description: excelRow.getCell(3).value || '',
                    type: excelRow.getCell(4).value || 'Despesa Fixa',
                    amount: Number(excelRow.getCell(5).value || 0),
                    category: excelRow.getCell(6).value || 'Outros'
                };
                importedFinance.push(entry);
            }
        }

        const importedInvest = [];
        const investSheet = workbook.getWorksheet('Investimentos');
        if (investSheet) {
            const invRowCount = investSheet.rowCount;
            for (let r = 2; r <= invRowCount; r++) {
                const excelRow = investSheet.getRow(r);
                const id = excelRow.getCell(1).value;
                const dateVal = formatCellDate(excelRow.getCell(2).value);
                if (!dateVal) continue;

                const entry = {
                    id: id || generateId(),
                    date: dateVal,
                    origin: excelRow.getCell(3).value || '',
                    amount: Number(excelRow.getCell(4).value || 0),
                    type: excelRow.getCell(5).value || 'Manual'
                };
                importedInvest.push(entry);
            }
        }

        const importedServices = [];
        const svcSheet = workbook.getWorksheet('Serviços e Vendas');
        if (svcSheet) {
            const svcRowCount = svcSheet.rowCount;
            for (let r = 2; r <= svcRowCount; r++) {
                const excelRow = svcSheet.getRow(r);
                const id = excelRow.getCell(1).value;
                const dateVal = formatCellDate(excelRow.getCell(2).value);
                if (!dateVal) continue;

                const entry = {
                    id: id || generateId(),
                    date: dateVal,
                    client: excelRow.getCell(3).value || '',
                    service: excelRow.getCell(4).value || '',
                    quantity: Number(excelRow.getCell(5).value || 1),
                    unitPrice: Number(excelRow.getCell(6).value || 0),
                    status: excelRow.getCell(8).value || 'Pendente',
                    notes: excelRow.getCell(9).value || ''
                };
                importedServices.push(entry);
            }
        }

        // Escrever no banco de dados
        await dbPut('config', { key: 'globalRate', value: importedGlobalRate });
        state.globalRate = importedGlobalRate;

        const txRows = db.transaction('rows', 'readwrite');
        for (const row of importedRows) {
            await txRows.objectStore('rows').put(row);
        }

        const txFin = db.transaction('finance', 'readwrite');
        for (const f of importedFinance) {
            await txFin.objectStore('finance').put(f);
        }

        const txInv = db.transaction('invest', 'readwrite');
        for (const i of importedInvest) {
            await txInv.objectStore('invest').put(i);
        }
        
        const txSvc = db.transaction('services', 'readwrite');
        for (const s of importedServices) {
            await txSvc.objectStore('services').put(s);
        }

        console.log(`[DB-SEED] Semente aplicada: ${importedRows.length} pontos, ${importedFinance.length} finanças, ${importedInvest.length} investimentos, ${importedServices.length} serviços.`);
    } catch (e) {
        console.error('[DB-SEED] Erro ao aplicar semente pré-preenchida:', e);
    } finally {
        isImportingData = false;
    }
}

// Função removida (era de rede)
async function fetchNetworkInfo() { /* offline: sem servidor */ }

// Copiar texto para a área de transferência
window.copyText = function(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.select();
        el.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(el.value)
            .then(() => showToast('Link copiado com sucesso!', 'success'))
            .catch(() => showToast('Falha ao copiar link.', 'error'));
    }
};

// Salvar linha específica no IndexedDB
async function saveRow(rowData) {
    try {
        setSyncStatus('syncing', 'Salvando...');
        recalcRow(rowData, state.globalRate);
        await dbPut('rows', rowData);
        
        // Recalcular estado global
        const idx = state.rows.findIndex(r => r.rowNum === rowData.rowNum);
        if (idx !== -1) state.rows[idx] = rowData;
        
        state.totalEarningsSinceJan = state.rows.reduce((s, r) => s + (r.ganhos || 0), 0);
        state.pendingEarnings = state.rows.filter(r => r.statusPagamento !== 'Pago').reduce((s, r) => s + (r.ganhos || 0), 0);
        
        await autoSyncInvestments();
        
        setSyncStatus('connected', 'Salvo Localmente');
        showToast('Dia salvo com sucesso!', 'success');
        applyFilters();
        return true;
    } catch (err) {
        console.error('[DB] Erro ao salvar linha:', err);
        showToast('Erro ao salvar o dia!', 'error');
        setSyncStatus('connected', 'Salvo Localmente');
        return false;
    }
}

// Salvar taxa horária global no IndexedDB
async function saveGlobalRate(rate) {
    try {
        state.globalRate = rate;
        await dbPut('config', { key: 'globalRate', value: rate });
        
        // Recalcular todos os ganhos
        state.rows.forEach(row => recalcRow(row, rate));
        state.totalEarningsSinceJan = state.rows.reduce((s, r) => s + (r.ganhos || 0), 0);
        state.pendingEarnings = state.rows.filter(r => r.statusPagamento !== 'Pago').reduce((s, r) => s + (r.ganhos || 0), 0);
        
        await autoSyncInvestments();
        
        const rateValEl = document.getElementById('kpi-rate-val');
        if (rateValEl) rateValEl.innerText = `R$ ${rate.toFixed(2)}/h`;
        
        applyFilters();
        setSyncStatus('connected', 'Salvo');
        showToast('Taxa horária salva com sucesso!', 'success');
    } catch (err) {
        console.error('[DB] Erro ao salvar taxa:', err);
        showToast('Falha ao salvar taxa horária!', 'error');
    }
}

// Registrar ponto dinâmico de hoje
// Registrar ponto dinâmico de hoje
async function registerClockIn() {
    const btn = document.getElementById('quick-clock-btn');
    const btnText = document.getElementById('clock-btn-text');
    if (!btn || btn.disabled) return;
    
    // Desabilitar botão temporariamente para evitar cliques duplos
    btn.disabled = true;
    const originalText = btnText ? btnText.innerText : 'Bater Ponto';
    if (btnText) btnText.innerText = 'Registrando...';
    btn.style.opacity = '0.6';
    
    try {
        setSyncStatus('syncing', 'Batendo ponto...');
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + 
            String(now.getMinutes()).padStart(2, '0');

        // Buscar ou criar linha de hoje
        let todayRow = state.rows.find(r => r.date === dateStr);
        if (!todayRow) {
            // Criar nova linha para hoje
            const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            todayRow = {
                rowNum: Date.now(),
                date: dateStr,
                weekday: weekdays[now.getDay()],
                entrada1: '', saida1: '', entrada2: '', saida2: '',
                saidaCasa: '', chegadaCasa: '',
                observacoes: '',
                valorHora: '',
                ganhosManuais: null,
                statusPagamento: 'Pendente',
                ganhos: 0,
                minutosTrabalhados: 0,
                horasMinutos: '0:00',
                horasFracionarias: 0,
                tempoTrajeto: '0:00',
                minutosTrajeto: 0,
                tempoForaCasa: '0:00',
                minutosForaCasa: 0
            };
            if (state.defaultWeatherText) {
                todayRow.observacoes = state.defaultWeatherText;
            }
            state.rows.push(todayRow);
            state.rows.sort((a, b) => a.date.localeCompare(b.date));
        }
        
        let slotName = '';
        if (!todayRow.entrada1) {
            todayRow.entrada1 = timeStr;
            slotName = 'Entrada 1';
        } else if (!todayRow.saida1) {
            todayRow.saida1 = timeStr;
            slotName = 'Saída 1';
        } else if (!todayRow.entrada2) {
            todayRow.entrada2 = timeStr;
            slotName = 'Entrada 2';
        } else if (!todayRow.saida2) {
            todayRow.saida2 = timeStr;
            slotName = 'Saída 2';
        }
        
        if (slotName) {
            // Recalcular campos derivados
            recalcRow(todayRow, state.globalRate);
            
            // Salvar no IndexedDB
            await dbPut('rows', todayRow);
            
            // Atualizar totais
            state.totalEarningsSinceJan = state.rows.reduce((s, r) => s + (r.ganhos || 0), 0);
            state.pendingEarnings = state.rows.filter(r => r.statusPagamento !== 'Pago').reduce((s, r) => s + (r.ganhos || 0), 0);
            
            applyFilters();
            showToast(`✅ ${slotName} registrada: ${timeStr}`, 'success');
            setSyncStatus('connected', 'Salvo Localmente');
        } else {
            showToast('Todos os 4 slots de ponto já foram preenchidos! Use o editor para corrigir.', 'warning');
        }
    } catch (err) {
        console.error('[CLOCK-IN]', err);
        showToast('Erro ao registrar ponto!', 'error');
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            if (btnText) btnText.innerText = originalText;
            btn.style.opacity = '';
        }, 1000);
    }
}


// Quitar lote de faturamento pendente no IndexedDB
async function payBatch(dateLimit) {
    try {
        setSyncStatus('syncing', 'Quitando lote...');
        
        const rowsToUpdate = state.rows.filter(r => r.date <= dateLimit && r.statusPagamento !== 'Pago');
        
        // Atualizar cada linha no IndexedDB
        const tx = db.transaction('rows', 'readwrite');
        const store = tx.objectStore('rows');
        rowsToUpdate.forEach(row => {
            row.statusPagamento = 'Pago';
            store.put(row);
        });
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
        
        // Recalcular ganhos pendentes
        state.pendingEarnings = state.rows.filter(r => r.statusPagamento !== 'Pago').reduce((s, r) => s + (r.ganhos || 0), 0);
        
        showToast(`${rowsToUpdate.length} lançamentos marcados como Pagos!`, 'success');
        applyFilters();
        setSyncStatus('connected', 'Salvo Localmente');
        
        const cutoffEl = document.getElementById('pay-cutoff-date');
        const btnQuit = document.getElementById('btn-quit-batch');
        const pendingValEl = document.getElementById('cutoff-pending-val');
        if (cutoffEl) cutoffEl.value = '';
        if (btnQuit) btnQuit.disabled = true;
        if (pendingValEl) pendingValEl.innerText = 'R$ 0,00';
    } catch (err) {
        console.error('[DB] Erro ao quitar lote:', err);
        showToast('Erro ao quitar lançamentos!', 'error');
        setSyncStatus('connected', 'Salvo Localmente');
    }
}

// Salvar transação financeira no IndexedDB
async function saveFinanceEntry(entryData) {
    try {
        setSyncStatus('syncing', 'Salvando transação...');
        
        if (!entryData.id) entryData.id = generateId();
        await dbPut('finance', entryData);
        
        // Atualizar estado local
        const existIdx = state.financeEntries.findIndex(e => e.id === entryData.id);
        if (existIdx !== -1) {
            state.financeEntries[existIdx] = entryData;
        } else {
            state.financeEntries.push(entryData);
        }
        
        showToast('Transação financeira salva!', 'success');
        
        // Reset do formulário financeiro
        const form = document.getElementById('finance-entry-form');
        const idEl = document.getElementById('fin-entry-id');
        if (form) form.reset();
        if (idEl) idEl.value = '';
        
        const cancelBtn = document.getElementById('btn-cancel-fin-edit');
        if (cancelBtn) cancelBtn.classList.add('hidden');
        
        applyFilters();
        setSyncStatus('connected', 'Salvo Localmente');
    } catch (err) {
        console.error('[DB] Erro ao salvar transação financeira:', err);
        showToast('Erro ao salvar transação financeira!', 'error');
        setSyncStatus('connected', 'Salvo Localmente');
    }
}

// Deletar transação financeira do IndexedDB
async function deleteFinanceEntry(id) {
    try {
        setSyncStatus('syncing', 'Excluindo transação...');
        await dbDelete('finance', id);
        state.financeEntries = state.financeEntries.filter(e => e.id !== id);
        showToast('Transação excluída!', 'success');
        applyFilters();
        setSyncStatus('connected', 'Salvo Localmente');
    } catch (err) {
        console.error('[DB] Erro ao deletar transação:', err);
        showToast('Falha ao excluir transação!', 'error');
        setSyncStatus('connected', 'Salvo Localmente');
    }
}

// ==========================================================================
// FILTER LOGIC
// ==========================================================================
function applyFilters() {
    const monthSelect = parseInt(document.getElementById('filter-month').value, 10);
    const searchVal = document.getElementById('search-notes').value.toLowerCase().trim();
    
    state.selectedMonth = monthSelect;
    
    // 1. Filtrar Controle de Horas
    state.filteredRows = state.rows.filter(row => {
        const dateParts = parseDateParts(row.date);
        
        // Checa se está no intervalo customizado (se ativo)
        let matchDate = dateParts.month === monthSelect;
        if (state.rangeStart && state.rangeEnd) {
            matchDate = row.date >= state.rangeStart && row.date <= state.rangeEnd;
        }
        
        let matchSearch = true;
        if (searchVal) {
            matchSearch = (row.observacoes && row.observacoes.toLowerCase().includes(searchVal)) ||
                          (row.statusPagamento && row.statusPagamento.toLowerCase().includes(searchVal));
        }
        
        return matchDate && matchSearch;
    });
    
    state.filteredRows = state.filteredRows.filter(row => row.date);
    state.filteredRows.sort((a, b) => a.date.localeCompare(b.date));
    
    // 2. Filtrar Transações Financeiras (Aba Mobills)
    state.filteredFinanceEntries = state.financeEntries.filter(entry => {
        const dateParts = parseDateParts(entry.date);
        return dateParts.month === monthSelect;
    });
    
    state.filteredFinanceEntries = state.filteredFinanceEntries.filter(entry => entry.date);
    state.filteredFinanceEntries.sort((a, b) => a.date.localeCompare(b.date));
    
    // 3. Filtrar Investimentos (Aba Investimentos)
    state.filteredInvestEntries = state.investEntries.filter(entry => {
        const dateParts = parseDateParts(entry.date);
        return dateParts.month === monthSelect;
    });
    
    state.filteredInvestEntries = state.filteredInvestEntries.filter(entry => entry.date);
    state.filteredInvestEntries.sort((a, b) => a.date.localeCompare(b.date));

    // 4. Filtrar Serviços e Vendas (Nova V5)
    state.filteredServicesEntries = (state.servicesEntries || []).filter(entry => {
        const dateParts = parseDateParts(entry.date);
        
        let matchDate = dateParts.month === monthSelect;
        if (state.rangeStart && state.rangeEnd) {
            matchDate = entry.date >= state.rangeStart && entry.date <= state.rangeEnd;
        }
        
        let matchSearch = true;
        if (searchVal) {
            matchSearch = (entry.client && entry.client.toLowerCase().includes(searchVal)) ||
                          (entry.service && entry.service.toLowerCase().includes(searchVal)) ||
                          (entry.notes && entry.notes.toLowerCase().includes(searchVal)) ||
                          (entry.status && entry.status.toLowerCase().includes(searchVal));
        }
        
        return matchDate && matchSearch;
    });
    state.filteredServicesEntries = state.filteredServicesEntries.filter(entry => entry.date);
    state.filteredServicesEntries.sort((a, b) => a.date.localeCompare(b.date));
    
    // Renderizações reativas
    renderDashboard();
    renderHistory();
    renderFinance();
    renderInvestments();
    renderCommutes();
    renderCharts();
    renderHeatmap();
    renderRadarChart();
    renderFinanceScore();
    renderBudgets();
}

// ==========================================================================
// RENDER METHODS
// ==========================================================================

// 1. Dashboard View
function renderDashboard() {
    // Registro de Hoje
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0');
    
    const opt = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById('today-date-text').innerText = now.toLocaleDateString('pt-BR', opt);

    const todayRow = state.rows.find(r => r.date === todayStr);
    
    const e1 = document.getElementById('val-e1');
    const s1 = document.getElementById('val-s1');
    const e2 = document.getElementById('val-e2');
    const s2 = document.getElementById('val-s2');
    const btnText = document.getElementById('clock-btn-text');
    const btn = document.getElementById('quick-clock-btn');
    const statusText = document.getElementById('current-shift-status');
    
    document.getElementById('slot-e1').classList.remove('filled');
    document.getElementById('slot-s1').classList.remove('filled');
    document.getElementById('slot-e2').classList.remove('filled');
    document.getElementById('slot-s2').classList.remove('filled');
    
    if (todayRow) {
        e1.innerText = todayRow.entrada1 || '--:--';
        s1.innerText = todayRow.saida1 || '--:--';
        e2.innerText = todayRow.entrada2 || '--:--';
        s2.innerText = todayRow.saida2 || '--:--';
        
        if (todayRow.entrada1) document.getElementById('slot-e1').classList.add('filled');
        if (todayRow.saida1) document.getElementById('slot-s1').classList.add('filled');
        if (todayRow.entrada2) document.getElementById('slot-e2').classList.add('filled');
        if (todayRow.saida2) document.getElementById('slot-s2').classList.add('filled');
        
        if (!todayRow.entrada1) {
            btnText.innerText = 'Registrar Entrada 1';
            statusText.innerText = 'Status: Não Iniciado';
            statusText.style.color = 'var(--text-secondary)';
            btn.className = 'btn btn-primary clock-btn ripple color-blue';
            btn.disabled = false;
        } else if (!todayRow.saida1) {
            btnText.innerText = 'Registrar Saída 1';
            statusText.innerText = 'Status: Trabalhando (Turno 1)';
            statusText.style.color = 'var(--accent-blue)';
            btn.className = 'btn btn-primary clock-btn ripple color-green';
            btn.disabled = false;
        } else if (!todayRow.entrada2) {
            btnText.innerText = 'Registrar Entrada 2';
            statusText.innerText = 'Status: Em Intervalo';
            statusText.style.color = 'var(--accent-yellow)';
            btn.className = 'btn btn-primary clock-btn ripple color-yellow';
            btn.disabled = false;
        } else if (!todayRow.saida2) {
            btnText.innerText = 'Registrar Saída 2';
            statusText.innerText = 'Status: Trabalhando (Turno 2)';
            statusText.style.color = 'var(--accent-purple)';
            btn.className = 'btn btn-primary clock-btn ripple color-purple';
            btn.disabled = false;
        } else {
            btnText.innerText = 'Ponto Finalizado';
            statusText.innerText = 'Status: Finalizado';
            statusText.style.color = 'var(--accent-green)';
            btn.className = 'btn btn-secondary clock-btn ripple';
            btn.disabled = true;
        }
    } else {
        e1.innerText = '--:--';
        s1.innerText = '--:--';
        e2.innerText = '--:--';
        s2.innerText = '--:--';
        btnText.innerText = 'Bater Ponto';
        statusText.innerText = 'Status: Sem registros ativos para 2026';
        statusText.style.color = 'var(--text-muted)';
        btn.disabled = true;
    }

    // Calcular faturamento e horas/serviços com base no modo ativo
    if (state.appMode === 'services') {
        let totalEarningsServicesMonth = 0;
        let totalPendingServicesMonth = 0;
        let jobCountMonth = 0;
        
        state.filteredServicesEntries.forEach(entry => {
            const tot = (entry.quantity * entry.unitPrice) || 0;
            totalEarningsServicesMonth += tot;
            if (entry.status !== 'Pago') {
                totalPendingServicesMonth += tot;
            }
            jobCountMonth++;
        });
        
        let totalEarningsServicesYear = 0;
        let totalPendingServicesTotal = 0;
        (state.servicesEntries || []).forEach(entry => {
            const tot = (entry.quantity * entry.unitPrice) || 0;
            totalEarningsServicesYear += tot;
            if (entry.status !== 'Pago') {
                totalPendingServicesTotal += tot;
            }
        });

        // Injetar KPIs no Modo Serviços
        document.getElementById('kpi-month-earnings').innerText = formatCurrency(totalEarningsServicesMonth);
        document.getElementById('kpi-month-hours').innerText = `${jobCountMonth} lançamentos`;
        
        document.getElementById('kpi-global-earnings').innerText = formatCurrency(totalEarningsServicesYear);
        document.getElementById('kpi-pending-earnings').innerText = formatCurrency(totalPendingServicesTotal);
        
        // Faturamento da semana (Modo Serviços)
        const currentWeekDays = getDaysOfCurrentWeek(null);
        let totalEarningsWeek = 0;
        state.servicesEntries.forEach(entry => {
            if (currentWeekDays.includes(entry.date)) {
                totalEarningsWeek += (entry.quantity * entry.unitPrice) || 0;
            }
        });
        document.getElementById('kpi-week-hours').innerText = formatCurrency(totalEarningsWeek);
        const subtitleEl = document.getElementById('kpi-week-hours-subtitle');
        if (subtitleEl && currentWeekDays.length === 7) {
            const startParts = currentWeekDays[0].split('-');
            const endParts = currentWeekDays[6].split('-');
            subtitleEl.innerText = `Receita da Semana`;
        }
        
        // Atualizar KPI Reserva de Investimento Recebida Geral
        const totalReceived = totalEarningsServicesYear - totalPendingServicesTotal;
        const globalAutoInvest = totalReceived * (state.investPercent / 100);
        const kpiGlobalInvestAuto = document.getElementById('kpi-global-invest-auto');
        if (kpiGlobalInvestAuto) {
            kpiGlobalInvestAuto.innerText = formatCurrency(globalAutoInvest);
        }
        const kpiGlobalInvestAutoTitle = document.getElementById('kpi-global-invest-auto-title');
        if (kpiGlobalInvestAutoTitle) {
            kpiGlobalInvestAutoTitle.innerText = `Reserva ${state.investPercent}% Recebida`;
        }
        const kpiGlobalInvestAutoSub = document.getElementById('kpi-global-invest-auto-subtitle');
        if (kpiGlobalInvestAutoSub) {
            kpiGlobalInvestAutoSub.innerText = `Ref: ${state.investPercent}% de ${formatCurrency(totalReceived)} pagos`;
        }
        
        // Meta de progresso mensal
        const goalPercent = Math.min(100, Math.floor((totalEarningsServicesMonth / state.goalEarnings) * 100));
        document.getElementById('goal-percent-text').innerText = `${goalPercent}%`;
        document.getElementById('goal-progress-fill').style.width = `${goalPercent}%`;
        document.getElementById('goal-min-text').innerText = `Meta: R$ ${state.goalEarnings.toFixed(2)}`;
        document.getElementById('goal-current-text').innerText = `Ganhos: R$ ${totalEarningsServicesMonth.toFixed(2)}`;
    } else {
        // Modo Controle de Horas
        let totalMinutesMonth = 0;
        let totalEarningsMonth = 0;
        
        state.filteredRows.forEach(row => {
            totalMinutesMonth += row.minutosTrabalhados;
            totalEarningsMonth += row.ganhos;
        });
        
        // Horas da semana (baseado no último dia com registros de horas)
        let lastWorkedRow = null;
        for (let i = state.rows.length - 1; i >= 0; i--) {
            if (state.rows[i].minutosTrabalhados > 0) {
                lastWorkedRow = state.rows[i];
                break;
            }
        }
        const refDate = lastWorkedRow ? lastWorkedRow.date : null;
        const currentWeekDays = getDaysOfCurrentWeek(refDate);
        
        let totalMinutesWeek = 0;
        state.rows.forEach(row => {
            if (currentWeekDays.includes(row.date)) {
                totalMinutesWeek += row.minutosTrabalhados;
            }
        });
        
        // Injetar KPIs de faturamento histórico, pendente e mensal no Dashboard
        document.getElementById('kpi-month-earnings').innerText = formatCurrency(totalEarningsMonth);
        document.getElementById('kpi-month-hours').innerText = `${formatMinutesToHoursStr(totalMinutesMonth)} trabalhados`;
        
        document.getElementById('kpi-global-earnings').innerText = formatCurrency(state.totalEarningsSinceJan);
        document.getElementById('kpi-pending-earnings').innerText = formatCurrency(state.pendingEarnings);
        document.getElementById('kpi-week-hours').innerText = formatMinutesToHoursStr(totalMinutesWeek);
        
        const subtitleEl = document.getElementById('kpi-week-hours-subtitle');
        if (subtitleEl && currentWeekDays.length === 7) {
            const startParts = currentWeekDays[0].split('-');
            const endParts = currentWeekDays[6].split('-');
            subtitleEl.innerText = `Ref: ${startParts[2]}/${startParts[1]} a ${endParts[2]}/${endParts[1]}`;
        }
        
        // Atualizar KPI Reserva de Investimento Recebida Geral
        const totalReceived = state.totalEarningsSinceJan - state.pendingEarnings;
        const globalAutoInvest = totalReceived * (state.investPercent / 100);
        const kpiGlobalInvestAuto = document.getElementById('kpi-global-invest-auto');
        if (kpiGlobalInvestAuto) {
            kpiGlobalInvestAuto.innerText = formatCurrency(globalAutoInvest);
        }
        const kpiGlobalInvestAutoTitle = document.getElementById('kpi-global-invest-auto-title');
        if (kpiGlobalInvestAutoTitle) {
            kpiGlobalInvestAutoTitle.innerText = `Reserva ${state.investPercent}% Recebida`;
        }
        const kpiGlobalInvestAutoSub = document.getElementById('kpi-global-invest-auto-subtitle');
        if (kpiGlobalInvestAutoSub) {
            kpiGlobalInvestAutoSub.innerText = `Ref: ${state.investPercent}% de ${formatCurrency(totalReceived)} pagos`;
        }
        
        // Meta de progresso mensal
        const goalPercent = Math.min(100, Math.floor((totalEarningsMonth / state.goalEarnings) * 100));
        document.getElementById('goal-percent-text').innerText = `${goalPercent}%`;
        document.getElementById('goal-progress-fill').style.width = `${goalPercent}%`;
        document.getElementById('goal-min-text').innerText = `Meta: R$ ${state.goalEarnings.toFixed(2)}`;
        document.getElementById('goal-current-text').innerText = `Ganhos: R$ ${totalEarningsMonth.toFixed(2)}`;
    }
}

// 2. Tabela e Calendário de Pontos
function renderHistory() {
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '';
    
    // Atualizar cabeçalho da tabela dinamicamente
    const thead = document.querySelector('.history-table thead');
    if (thead) {
        if (state.appMode === 'services') {
            thead.innerHTML = `
                <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Serviço/Produto</th>
                    <th>Quant.</th>
                    <th>Val. Unitário</th>
                    <th>Total (R$)</th>
                    <th>Status</th>
                    <th>Observações</th>
                    <th class="actions-col">Editar</th>
                </tr>
            `;
        } else {
            thead.innerHTML = `
                <tr>
                    <th>Data</th>
                    <th>Dia Semana</th>
                    <th>Turno 1</th>
                    <th>Turno 2</th>
                    <th>Total Horas</th>
                    <th>Ganhos (R$)</th>
                    <th>Status</th>
                    <th>Notas</th>
                    <th class="actions-col">Editar</th>
                </tr>
            `;
        }
    }

    if (state.appMode === 'services') {
        if (!state.filteredServicesEntries || state.filteredServicesEntries.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum registro de serviço ou venda encontrado para este mês ou busca.</td></tr>';
            renderCalendarGrid();
            return;
        }

        state.filteredServicesEntries.forEach(entry => {
            const tr = document.createElement('tr');
            tr.id = `service-row-${entry.id}`;
            
            const dateParts = parseDateParts(entry.date);
            const dayLabel = String(dateParts.day).padStart(2, '0') + '/' + String(dateParts.month + 1).padStart(2, '0');
            
            const totalVal = (entry.quantity * entry.unitPrice) || 0;
            const statusClass = entry.status === 'Pago' ? 'paid' : 'pending';
            const badgePay = `<span class="badge-pay ${statusClass}">${entry.status || 'Pendente'}</span>`;
            const obsHtml = entry.notes ? `<div class="notes-text" title="${entry.notes}">${entry.notes}</div>` : '<span class="text-muted">-</span>';
            
            tr.innerHTML = `
                <td data-label="Data"><strong>${dayLabel}</strong></td>
                <td data-label="Cliente">${entry.client || ''}</td>
                <td data-label="Serviço/Produto">${entry.service || ''}</td>
                <td data-label="Quant.">${entry.quantity || 1}</td>
                <td data-label="Val. Unitário">${formatCurrency(entry.unitPrice || 0)}</td>
                <td data-label="Total (R$)"><span class="earnings-lbl">${formatCurrency(totalVal)}</span></td>
                <td data-label="Status">${badgePay}</td>
                <td data-label="Observações">${obsHtml}</td>
                <td class="actions-col">
                    <button class="edit-btn" aria-label="Editar serviço">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </td>
            `;
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', (e) => {
                openEditServiceModal(entry.id);
            });
            tableBody.appendChild(tr);
        });
    } else {
        if (state.filteredRows.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum registro de ponto encontrado para este mês ou busca.</td></tr>';
            renderCalendarGrid();
            return;
        }
        
        state.filteredRows.forEach(row => {
            const tr = document.createElement('tr');
            tr.id = `history-row-${row.rowNum}`;
            
            const dateParts = parseDateParts(row.date);
            const dayLabel = String(dateParts.day).padStart(2, '0') + '/' + String(dateParts.month + 1).padStart(2, '0');
            
            const badgeE1 = row.entrada1 ? `<span class="badge-time active">${row.entrada1}</span>` : '<span class="badge-time">--:--</span>';
            const badgeS1 = row.saida1 ? `<span class="badge-time active">${row.saida1}</span>` : '<span class="badge-time">--:--</span>';
            const badgeE2 = row.entrada2 ? `<span class="badge-time active">${row.entrada2}</span>` : '<span class="badge-time">--:--</span>';
            const badgeS2 = row.saida2 ? `<span class="badge-time active">${row.saida2}</span>` : '<span class="badge-time">--:--</span>';

            const statusClass = row.statusPagamento === 'Pago' ? 'paid' : 'pending';
            const statusText = row.statusPagamento === 'Pago' ? 'Pago' : 'Pendente';
            const badgePay = `<span class="badge-pay ${statusClass}">${statusText}</span>`;

            const obsHtml = row.observacoes ? `<div class="notes-text" title="${row.observacoes}">${row.observacoes}</div>` : '<span class="text-muted">-</span>';

            tr.innerHTML = `
                <td data-label="Data" class="clickable-cell"><strong>${dayLabel}</strong></td>
                <td data-label="Dia Semana" class="clickable-cell">${row.weekday}</td>
                <td data-label="Turno 1" class="clickable-cell">${badgeE1} → ${badgeS1}</td>
                <td data-label="Turno 2" class="clickable-cell">${badgeE2} → ${badgeS2}</td>
                <td data-label="Total Horas" class="clickable-cell"><span class="total-hours-lbl">${row.horasMinutos}</span></td>
                <td data-label="Ganhos (R$)" class="clickable-cell"><span class="earnings-lbl">${formatCurrency(row.ganhos)}</span></td>
                <td data-label="Status" class="clickable-cell">${badgePay}</td>
                <td data-label="Notas" class="clickable-cell">${obsHtml}</td>
                <td class="actions-col" data-label="Ações">
                    <button class="edit-btn" aria-label="Editar dia">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </td>
            `;
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => {
                triggerRowEdit(row.rowNum);
            });
            tableBody.appendChild(tr);
        });
    }

    renderCalendarGrid();
}

function renderCalendarGrid() {
    const gridBody = document.getElementById('calendar-days-grid-body');
    gridBody.innerHTML = '';
    
    const year = state.selectedYear;
    const month = state.selectedMonth;
    
    const firstDayDate = new Date(Date.UTC(year, month, 1));
    const firstDayOfWeek = firstDayDate.getUTCDay();
    const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day-cell empty';
        gridBody.appendChild(emptyCell);
    }
    
    const dayMap = {};
    if (state.appMode === 'services') {
        (state.servicesEntries || []).forEach(entry => {
            const dateParts = parseDateParts(entry.date);
            if (dateParts.month === month && dateParts.year === year) {
                if (!dayMap[dateParts.day]) {
                    dayMap[dateParts.day] = { total: 0, count: 0, entries: [] };
                }
                dayMap[dateParts.day].total += (entry.quantity * entry.unitPrice) || 0;
                dayMap[dateParts.day].count++;
                dayMap[dateParts.day].entries.push(entry);
            }
        });
    } else {
        state.rows.forEach(row => {
            const dateParts = parseDateParts(row.date);
            if (dateParts.month === month && dateParts.year === year) {
                dayMap[dateParts.day] = row;
            }
        });
    }

    for (let d = 1; d <= totalDays; d++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';
        const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        if (state.appMode === 'services') {
            const dayData = dayMap[d];
            if (dayData) {
                cell.classList.add('day-full');
                cell.innerHTML = `
                    <span class="cal-day-num">${d}</span>
                    <span class="cal-day-hours" style="color:var(--accent-green); font-size:0.65rem;">R$ ${Math.round(dayData.total)}</span>
                `;
                cell.addEventListener('click', () => {
                    // Abrir lista ou editar primeiro serviço
                    openEditServiceModal(dayData.entries[0].id);
                });
            } else {
                cell.classList.add('day-off');
                cell.innerHTML = `
                    <span class="cal-day-num">${d}</span>
                    <span class="cal-day-hours">-</span>
                `;
                cell.addEventListener('click', () => {
                    openNewServiceModal(cellDate);
                });
            }
        } else {
            const row = dayMap[d];
            let hoursStr = '00:00';
            let workedHours = 0;
            
            if (row) {
                workedHours = row.horasFracionarias;
                hoursStr = row.horasMinutos;
                
                if (row.minutosTrabalhados === 0) {
                    cell.classList.add('day-off');
                } else if (workedHours < 4) {
                    cell.classList.add('day-short');
                } else if (workedHours < 8) {
                    cell.classList.add('day-partial');
                } else {
                    cell.classList.add('day-full');
                }
                
                cell.addEventListener('click', () => openEditModal(row));
            } else {
                cell.classList.add('day-off');
            }
            
            cell.innerHTML = `
                <span class="cal-day-num">${d}</span>
                <span class="cal-day-hours">${hoursStr}</span>
            `;
        }
        gridBody.appendChild(cell);
    }
}

// 3. Gestão Financeira (Aba Mobills)
function renderFinance() {
    // 3.1. Calcular Faturamento Automático do Controle de Horas do mês atual
    let hoursIncome = 0;
    state.filteredRows.forEach(row => {
        hoursIncome += row.ganhos;
    });

    // 3.2. Calcular Despesas e Ganhos Extras cadastrados
    let extraIncome = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;
    let cardExpenses = 0;

    state.filteredFinanceEntries.forEach(entry => {
        if (entry.type === 'Ganho Extra') {
            extraIncome += entry.amount;
        } else if (entry.type === 'Despesa Fixa') {
            fixedExpenses += entry.amount;
        } else if (entry.type === 'Despesa Variável') {
            variableExpenses += entry.amount;
        } else if (entry.type === 'Gastos Cartão') {
            cardExpenses += entry.amount;
        }
    });

    const totalIncome = hoursIncome + extraIncome;
    const totalExpenses = fixedExpenses + variableExpenses + cardExpenses;
    const netBalance = totalIncome - totalExpenses;

    // Injetar KPIs Financeiros
    document.getElementById('fin-month-income').innerText = formatCurrency(totalIncome);
    document.getElementById('fin-month-income-subtitle').innerText = `Horas (${formatCurrency(hoursIncome)}) + Extras (${formatCurrency(extraIncome)})`;
    
    document.getElementById('fin-month-expenses').innerText = formatCurrency(totalExpenses);
    document.getElementById('fin-month-expenses-subtitle').innerText = `Fixo (${formatCurrency(fixedExpenses)}) + Var. (${formatCurrency(variableExpenses)}) + Cartão (${formatCurrency(cardExpenses)})`;

    // Investimento retido das horas pagas
    let paidHoursIncome = 0;
    state.filteredRows.forEach(row => {
        if (row.statusPagamento === 'Pago') {
            paidHoursIncome += row.ganhos;
        }
    });
    const monthlyAutoInvested = paidHoursIncome * (state.investPercent / 100);
    const finInvestedEl = document.getElementById('fin-month-invested');
    if (finInvestedEl) {
        finInvestedEl.innerText = formatCurrency(monthlyAutoInvested);
    }
    const finInvestedTitleEl = document.getElementById('fin-month-invested-title');
    if (finInvestedTitleEl) {
        finInvestedTitleEl.innerText = `Enviado p/ Investimentos (${state.investPercent}%)`;
    }

    const netEl = document.getElementById('fin-month-net');
    netEl.innerText = formatCurrency(netBalance);
    netEl.className = `metric-value ${netBalance >= 0 ? 'text-success' : 'text-danger'}`;

    // Guard para o antigo KPI de fatura do cartão
    const kpiCardBill = document.getElementById('kpi-card-bill');
    if (kpiCardBill) {
        kpiCardBill.innerText = formatCurrency(cardExpenses);
    }

    // Renderizar Gráfico de Comparação Ganhos vs Despesas (NOVO)
    renderComparisonChart();

    // 3.3. Renderizar Extrato com Categoria de ícones Premium (Conversando com Horas)
    const extractList = document.getElementById('finance-extract-list');
    extractList.innerHTML = '';

    // Injetar virtualmente o rendimento de faturamento das horas como Receita Principal!
    if (hoursIncome > 0) {
        const item = document.createElement('div');
        item.className = 'extract-item';
        
        const meta = categoriesMeta['Trabalho'];
        item.innerHTML = `
            <div class="extract-item-left">
                <div class="extract-icon" style="background-color: ${meta.bg}; color: ${meta.color}">
                    <i class="fa-solid ${meta.icon}"></i>
                </div>
                <div class="extract-info">
                    <span class="extract-desc">Rendimento Controle de Horas</span>
                    <span class="extract-subinfo">Calculado automaticamente via pontos</span>
                </div>
            </div>
            <div class="flex-between">
                <span class="extract-amount income">+ ${formatCurrency(hoursIncome)}</span>
            </div>
        `;
        extractList.appendChild(item);
    }

    // Injetar virtualmente a transferência automática de Investimentos do faturamento Pago do mês
    if (monthlyAutoInvested > 0) {
        const item = document.createElement('div');
        item.className = 'extract-item';
        
        item.innerHTML = `
            <div class="extract-item-left">
                <div class="extract-icon" style="background-color: rgba(16, 185, 129, 0.15); color: var(--accent-green)">
                    <i class="fa-solid fa-vault"></i>
                </div>
                <div class="extract-info">
                    <span class="extract-desc">Reserva ${state.investPercent}% p/ Investimentos</span>
                    <span class="extract-subinfo">Transferido automaticamente do faturamento Pago</span>
                </div>
            </div>
            <div class="flex-between">
                <span class="extract-amount expense" style="color: var(--accent-green)">- ${formatCurrency(monthlyAutoInvested)}</span>
            </div>
        `;
        extractList.appendChild(item);
    }

    if (state.filteredFinanceEntries.length === 0 && hoursIncome === 0) {
        extractList.innerHTML = '<div class="text-center text-muted p-4">Nenhuma transação financeira neste mês.</div>';
    } else {
        state.filteredFinanceEntries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'extract-item';
            
            const meta = categoriesMeta[entry.category] || categoriesMeta['Outros'];
            const isIncome = entry.type === 'Ganho Extra';
            const signal = isIncome ? '+' : '-';
            const amtClass = isIncome ? 'income' : 'expense';

            const dateParts = parseDateParts(entry.date);
            const dateStr = String(dateParts.day).padStart(2, '0') + '/' + String(dateParts.month + 1).padStart(2, '0');

            item.innerHTML = `
                <div class="extract-item-left clickable-cell" onclick="triggerFinanceEdit('${entry.id}')" style="cursor: pointer;">
                    <div class="extract-icon" style="background-color: ${meta.bg}; color: ${meta.color}">
                        <i class="fa-solid ${meta.icon}"></i>
                    </div>
                    <div class="extract-info">
                        <span class="extract-desc">${entry.description}</span>
                        <span class="extract-subinfo">${dateStr} • ${entry.category} (${entry.type})</span>
                    </div>
                </div>
                <div class="flex-between">
                    <span class="extract-amount ${amtClass}">${signal} ${formatCurrency(entry.amount)}</span>
                    
                    <div style="display: flex; gap: 0.25rem; margin-left: 0.75rem;">
                        <button class="edit-btn" onclick="triggerFinanceEdit('${entry.id}')" aria-label="Editar transação" style="font-size: 0.85rem;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="delete-fin-btn" onclick="triggerFinanceDelete('${entry.id}')" aria-label="Deletar transação" style="margin-left: 0;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
            extractList.appendChild(item);
        });
    }

    // 3.4. Renderizar Gráfico de Rosca (Doughnut) de Despesas
    renderFinanceChart(fixedExpenses, variableExpenses, cardExpenses);
}

// Renderizar o gráfico de rosca de despesas
function renderFinanceChart(fixed, variable, card) {
    const canvas = document.getElementById('chart-finance-doughnut');
    if (!canvas) return;

    if (state.financeChart) {
        state.financeChart.destroy();
    }

    if (fixed === 0 && variable === 0 && card === 0) {
        // Se sem despesas, desenha rosca vazia para não quebrar layout
        fixed = 1;
    }

    const isDark = !document.body.classList.contains('light-theme');
    const textColor = isDark ? '#9ca3af' : '#4b5563';

    state.financeChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Despesas Fixas', 'Despesas Variáveis', 'Gastos Cartão'],
            datasets: [{
                data: [fixed, variable, card],
                backgroundColor: [
                    'rgba(139, 92, 246, 0.75)', // Roxo
                    'rgba(59, 130, 246, 0.75)',  // Azul
                    'rgba(99, 102, 241, 0.75)'   // Indigo
                ],
                borderColor: isDark ? '#121826' : '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: { family: 'Outfit', size: 11 }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Acionar exclusão a partir da extrato
window.triggerFinanceDelete = function(id) {
    if (confirm('Deseja excluir permanentemente este lançamento financeiro da planilha?')) {
        deleteFinanceEntry(id);
    }
};

// 4. Trajetos, Deslocamentos e Alarmes
function renderCommutes() {
    const tableBody = document.getElementById('commute-table-body');
    tableBody.innerHTML = '';

    // Filtrar linhas que tenham registros de trajetos ou horários de ausência
    const commuteRows = state.filteredRows.filter(r => r.saidaCasa || r.chegadaCasa);

    // Calcular Médias Globais
    let totalCommuteMinutes = 0;
    let totalOutsideMinutes = 0;
    let countedCommutes = 0;
    let countedOutside = 0;

    state.filteredRows.forEach(row => {
        if (row.minutosTrajeto > 0) {
            totalCommuteMinutes += row.minutosTrajeto;
            countedCommutes++;
        }
        if (row.minutosForaCasa > 0) {
            totalOutsideMinutes += row.minutosForaCasa;
            countedOutside++;
        }
    });

    const avgCommute = countedCommutes > 0 ? totalCommuteMinutes / countedCommutes : 0;
    const avgOutside = countedOutside > 0 ? totalOutsideMinutes / countedOutside : 0;

    // Atualizar KPIs de trajetos
    document.getElementById('kpi-commute-avg').innerText = formatMinutesToHoursStr(avgCommute);
    document.getElementById('kpi-outside-avg').innerText = formatMinutesToHoursStr(avgOutside);
    document.getElementById('kpi-commute-count').innerText = `${countedCommutes} dias`;

    if (commuteRows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum deslocamento diário registrado para este mês.</td></tr>';
        return;
    }

    commuteRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.id = `commute-row-${row.rowNum}`;

        const dateParts = parseDateParts(row.date);
        const dayLabel = String(dateParts.day).padStart(2, '0') + '/' + String(dateParts.month + 1).padStart(2, '0');

        const activeE1 = row.entrada1 || '--:--';
        const lastExit = row.saida2 ? row.saida2 : (row.saida1 || '--:--');

        // Formatar badges
        const badgeSaidaCasa = row.saidaCasa ? `<span class="badge-time active">${row.saidaCasa}</span>` : '<span class="badge-time">--:--</span>';
        const badgeChegadaCasa = row.chegadaCasa ? `<span class="badge-time active">${row.chegadaCasa}</span>` : '<span class="badge-time">--:--</span>';
        
        tr.innerHTML = `
            <td data-label="Data" class="clickable-cell"><strong>${dayLabel} (${row.weekday.split('-')[0]})</strong></td>
            <td data-label="Saída Casa" class="clickable-cell">${badgeSaidaCasa}</td>
            <td data-label="Entrada" class="clickable-cell">${activeE1}</td>
            <td data-label="Saída" class="clickable-cell">${lastExit}</td>
            <td data-label="Chegada Casa" class="clickable-cell">${badgeChegadaCasa}</td>
            <td data-label="Tempo Trajeto" class="clickable-cell"><strong class="color-blue">${row.tempoTrajeto}</strong></td>
            <td data-label="Tempo Fora" class="clickable-cell"><strong class="color-purple">${row.tempoForaCasa}</strong></td>
            <td class="actions-col" data-label="Ações">
                <button class="edit-btn" aria-label="Editar trajeto">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </td>
        `;
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => {
            triggerRowEdit(row.rowNum);
        });
        tableBody.appendChild(tr);
    });
}

// 5. Gráfico de Controle de Horas e Faturamento (Chart.js Principal)
function renderCharts() {
    const canvas = document.getElementById('chart-earnings-hours');
    if (!canvas) return;
    
    if (state.chart) {
        state.chart.destroy();
    }
    
    if (state.filteredRows.length === 0) {
        return;
    }
    
    const labels = [];
    const earningsData = [];
    const hoursData = [];
    
    state.filteredRows.forEach(row => {
        const dateParts = parseDateParts(row.date);
        labels.push(`Dia ${dateParts.day}`);
        earningsData.push(row.ganhos);
        hoursData.push(row.horasFracionarias);
    });

    const ctx = canvas.getContext('2d');
    
    // Gradiente de Ganhos (Verde)
    const earningsGradient = ctx.createLinearGradient(0, 0, 0, 300);
    earningsGradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    earningsGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    
    // Gradiente de Horas (Azul)
    const hoursGradient = ctx.createLinearGradient(0, 0, 0, 300);
    hoursGradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
    hoursGradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    const isDark = !document.body.classList.contains('light-theme');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#4b5563';

    state.chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ganhos (R$)',
                    data: earningsData,
                    type: 'line',
                    fill: true,
                    backgroundColor: earningsGradient,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    yAxisID: 'y-earnings'
                },
                {
                    label: 'Horas Trabalhadas',
                    data: hoursData,
                    type: 'line',
                    fill: true,
                    backgroundColor: hoursGradient,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1,
                    yAxisID: 'y-hours'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: { family: 'Outfit', size: 12 }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Outfit' } }
                },
                'y-earnings': {
                    type: 'linear',
                    position: 'left',
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit' },
                        callback: function(value) { return 'R$ ' + value; }
                    },
                    title: {
                        display: true,
                        text: 'Faturamento (R$)',
                        color: textColor,
                        font: { family: 'Outfit', weight: 600 }
                    }
                },
                'y-hours': {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit' },
                        callback: function(value) { return value + 'h'; }
                    },
                    title: {
                        display: true,
                        text: 'Horas Diárias',
                        color: textColor,
                        font: { family: 'Outfit', weight: 600 }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements && elements.length > 0) {
                    const index = elements[0].index;
                    const dataPoint = state.chart.data.labels[index];
                    const dayNum = parseInt(dataPoint.replace('Dia ', ''), 10);
                    
                    const targetRow = state.filteredRows.find(row => {
                        const dateParts = parseDateParts(row.date);
                        return dateParts.day === dayNum;
                    });
                    
                    if (targetRow) {
                        openEditModal(targetRow);
                        showToast(`Abrindo dia ${dayNum} para edição!`, 'success');
                    }
                }
            }
        }
    });

    renderYearlyOverviewChart();
}

function renderYearlyOverviewChart() {
    const canvas = document.getElementById('chart-yearly-overview');
    if (!canvas) return;
    
    if (state.yearlyChart) {
        state.yearlyChart.destroy();
    }
    
    if (state.rows.length === 0) {
        return;
    }
    
    const ptMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const ptMonthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyMinutes = Array(12).fill(0);
    const monthlyEarnings = Array(12).fill(0);
    
    state.rows.forEach(row => {
        const dateParts = parseDateParts(row.date);
        if (dateParts && !isNaN(dateParts.month) && dateParts.month >= 0 && dateParts.month < 12) {
            monthlyMinutes[dateParts.month] += row.minutosTrabalhados || 0;
            monthlyEarnings[dateParts.month] += row.ganhos || 0;
        }
    });

    const ctx = canvas.getContext('2d');
    
    const isDark = !document.body.classList.contains('light-theme');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#4b5563';

    state.yearlyChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ptMonthsShort,
            datasets: [
                {
                    label: 'Ganhos (R$)',
                    data: monthlyEarnings,
                    backgroundColor: 'rgba(16, 185, 129, 0.65)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1.5,
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'Horas Trabalhadas',
                    data: monthlyMinutes.map(min => Number((min / 60).toFixed(1))),
                    backgroundColor: 'rgba(59, 130, 246, 0.65)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1.5,
                    borderRadius: 4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: { family: 'Outfit', size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Ganhos: ${formatCurrency(context.raw)}`;
                            } else {
                                const totalMin = monthlyMinutes[context.dataIndex];
                                return `Horas: ${formatMinutesToHoursStr(totalMin)}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Outfit' } }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit' },
                        callback: function(value) { return 'R$ ' + value; }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit' },
                        callback: function(value) { return value + 'h'; }
                    }
                }
            },
            onClick: (event, elements) => {
                if (elements && elements.length > 0) {
                    const activeElement = elements[0];
                    const monthIndex = activeElement.index; // 0 a 11
                    
                    const monthSelect = document.getElementById('filter-month');
                    if (monthSelect) {
                        monthSelect.value = monthIndex;
                        applyFilters();
                        showToast(`Filtrado por ${ptMonths[monthIndex]} de 2026`, 'info');
                    }
                }
            }
        }
    });
}

// ==========================================================================
// MODAL FOR ABSOLUTE MANUAL EDITING
// ==========================================================================
function openEditModal(row) {
    document.getElementById('edit-row-num').value = row.rowNum;
    
    // Injetar valores do dia selecionado
    document.getElementById('edit-date').value = row.date;
    document.getElementById('edit-weekday').value = row.weekday;
    document.getElementById('edit-e1').value = row.entrada1 || '';
    document.getElementById('edit-s1').value = row.saida1 || '';
    document.getElementById('edit-e2').value = row.entrada2 || '';
    document.getElementById('edit-s2').value = row.saida2 || '';
    document.getElementById('edit-day-rate').value = row.valorHora || '';
    document.getElementById('edit-obs').value = row.observacoes || '';
    let manualEarningsStr = '';
    if (row.ganhosManuais !== null && row.ganhosManuais !== undefined && !isNaN(Number(row.ganhosManuais))) {
        manualEarningsStr = Number(row.ganhosManuais).toFixed(2);
    }
    document.getElementById('edit-earnings').value = manualEarningsStr;
    document.getElementById('edit-earnings').placeholder = `Calculado: R$ ${Number(row.ganhos || 0).toFixed(2)}`;
    
    // Injetar valores adicionais de status e trajets
    document.getElementById('edit-pay-status').value = row.statusPagamento || 'Pendente';
    document.getElementById('edit-saida-casa').value = row.saidaCasa || '';
    document.getElementById('edit-chegada-casa').value = row.chegadaCasa || '';
    
    // Formatar título do modal
    const dateParts = parseDateParts(row.date);
    const dateFormatted = String(dateParts.day).padStart(2, '0') + ' de ' + ptMonths[dateParts.month];
    document.getElementById('modal-date-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editar Dia ${dateFormatted}`;

    // Rodar recálculo de pré-visualização ao carregar
    runLivePreview();

    // Mostrar modal
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Travar scroll no fundo
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ==========================================================================
// CONTROLADORES DO MODAL DE SERVIÇOS & ALTERNÂNCIA DE MODO (V5)
// ==========================================================================
window.setAppMode = function(mode) {
    state.appMode = mode;
    localStorage.setItem('app_active_mode', mode);
    
    const btnHours = document.getElementById('btn-mode-hours');
    const btnServices = document.getElementById('btn-mode-services');
    const descEl = document.getElementById('dashboard-greeting-desc');
    
    if (btnHours && btnServices) {
        if (mode === 'services') {
            btnHours.classList.remove('active');
            btnHours.style.background = 'transparent';
            btnHours.style.color = 'var(--text-secondary)';
            
            btnServices.classList.add('active');
            btnServices.style.background = 'rgba(16, 185, 129, 0.2)';
            btnServices.style.color = 'var(--accent-green, #00e5a0)';
            
            // Exibir botão de lançar serviço
            const quickSvcBtn = document.getElementById('quick-service-btn');
            if (quickSvcBtn) quickSvcBtn.style.display = 'flex';
            
            if (descEl) descEl.innerText = 'Gerencie seus serviços, vendas e contratos';
        } else {
            btnServices.classList.remove('active');
            btnServices.style.background = 'transparent';
            btnServices.style.color = 'var(--text-secondary)';
            
            btnHours.classList.add('active');
            btnHours.style.background = 'rgba(56, 189, 248, 0.2)';
            btnHours.style.color = 'var(--accent-blue, #38bdf8)';
            
            // Ocultar botão de lançar serviço
            const quickSvcBtn = document.getElementById('quick-service-btn');
            if (quickSvcBtn) quickSvcBtn.style.display = 'none';
            
            if (descEl) descEl.innerText = 'Pronto para gerenciar suas horas?';
        }
    }
    
    applyFilters();
};

window.openNewServiceModal = function(dateStr) {
    const today = new Date();
    const formattedToday = dateStr || today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
    
    document.getElementById('service-id').value = '';
    document.getElementById('service-date').value = formattedToday;
    document.getElementById('service-status').value = 'Pendente';
    document.getElementById('service-client').value = '';
    document.getElementById('service-name').value = '';
    document.getElementById('service-quantity').value = 1;
    document.getElementById('service-unit-price').value = '';
    document.getElementById('service-notes').value = '';
    
    document.getElementById('service-modal-title').innerHTML = `<i class="fa-solid fa-file-invoice-dollar color-green"></i> Lançar Serviço / Venda`;
    document.getElementById('service-total-preview').innerText = 'R$ 0,00';
    document.getElementById('btn-delete-service').style.display = 'none';
    
    const modal = document.getElementById('service-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.openEditServiceModal = function(id) {
    const entry = state.servicesEntries.find(e => e.id === id);
    if (!entry) return;
    
    document.getElementById('service-id').value = entry.id;
    document.getElementById('service-date').value = entry.date;
    document.getElementById('service-status').value = entry.status || 'Pendente';
    document.getElementById('service-client').value = entry.client || '';
    document.getElementById('service-name').value = entry.service || '';
    document.getElementById('service-quantity').value = entry.quantity || 1;
    document.getElementById('service-unit-price').value = entry.unitPrice || 0;
    document.getElementById('service-notes').value = entry.notes || '';
    
    document.getElementById('service-modal-title').innerHTML = `<i class="fa-solid fa-pen-to-square color-green"></i> Editar Serviço / Venda`;
    recalcServiceTotal();
    document.getElementById('btn-delete-service').style.display = 'block';
    
    const modal = document.getElementById('service-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeServiceModal = function() {
    const modal = document.getElementById('service-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
};

window.recalcServiceTotal = function() {
    const qty = parseFloat(document.getElementById('service-quantity').value) || 0;
    const price = parseFloat(document.getElementById('service-unit-price').value) || 0;
    const total = qty * price;
    document.getElementById('service-total-preview').innerText = formatCurrency(total);
};

window.saveServiceEntry = async function() {
    const id = document.getElementById('service-id').value || generateId();
    const date = document.getElementById('service-date').value;
    const status = document.getElementById('service-status').value;
    const client = document.getElementById('service-client').value.trim();
    const service = document.getElementById('service-name').value.trim();
    const quantity = parseFloat(document.getElementById('service-quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('service-unit-price').value) || 0;
    const notes = document.getElementById('service-notes').value.trim();
    
    if (!date || !client || !service || quantity <= 0 || unitPrice < 0) {
        showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const entry = { id, date, status, client, service, quantity, unitPrice, notes };
    
    try {
        await dbPut('services', entry);
        showToast('Registro de serviço/venda salvo!', 'success');
        closeServiceModal();
        await fetchData();
    } catch (e) {
        console.error(e);
        showToast('Erro ao salvar registro no banco local!', 'error');
    }
};

window.deleteServiceEntry = async function(id) {
    if (!id) return;
    if (!confirm('Deseja realmente excluir este registro de serviço/venda?')) return;
    try {
        await dbDelete('services', id);
        showToast('Registro excluído!', 'success');
        closeServiceModal();
        await fetchData();
    } catch (e) {
        console.error(e);
        showToast('Erro ao excluir do banco local!', 'error');
    }
};

// Função de cálculo imediato na visualização do Modal
function runLivePreview() {
    const e1 = document.getElementById('edit-e1').value;
    const s1 = document.getElementById('edit-s1').value;
    const e2 = document.getElementById('edit-e2').value;
    const s2 = document.getElementById('edit-s2').value;
    
    const saidaCasa = document.getElementById('edit-saida-casa').value;
    const chegadaCasa = document.getElementById('edit-chegada-casa').value;
    
    const customRate = document.getElementById('edit-day-rate').value;
    const hourlyRate = customRate ? parseFloat(customRate) : state.globalRate;

    // Recalcular worked hours
    const workedMinutes = calculateWorkedMinutes(e1, s1, e2, s2);
    const workedHours = workedMinutes / 60;
    let earnings = workedHours * hourlyRate;
    
    // Prioritize manual earnings override if filled
    const manualEarn = document.getElementById('edit-earnings').value;
    if (manualEarn !== '') {
        earnings = parseFloat(manualEarn) || 0;
    }
    
    // Recalcular commute trajetos
    const commuteMinutes = calculateCommuteMinutes(saidaCasa, e1, s1, e2, s2, chegadaCasa);
    const timeOutsideMinutes = calculateTimeOutsideMinutes(saidaCasa, chegadaCasa);
    
    document.getElementById('preview-hours').innerText = minutesToTimeStr(workedMinutes);
    document.getElementById('preview-earnings').innerText = formatCurrency(earnings);
    document.getElementById('preview-commute').innerText = minutesToTimeStr(commuteMinutes);
    document.getElementById('preview-outside').innerText = minutesToTimeStr(timeOutsideMinutes);
}

// Acionar Edição de Linha a partir da Lista global
window.triggerRowEdit = function(rowNum) {
    const row = state.rows.find(r => r.rowNum === rowNum);
    if (row) {
        openEditModal(row);
    }
};

// Modo offline: MacroDroid não é necessário

// ==========================================================================
// EVENT BINDINGS
// ==========================================================================
function bindEvents() {
    // 0. Botão de sincronização manual (Sync Badge) - modo offline
    const syncBadgeEl = document.getElementById('sync-status');
    if (syncBadgeEl) {
        syncBadgeEl.addEventListener('click', async () => {
            showToast('Atualizando dados do armazenamento local...', 'info');
            await fetchData();
        });
    }

    // 1. Navegação de Abas
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const tab = item.getAttribute('data-tab');
            state.activeTab = tab;
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
            
            // Recriar gráficos se aba for aberta
            if (tab === 'dashboard') {
                setTimeout(renderCharts, 50);
            } else if (tab === 'finance') {
                setTimeout(renderFinance, 50);
            } else if (tab === 'investments') {
                setTimeout(renderInvestments, 50);
            } else if (tab === 'commutes') {
                setTimeout(renderCommutes, 50);
            } else if (tab === 'settings') {
                // offline: sem servidor para buscar info de rede
            } else if (tab === 'tools') {
                setTimeout(renderToolsTab, 50);
            }
        });
    });

    // 2. Filtros e Pesquisa
    document.getElementById('filter-month').addEventListener('change', applyFilters);
    document.getElementById('search-notes').addEventListener('input', applyFilters);

    const btnClearFilters = document.getElementById('btn-clear-filters');
    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
            document.getElementById('filter-month').value = new Date().getMonth();
            document.getElementById('search-notes').value = '';
            
            const rangeStartEl = document.getElementById('range-start');
            const rangeEndEl = document.getElementById('range-end');
            if (rangeStartEl) rangeStartEl.value = '';
            if (rangeEndEl) rangeEndEl.value = '';
            
            state.rangeStart = '';
            state.rangeEnd = '';
            state.selectedMonth = new Date().getMonth();
            
            applyFilters();
            showToast('Filtros limpos!', 'info');
        });
    }

    // 3. Modos de Visualização (Histórico Tabela vs Calendário)
    document.getElementById('btn-view-list').addEventListener('click', () => {
        document.getElementById('btn-view-list').classList.add('active');
        document.getElementById('btn-view-calendar').classList.remove('active');
        document.getElementById('history-list-view').classList.remove('hidden');
        document.getElementById('history-calendar-view').classList.add('hidden');
        state.viewMode = 'list';
    });

    document.getElementById('btn-view-calendar').addEventListener('click', () => {
        document.getElementById('btn-view-calendar').classList.add('active');
        document.getElementById('btn-view-list').classList.remove('active');
        document.getElementById('history-calendar-view').classList.remove('hidden');
        document.getElementById('history-list-view').classList.add('hidden');
        state.viewMode = 'calendar';
        setTimeout(renderCalendarGrid, 50);
    });

    // 4. Seletor de Período Customizado (De / Até) no Dashboard
    document.getElementById('btn-apply-range').addEventListener('click', () => {
        const start = document.getElementById('range-start').value;
        const end = document.getElementById('range-end').value;
        
        if (!start || !end) {
            showToast('Por favor, defina ambas as datas (De e Até)!', 'error');
            return;
        }
        if (start > end) {
            showToast('A data "De" não pode ser posterior à data "Até"!', 'error');
            return;
        }
        
        state.rangeStart = start;
        state.rangeEnd = end;
        
        // Ativar botão de limpar
        const btnClear = document.getElementById('btn-clear-range');
        btnClear.classList.remove('hidden');
        document.getElementById('btn-apply-range').innerText = 'Filtro de Período Ativo';
        
        showToast('Filtro de período aplicado com sucesso!', 'success');
        applyFilters();
    });

    document.getElementById('btn-clear-range').addEventListener('click', () => {
        state.rangeStart = '';
        state.rangeEnd = '';
        document.getElementById('range-start').value = '';
        document.getElementById('range-end').value = '';
        
        document.getElementById('btn-clear-range').classList.add('hidden');
        document.getElementById('btn-apply-range').innerText = 'Aplicar Filtro Personalizado';
        
        document.getElementById('range-res-hours').innerText = '00h 00m';
        document.getElementById('range-res-earnings').innerText = 'R$ 0,00';
        
        showToast('Filtro de período limpo!', 'success');
        applyFilters();
    });

    // Atualização reativa de cálculos reativos no seletor De/Até
    const rangeInputs = ['range-start', 'range-end'];
    rangeInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            const start = document.getElementById('range-start').value;
            const end = document.getElementById('range-end').value;
            if (start && end) {
                // Calcular dados deste período
                let minutes = 0;
                let earnings = 0;
                
                state.rows.forEach(row => {
                    if (row.date >= start && row.date <= end) {
                        minutes += row.minutosTrabalhados;
                        earnings += row.ganhos;
                    }
                });
                
                document.getElementById('range-res-hours').innerText = formatMinutesToHoursStr(minutes);
                document.getElementById('range-res-earnings').innerText = formatCurrency(earnings);
            }
        });
    });

    // 5. Calculadora de Corte e Quitação de Lote
    document.getElementById('pay-cutoff-date').addEventListener('change', (e) => {
        const dateLimit = e.target.value;
        const btnQuit = document.getElementById('btn-quit-batch');
        
        if (!dateLimit) {
            document.getElementById('cutoff-pending-val').innerText = 'R$ 0,00';
            btnQuit.disabled = true;
            return;
        }

        let totalPending = 0;

        state.rows.forEach(row => {
            if (row.date <= dateLimit && row.statusPagamento === 'Pendente') {
                totalPending += row.ganhos;
            }
        });

        document.getElementById('cutoff-pending-val').innerText = formatCurrency(totalPending);
        
        if (totalPending > 0) {
            btnQuit.disabled = false;
        } else {
            btnQuit.disabled = true;
        }
    });

    document.getElementById('btn-quit-batch').addEventListener('click', () => {
        const dateLimit = document.getElementById('pay-cutoff-date').value;
        const amtText = document.getElementById('cutoff-pending-val').innerText;
        if (confirm(`Deseja confirmar o recebimento de ${amtText} e marcar todos os pontos até ${dateLimit} como PAGOS na planilha?`)) {
            payBatch(dateLimit);
        }
    });

    // 6. Botão Bater Ponto Rápido (1 Toque)
    document.getElementById('quick-clock-btn').addEventListener('click', () => {
        registerClockIn();
    });

    // 7. Modais de Edição e Automação
    document.getElementById('btn-close-modal').addEventListener('click', closeEditModal);
    document.getElementById('btn-cancel-edit').addEventListener('click', closeEditModal);
    
    // Atualizar preview dinâmico no modal ao digitar horários
    const modalInputs = ['edit-e1', 'edit-s1', 'edit-e2', 'edit-s2', 'edit-day-rate', 'edit-saida-casa', 'edit-chegada-casa', 'edit-earnings'];
    modalInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', runLivePreview);
    });

    // Recalcular dia da semana automático ao mudar data real do dia
    document.getElementById('edit-date').addEventListener('change', (e) => {
        const dateVal = e.target.value;
        if (dateVal) {
            const parts = dateVal.split('-');
            const d = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
            const options = { weekday: 'long', timeZone: 'UTC' };
            const weekdayNameRaw = d.toLocaleDateString('en-US', options);
            const weekdayNamePt = weekdaysPt[weekdayNameRaw];
            if (weekdayNamePt) {
                document.getElementById('edit-weekday').value = weekdayNamePt;
            }
        }
    });

    // Botões preenchimento rápido
    document.getElementById('btn-quick-standard').addEventListener('click', () => {
        document.getElementById('edit-e1').value = '08:00';
        document.getElementById('edit-s1').value = '12:00';
        document.getElementById('edit-e2').value = '13:00';
        document.getElementById('edit-s2').value = '17:00';
        document.getElementById('edit-saida-casa').value = '07:15';
        document.getElementById('edit-chegada-casa').value = '17:45';
        runLivePreview();
        showToast('Preenchido turnos e deslocamentos padrões de 8h!', 'success');
    });

    document.getElementById('btn-quick-clear').addEventListener('click', () => {
        document.getElementById('edit-e1').value = '';
        document.getElementById('edit-s1').value = '';
        document.getElementById('edit-e2').value = '';
        document.getElementById('edit-s2').value = '';
        document.getElementById('edit-day-rate').value = '';
        document.getElementById('edit-saida-casa').value = '';
        document.getElementById('edit-chegada-casa').value = '';
        runLivePreview();
        showToast('Campos limpos no formulário!', 'success');
    });

    // Salvar do Modal
    document.getElementById('btn-save-edit').addEventListener('click', async () => {
        const rowNum = document.getElementById('edit-row-num').value;
        const rowData = {
            rowNum: parseInt(rowNum, 10),
            date: document.getElementById('edit-date').value,
            weekday: document.getElementById('edit-weekday').value,
            entrada1: document.getElementById('edit-e1').value || null,
            saida1: document.getElementById('edit-s1').value || null,
            entrada2: document.getElementById('edit-e2').value || null,
            saida2: document.getElementById('edit-s2').value || null,
            valorHora: document.getElementById('edit-day-rate').value || null,
            observacoes: document.getElementById('edit-obs').value || null,
            statusPagamento: document.getElementById('edit-pay-status').value,
            saidaCasa: document.getElementById('edit-saida-casa').value || null,
            chegadaCasa: document.getElementById('edit-chegada-casa').value || null,
            ganhos: document.getElementById('edit-earnings').value || null
        };
        
        // Salvar estado original das linhas para rollback caso ocorra erro de conexão
        const originalRows = JSON.parse(JSON.stringify(state.rows));
        
        // Atualizar memória local imediatamente (Optimistic update)
        const localRowIndex = state.rows.findIndex(r => r.rowNum === rowData.rowNum);
        if (localRowIndex !== -1) {
            const target = state.rows[localRowIndex];
            target.entrada1 = rowData.entrada1;
            target.saida1 = rowData.saida1;
            target.entrada2 = rowData.entrada2;
            target.saida2 = rowData.saida2;
            target.saidaCasa = rowData.saidaCasa;
            target.chegadaCasa = rowData.chegadaCasa;
            target.valorHora = rowData.valorHora;
            target.observacoes = rowData.observacoes;
            target.statusPagamento = rowData.statusPagamento;
            
            // Recalcular horas e trajetos locais para exibição instantânea
            const wMin = calculateWorkedMinutes(rowData.entrada1, rowData.saida1, rowData.entrada2, rowData.saida2);
            target.minutosTrabalhados = wMin;
            target.horasMinutos = minutesToTimeStr(wMin);
            target.horasFracionarias = wMin / 60;
            
            let dayRate = state.globalRate;
            if (rowData.valorHora !== null && rowData.valorHora !== '') {
                dayRate = parseFloat(rowData.valorHora);
            }
            
            if (rowData.ganhos !== null && rowData.ganhos !== '') {
                target.ganhos = parseFloat(rowData.ganhos);
                target.ganhosManuais = parseFloat(rowData.ganhos);
            } else {
                target.ganhos = (wMin / 60) * dayRate;
                target.ganhosManuais = null;
            }
            
            // Atualizar tempo de trajetos locais para exibição instantânea
            const commuteMinutes = calculateCommuteMinutes(rowData.saidaCasa, rowData.entrada1, rowData.saida1, rowData.entrada2, rowData.saida2, rowData.chegadaCasa);
            const timeOutsideMinutes = calculateTimeOutsideMinutes(rowData.saidaCasa, rowData.chegadaCasa);
            target.tempoTrajeto = minutesToTimeStr(commuteMinutes);
            target.minutosTrajeto = commuteMinutes;
            target.tempoForaCasa = minutesToTimeStr(timeOutsideMinutes);
            target.minutosForaCasa = timeOutsideMinutes;

            // Salvar no localStorage e atualizar a tela imediatamente
            saveStateToLocalStorage();
            applyFilters();
        }
        
        closeEditModal();
        
        // Destacar linha editada
        setTimeout(() => {
            const tr = document.getElementById(`history-row-${rowNum}`) || document.getElementById(`commute-row-${rowNum}`);
            if (tr) {
                tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                tr.classList.add('pulse-highlight');
                setTimeout(() => tr.classList.remove('pulse-highlight'), 1600);
            }
        }, 600);
        
        // Tentar gravar no servidor e disparar rollback em caso de falha de conexão
        const success = await saveRow(rowData);
        if (!success) {
            state.rows = originalRows;
            saveStateToLocalStorage();
            applyFilters();
        }
    });

    // 8. Enviar Lançamento Financeiro (Mobills)
    document.getElementById('finance-entry-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        let category = document.getElementById('fin-category').value;
        if (category === 'NEW_CATEGORY') {
            category = document.getElementById('fin-custom-category').value.trim();
            if (!category) {
                showToast('Por favor, digite o nome da nova categoria!', 'error');
                return;
            }
        }

        const entryData = {
            id: document.getElementById('fin-entry-id').value || null,
            date: document.getElementById('fin-date').value,
            type: document.getElementById('fin-type').value,
            description: document.getElementById('fin-desc').value.trim(),
            amount: parseFloat(document.getElementById('fin-amount').value),
            category: category
        };
        
        if (isNaN(entryData.amount) || entryData.amount <= 0) {
            showToast('Por favor, insira um valor financeiro válido!', 'error');
            return;
        }
        
        saveFinanceEntry(entryData);
    });

    // Toggle campo de categoria customizada
    document.getElementById('fin-category').addEventListener('change', (e) => {
        const customInput = document.getElementById('fin-custom-category');
        if (e.target.value === 'NEW_CATEGORY') {
            customInput.classList.remove('hidden');
            customInput.required = true;
            customInput.focus();
        } else {
            customInput.classList.add('hidden');
            customInput.required = false;
        }
    });

    // Ajustar categorias automaticamente ao mudar tipo de transação (Ex: Receitas usam Categoria Trabalho)
    document.getElementById('fin-type').addEventListener('change', (e) => {
        const type = e.target.value;
        const catSelect = document.getElementById('fin-category');
        const customInput = document.getElementById('fin-custom-category');
        customInput.classList.add('hidden');
        customInput.required = false;

        if (type === 'Ganho Extra') {
            catSelect.value = 'Trabalho';
        } else if (type === 'Gastos Cartão') {
            catSelect.value = 'Cartão Crédito';
        } else {
            catSelect.value = 'Moradia';
        }
    });

    // Cancelar Edição Financeira
    document.getElementById('btn-cancel-fin-edit').addEventListener('click', () => {
        document.getElementById('finance-entry-form').reset();
        document.getElementById('fin-entry-id').value = '';
        document.getElementById('fin-custom-category').classList.add('hidden');
        document.getElementById('btn-cancel-fin-edit').classList.add('hidden');
        document.getElementById('fin-form-title').innerHTML = '<i class="fa-solid fa-file-invoice-dollar color-purple"></i> Lançar Transação Financeira';
        showToast('Edição financeira cancelada!', 'success');
    });

    // 9. Salvar Alarmes nas Configurações do App
    document.getElementById('btn-save-alarms').addEventListener('click', () => {
        const departure = document.getElementById('alarm-departure').value;
        const arrival = document.getElementById('alarm-arrival').value;
        
        if (!departure || !arrival) {
            showToast('Defina horários válidos para ambos os alarmes!', 'error');
            return;
        }
        
        state.alarms = { departure, arrival };
        localStorage.setItem('alarms', JSON.stringify(state.alarms));
        showToast('Alarmes de trajeto atualizados com sucesso!', 'success');
    });

    // 9.5 Enviar Lançamento de Investimento Manual
    document.getElementById('invest-entry-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const investData = {
            id: document.getElementById('invest-entry-id').value || null,
            date: document.getElementById('invest-date').value,
            origin: document.getElementById('invest-origin').value.trim(),
            amount: parseFloat(document.getElementById('invest-amount').value)
        };
        
        if (isNaN(investData.amount) || investData.amount <= 0) {
            showToast('Por favor, informe um valor de aporte válido!', 'error');
            return;
        }
        
        saveInvestEntry(investData);
    });

    // Cancelar Edição de Investimento
    document.getElementById('btn-cancel-invest-edit').addEventListener('click', () => {
        document.getElementById('invest-entry-form').reset();
        document.getElementById('invest-entry-id').value = '';
        document.getElementById('btn-cancel-invest-edit').classList.add('hidden');
        document.getElementById('invest-form-title').innerHTML = '<i class="fa-solid fa-wallet color-green"></i> Registrar Aporte Manual';
        showToast('Edição de investimento cancelada!', 'success');
    });

    // Modal do MacroDroid
    document.getElementById('btn-open-macrodroid-guide').addEventListener('click', () => {
        document.getElementById('macrodroid-modal').classList.remove('hidden');
    });
    
    document.getElementById('btn-close-macrodroid-modal').addEventListener('click', () => {
        document.getElementById('macrodroid-modal').classList.add('hidden');
    });
    document.getElementById('btn-close-macrodroid-guide').addEventListener('click', () => {
        document.getElementById('macrodroid-modal').classList.add('hidden');
    });

    // 10. Ajustes Gerais e Taxa Global
    document.getElementById('btn-save-global-rate').addEventListener('click', () => {
        const rate = parseFloat(document.getElementById('input-global-rate').value);
        if (isNaN(rate) || rate < 0) {
            showToast('Valor da taxa horária padrão inválido!', 'error');
            return;
        }
        saveGlobalRate(rate);
    });

    document.getElementById('btn-save-goal').addEventListener('click', () => {
        const goal = parseFloat(document.getElementById('input-goal-earnings').value);
        if (isNaN(goal) || goal < 0) {
            showToast('Por favor, informe uma meta de rendimentos válida!', 'error');
            return;
        }
        state.goalEarnings = goal;
        localStorage.setItem('goalEarnings', goal);
        showToast('Meta financeira mensal salva!', 'success');
        renderDashboard();
    });

    // 10b. Porcentagem de Investimento Automático
    const btnSaveInvestPct = document.getElementById('btn-save-invest-percent');
    if (btnSaveInvestPct) {
        btnSaveInvestPct.addEventListener('click', async () => {
            const pctEl = document.getElementById('input-invest-percent');
            const pct = pctEl ? parseFloat(pctEl.value) : NaN;
            if (isNaN(pct) || pct < 0 || pct > 100) {
                showToast('Porcentagem inválida! Use um valor entre 0 e 100.', 'error');
                return;
            }
            state.investPercent = pct;
            localStorage.setItem('investPercent', pct);
            await dbPut('config', { key: 'investPercent', value: pct });
            await autoSyncInvestments();
            showToast(`Investimento automático definido para ${pct}%!`, 'success');
            applyFilters();
        });
    }

    // 10d. Salvar Perfil do Usuário (Nome, Idade, Gênero)
    const btnSaveUserProfile = document.getElementById('btn-save-user-profile');
    if (btnSaveUserProfile) {
        btnSaveUserProfile.addEventListener('click', async () => {
            const inputUserName = document.getElementById('input-user-name');
            const inputUserAge = document.getElementById('input-user-age');
            const inputUserGender = document.getElementById('input-user-gender');
            
            const nameVal = inputUserName ? inputUserName.value.trim() : 'Premium';
            const ageVal = inputUserAge ? parseInt(inputUserAge.value, 10) : 30;
            const genderVal = inputUserGender ? inputUserGender.value : 'Feminino';
            
            localStorage.setItem('app_user_name', nameVal);
            state.userName = nameVal;
            state.userAge = ageVal;
            state.userGender = genderVal;
            
            try {
                await dbPut('config', { key: 'userName', value: nameVal });
                await dbPut('config', { key: 'userAge', value: ageVal });
                await dbPut('config', { key: 'userGender', value: genderVal });
                
                const gEl = document.getElementById('dashboard-greeting-title');
                if (gEl) gEl.innerText = `Olá, ${nameVal}`;
                showToast('Perfil do usuário atualizado!', 'success');
                
                // Forçar recalculação das frases personalizadas da IA
                if (window.updateDailyQuote) window.updateDailyQuote(true);
            } catch (e) {
                console.error(e);
                showToast('Erro ao salvar perfil no banco!', 'error');
            }
        });
    }

    // 10e. Salvar Chave API do Gemini
    const btnSaveGeminiKey = document.getElementById('btn-save-gemini-key');
    if (btnSaveGeminiKey) {
        btnSaveGeminiKey.addEventListener('click', async () => {
            const inputGeminiKey = document.getElementById('input-gemini-key');
            const val = inputGeminiKey ? inputGeminiKey.value.trim() : '';
            
            state.geminiKey = val;
            try {
                await dbPut('config', { key: 'geminiKey', value: val });
                showToast('Chave API do Gemini salva com sucesso!', 'success');
            } catch (e) {
                console.error(e);
                showToast('Erro ao salvar chave de API!', 'error');
            }
        });
    }

    // Helper para visualizar chave Gemini
    window.toggleGeminiKeyVisibility = function() {
        const input = document.getElementById('input-gemini-key');
        const icon = document.getElementById('gemini-key-visibility-icon');
        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fa-solid fa-eye';
            } else {
                input.type = 'password';
                icon.className = 'fa-solid fa-eye-slash';
            }
        }
    };

    // 10c. Botão de sincronização manual (recarrega do IndexedDB)
    const syncBadge = document.getElementById('sync-status');
    if (syncBadge) {
        syncBadge.addEventListener('click', async () => {
            showToast('Atualizando dados do armazenamento local...', 'info');
            await fetchData();
        });
    }

    // 12. Exportações
    document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
    document.getElementById('btn-export-pdf').addEventListener('click', exportPDFReport);

    // 13. Event Delegation (Removed in favor of direct click binding on tr elements for reliability)
}

// ==========================================================================
// EXPORTING / REPORTING
// ==========================================================================

function exportCSV() {
    if (state.filteredRows.length === 0) {
        showToast('Sem registros de pontos para exportar!', 'error');
        return;
    }
    
    let csv = '\uFEFF';
    csv += 'Data;Dia Semana;Entrada 1;Saída 1;Entrada 2;Saída 2;Total Horas;Valor Dia;Status;Saída Casa;Chegada Casa;Tempo Trajeto;Tempo Fora Casa;Notas\n';
    
    state.filteredRows.forEach(row => {
        const fields = [
            row.date,
            row.weekday,
            row.entrada1 || '',
            row.saida1 || '',
            row.entrada2 || '',
            row.saida2 || '',
            row.horasMinutos,
            row.ganhos.toFixed(2),
            row.statusPagamento,
            row.saidaCasa || '',
            row.chegadaCasa || '',
            row.tempoTrajeto || '',
            row.tempoForaCasa || '',
            row.observacoes || ''
        ];
        csv += fields.join(';') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const filename = `Controle_Premium_${ptMonths[state.selectedMonth]}_2026.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Planilha CSV exportada com sucesso!', 'success');
}

function exportPDFReport() {
    if (state.filteredRows.length === 0) {
        showToast('Sem registros para gerar relatório!', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    const monthName = ptMonths[state.selectedMonth];
    
    let totalMinutes = 0;
    let totalEarnings = 0;
    
    state.filteredRows.forEach(row => {
        totalMinutes += row.minutosTrabalhados;
        totalEarnings += row.ganhos;
    });

    let rowsHtml = '';
    state.filteredRows.forEach(row => {
        const dateParts = parseDateParts(row.date);
        const dateStr = String(dateParts.day).padStart(2, '0') + '/' + String(dateParts.month + 1).padStart(2, '0');
        const statusClass = row.statusPagamento === 'Pago' ? 'color-green' : 'color-orange';
        
        rowsHtml += `
            <tr>
                <td>${dateStr}</td>
                <td>${row.weekday}</td>
                <td>${row.entrada1 || '-'}</td>
                <td>${row.saida1 || '-'}</td>
                <td>${row.entrada2 || '-'}</td>
                <td>${row.saida2 || '-'}</td>
                <td><strong>${row.horasMinutos}</strong></td>
                <td>R$ ${row.ganhos.toFixed(2)}</td>
                <td class="${statusClass}"><strong>${row.statusPagamento}</strong></td>
                <td>${row.tempoTrajeto || '-'}</td>
                <td>${row.tempoForaCasa || '-'}</td>
                <td>${row.observacoes || ''}</td>
            </tr>
        `;
    });

    const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório Financeiro e Horas - ${monthName} / 2026</title>
            <style>
                body { font-family: 'Outfit', sans-serif, Arial; color: #111; margin: 30px; }
                .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .report-title h1 { margin: 0; font-size: 22px; }
                .report-title p { margin: 5px 0 0 0; color: #555; font-size: 13px; }
                .summary-box { display: flex; gap: 20px; background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
                .summary-item { display: flex; flex-direction: column; flex: 1; }
                .summary-lbl { font-size: 10px; text-transform: uppercase; color: #555; font-weight: bold; }
                .summary-val { font-size: 16px; font-weight: bold; margin-top: 3px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f9fafb; font-weight: bold; text-transform: uppercase; font-size: 9px; color: #444; }
                tr:hover { background-color: #f9fafb; }
                .color-green { color: #10b981; }
                .color-orange { color: #f59e0b; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <div class="report-title">
                    <h1>Folha de Registro Premium</h1>
                    <p>Referência: ${monthName} de 2026</p>
                </div>
                <button onclick="window.print()" class="no-print" style="padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Imprimir PDF</button>
            </div>
            
            <div class="summary-box">
                <div class="summary-item">
                    <span class="summary-lbl">Horas Trabalhadas</span>
                    <span class="summary-val">${formatMinutesToHoursStr(totalMinutes)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-lbl">Rendimentos Estimados</span>
                    <span class="summary-val color-green">${formatCurrency(totalEarnings)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-lbl">Valor Global</span>
                    <span class="summary-val">R$ ${state.globalRate.toFixed(2)}/h</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Dia Semana</th>
                        <th>Entrada 1</th>
                        <th>Saída 1</th>
                        <th>Entrada 2</th>
                        <th>Saída 2</th>
                        <th>Total Horas</th>
                        <th>Valor Dia</th>
                        <th>Status</th>
                        <th>Tempo Trajeto</th>
                        <th>Tempo Fora</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
}

// ==========================================================================
// HELPERS / UTILITIES
// ==========================================================================
function startClock() {
    const clockEl = document.getElementById('current-time');
    setInterval(() => {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString('pt-BR', { hour12: false });
    }, 1000);
}

function setSyncStatus(status, text) {
    const badge = document.getElementById('sync-status');
    const statusText = badge.querySelector('.status-text');
    badge.className = `sync-badge ${status}`;
    statusText.innerText = text;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'error') {
        icon = 'fa-circle-exclamation';
    } else if (type === 'info') {
        icon = 'fa-circle-info';
    } else if (type === 'warning') {
        icon = 'fa-triangle-exclamation';
    }
    
    toast.innerHTML = `
        <i class="fa-solid ${icon} toast-icon"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3200);
}

function decodeHex(hex) {
    if (!hex) return '';
    try {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return decodeURIComponent(escape(str));
    } catch (e) {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }
}

function normalizeDate(cellValue) {
    if (!cellValue) return null;
    if (cellValue instanceof Date) {
        const y = cellValue.getUTCFullYear();
        const m = String(cellValue.getUTCMonth() + 1).padStart(2, '0');
        const d = String(cellValue.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    if (typeof cellValue === 'string') {
        const clean = cellValue.trim();
        const ymdMatch = clean.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
        if (ymdMatch) {
            return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
        }
        const dmyMatch = clean.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
        if (dmyMatch) {
            return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
        }
        const parsed = new Date(clean);
        if (!isNaN(parsed.getTime())) {
            const y = parsed.getUTCFullYear();
            const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
            const d = String(parsed.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return clean.substring(0, 10);
    }
    if (typeof cellValue === 'object' && cellValue.result) {
        return normalizeDate(cellValue.result);
    }
    return null;
}

function formatCurrency(value) {
    if (state && state.hideFinancials) {
        return 'R$ ••••';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatMinutesToHoursStr(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
}

function minutesToTimeStr(totalMinutes) {
    if (totalMinutes <= 0) return '00:00';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function parseDateParts(dateStr) {
    const norm = normalizeDate(dateStr);
    if (!norm) return { year: NaN, month: NaN, day: NaN };
    const parts = norm.split('-');
    if (parts.length < 3) return { year: NaN, month: NaN, day: NaN };
    return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1, // 0-indexed
        day: parseInt(parts[2], 10)
    };
}

// saveStateToLocalStorage: no-op no modo offline (dados salvos no IndexedDB)
function saveStateToLocalStorage() { /* dados gerenciados pelo IndexedDB */ }


function calculateWorkedMinutes(e1, s1, e2, s2) {
    let minutes = 0;
    if (e1 && s1) {
        let diff = timeToMinutes(s1) - timeToMinutes(e1);
        if (diff < 0) diff += 24 * 60;
        minutes += diff;
    }
    if (e2 && s2) {
        let diff = timeToMinutes(s2) - timeToMinutes(e2);
        if (diff < 0) diff += 24 * 60;
        minutes += diff;
    }
    return minutes;
}

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

function calculateTimeOutsideMinutes(saidaCasa, chegadaCasa) {
    if (!saidaCasa || !chegadaCasa) return 0;
    let diff = timeToMinutes(chegadaCasa) - timeToMinutes(saidaCasa);
    if (diff < 0) diff += 24 * 60;
    return diff;
}

function getDaysOfCurrentWeek(refDateStr) {
    // Se refDateStr for fornecido, usar como referência (útil para mostrar semana com dados)
    let now;
    if (refDateStr) {
        // Parsear a data de referência sem timezone shift
        const parts = refDateStr.split('-');
        now = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
        now = new Date();
    }
    
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() + distanceToMonday + i);
        const dayStr = d.getFullYear() + '-' + 
            String(d.getMonth() + 1).padStart(2, '0') + '-' + 
            String(d.getDate()).padStart(2, '0');
        days.push(dayStr);
    }
    return days;
}

// ==========================================================================
// ABA INVESTIMENTOS & CATEGORIAS DINÂMICAS & GRÁFICOS EXTRAS (NOVO)
// ==========================================================================

function populateCategoriesDropdown() {
    const catSelect = document.getElementById('fin-category');
    if (!catSelect) return;

    const currentSel = catSelect.value;
    const standardCategories = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Serviços', 'Cartão Crédito', 'Trabalho', 'Outros'];
    
    const customCats = new Set();
    state.financeEntries.forEach(entry => {
        if (entry.category && !standardCategories.includes(entry.category)) {
            customCats.add(entry.category);
        }
    });

    catSelect.innerHTML = '';
    
    standardCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        catSelect.appendChild(opt);
    });

    customCats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        catSelect.appendChild(opt);
    });

    const newOpt = document.createElement('option');
    newOpt.value = 'NEW_CATEGORY';
    newOpt.innerText = '+ Criar Categoria Customizada...';
    catSelect.appendChild(newOpt);

    if (currentSel) {
        catSelect.value = currentSel;
    }
}

function renderInvestments() {
    const kpiTotal = document.getElementById('kpi-invest-total');
    if (kpiTotal) {
        kpiTotal.innerText = formatCurrency(state.totalInvested);
    }

    let monthInvested = 0;
    state.filteredInvestEntries.forEach(entry => {
        monthInvested += entry.amount;
    });

    const kpiMonth = document.getElementById('kpi-invest-month');
    if (kpiMonth) {
        kpiMonth.innerText = formatCurrency(monthInvested);
    }

    // Calcular acumulados totais desde Janeiro
    let totalAutoVal = 0;
    let autoCountTotal = 0;
    let totalManualVal = 0;
    let manualCountTotal = 0;

    state.investEntries.forEach(entry => {
        if (entry.type === 'Automático') {
            totalAutoVal += entry.amount;
            autoCountTotal++;
        } else {
            totalManualVal += entry.amount;
            manualCountTotal++;
        }
    });

    const kpiAuto = document.getElementById('kpi-invest-auto');
    if (kpiAuto) {
        kpiAuto.innerText = formatCurrency(totalAutoVal);
        const subAuto = kpiAuto.nextElementSibling;
        if (subAuto) {
            subAuto.innerText = `${autoCountTotal} aporte${autoCountTotal !== 1 ? 's' : ''} de ${state.investPercent}% desde Jan`;
        }
    }
    const kpiAutoTitle = document.getElementById('kpi-invest-auto-title');
    if (kpiAutoTitle) {
        kpiAutoTitle.innerText = `Aportes Automáticos (${state.investPercent}%)`;
    }

    const kpiManual = document.getElementById('kpi-invest-manual');
    if (kpiManual) {
        kpiManual.innerText = formatCurrency(totalManualVal);
        const subManual = kpiManual.nextElementSibling;
        if (subManual) {
            subManual.innerText = `${manualCountTotal} aporte${manualCountTotal !== 1 ? 's' : ''} manual${manualCountTotal !== 1 ? 'is' : ''} desde Jan`;
        }
    }

    const listEl = document.getElementById('invest-extract-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (state.filteredInvestEntries.length === 0) {
        listEl.innerHTML = '<div class="text-center text-muted p-4">Nenhum aporte de investimento registrado neste mês.</div>';
        return;
    }

    state.filteredInvestEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'extract-item';

        const isAuto = entry.type === 'Automático';
        const color = isAuto ? 'var(--accent-blue)' : 'var(--accent-purple)';
        const bg = isAuto ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)';
        const icon = isAuto ? 'fa-robot' : 'fa-user-gear';

        const dateParts = parseDateParts(entry.date);
        const dateStr = String(dateParts.day).padStart(2, '0') + '/' + String(dateParts.month + 1).padStart(2, '0');

        item.innerHTML = `
            <div class="extract-item-left clickable-cell" onclick="triggerInvestEdit('${entry.id}')" style="cursor: pointer;">
                <div class="extract-icon" style="background-color: ${bg}; color: ${color}">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="extract-info">
                    <span class="extract-desc">${entry.origin}</span>
                    <span class="extract-subinfo">${dateStr} • ${entry.type}</span>
                </div>
            </div>
            <div class="flex-between">
                <span class="extract-amount income" style="color: ${color}">+ ${formatCurrency(entry.amount)}</span>
                
                <div style="display: flex; gap: 0.25rem; margin-left: 0.75rem;">
                    <button class="edit-btn" onclick="triggerInvestEdit('${entry.id}')" aria-label="Editar investimento" style="font-size: 0.85rem;">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="delete-fin-btn" onclick="triggerInvestDelete('${entry.id}')" aria-label="Deletar investimento" style="margin-left: 0;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        listEl.appendChild(item);
    });
}

async function saveInvestEntry(investData) {
    try {
        setSyncStatus('syncing', 'Salvando aporte...');
        
        if (!investData.id) investData.id = generateId();
        if (!investData.type) investData.type = 'Manual';
        await dbPut('invest', investData);
        
        // Atualizar estado local
        const existIdx = state.investEntries.findIndex(e => e.id === investData.id);
        if (existIdx !== -1) {
            state.investEntries[existIdx] = investData;
        } else {
            state.investEntries.push(investData);
        }
        state.totalInvested = state.investEntries.reduce((s, e) => s + (e.amount || 0), 0);
        
        showToast('Aporte de investimento salvo!', 'success');
        
        const formEl = document.getElementById('invest-entry-form');
        const idEl = document.getElementById('invest-entry-id');
        if (formEl) formEl.reset();
        if (idEl) idEl.value = '';
        const cancelBtn = document.getElementById('btn-cancel-invest-edit');
        if (cancelBtn) cancelBtn.classList.add('hidden');
        const titleEl = document.getElementById('invest-form-title');
        if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-wallet color-green"></i> Registrar Aporte Manual';
        
        applyFilters();
        setSyncStatus('connected', 'Salvo Localmente');
    } catch (err) {
        console.error('[DB] Erro ao salvar aporte:', err);
        showToast('Erro ao salvar aporte de investimento!', 'error');
        setSyncStatus('connected', 'Salvo Localmente');
    }
}

async function deleteInvestEntry(id) {
    try {
        setSyncStatus('syncing', 'Excluindo aporte...');
        await dbDelete('invest', id);
        state.investEntries = state.investEntries.filter(e => e.id !== id);
        state.totalInvested = state.investEntries.reduce((s, e) => s + (e.amount || 0), 0);
        showToast('Aporte excluído!', 'success');
        applyFilters();
        setSyncStatus('connected', 'Salvo Localmente');
    } catch (err) {
        console.error('[DB] Erro ao deletar aporte:', err);
        showToast('Falha ao excluir aporte!', 'error');
        setSyncStatus('connected', 'Salvo Localmente');
    }
}

window.triggerInvestEdit = function(id) {
    const entry = state.investEntries.find(e => e.id === id);
    if (!entry) return;

    document.getElementById('invest-entry-id').value = entry.id;
    document.getElementById('invest-date').value = entry.date;
    document.getElementById('invest-origin').value = entry.origin;
    document.getElementById('invest-amount').value = entry.amount;

    document.getElementById('invest-form-title').innerHTML = '<i class="fa-solid fa-pen-to-square color-green"></i> Editar Aporte Manual';
    
    const cancelBtn = document.getElementById('btn-cancel-invest-edit');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    
    document.getElementById('invest-entry-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.triggerInvestDelete = function(id) {
    if (confirm('Deseja excluir permanentemente este aporte de investimento da planilha?')) {
        deleteInvestEntry(id);
    }
};

window.triggerFinanceEdit = function(id) {
    const entry = state.financeEntries.find(e => e.id === id);
    if (!entry) return;

    document.getElementById('fin-entry-id').value = entry.id;
    document.getElementById('fin-date').value = entry.date;
    document.getElementById('fin-type').value = entry.type;
    document.getElementById('fin-desc').value = entry.description;
    document.getElementById('fin-amount').value = entry.amount;
    
    const catSelect = document.getElementById('fin-category');
    let exists = false;
    for (let i = 0; i < catSelect.options.length; i++) {
        if (catSelect.options[i].value === entry.category) {
            exists = true;
            break;
        }
    }

    if (exists) {
        catSelect.value = entry.category;
        document.getElementById('fin-custom-category').classList.add('hidden');
    } else {
        catSelect.value = 'NEW_CATEGORY';
        const customInput = document.getElementById('fin-custom-category');
        customInput.classList.remove('hidden');
        customInput.value = entry.category;
    }

    document.getElementById('fin-form-title').innerHTML = '<i class="fa-solid fa-pen-to-square color-purple"></i> Editar Transação Financeira';
    
    const cancelBtn = document.getElementById('btn-cancel-fin-edit');
    if (cancelBtn) cancelBtn.classList.remove('hidden');
    
    document.getElementById('finance-entry-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

function renderComparisonChart() {
    const canvas = document.getElementById('chart-finance-comparison');
    if (!canvas) return;

    if (state.comparisonChart) {
        state.comparisonChart.destroy();
    }

    let hoursIncome = 0;
    state.filteredRows.forEach(row => {
        hoursIncome += row.ganhos;
    });

    let extraIncome = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;
    let cardExpenses = 0;

    state.filteredFinanceEntries.forEach(entry => {
        if (entry.type === 'Ganho Extra') {
            extraIncome += entry.amount;
        } else if (entry.type === 'Despesa Fixa') {
            fixedExpenses += entry.amount;
        } else if (entry.type === 'Despesa Variável') {
            variableExpenses += entry.amount;
        } else if (entry.type === 'Gastos Cartão') {
            cardExpenses += entry.amount;
        }
    });

    const totalIncome = hoursIncome + extraIncome;
    const totalExpenses = fixedExpenses + variableExpenses + cardExpenses;

    const isDark = !document.body.classList.contains('light-theme');
    const textColor = isDark ? '#9ca3af' : '#4b5563';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    state.comparisonChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Ganhos Totais', 'Despesas Totais'],
            datasets: [{
                label: 'Balanço (R$)',
                data: [totalIncome, totalExpenses],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.75)',
                    'rgba(239, 68, 68, 0.75)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 1)'
                ],
                borderWidth: 1.5,
                borderRadius: 8,
                barThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { family: 'Outfit', weight: 600 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit' },
                        callback: function(value) { return 'R$ ' + value; }
                    }
                }
            }
        }
    });
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('Service Worker registrado com sucesso!');
                
                // Escutar por atualizações encontradas
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('Novo Service Worker instalado! Recarregando para aplicar atualizações...');
                                    showToast('Aplicativo atualizado! Recarregando dados...', 'info');
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 1200);
                                }
                            }
                        };
                    }
                };
            })
            .catch(err => console.warn('Erro ao registrar Service Worker:', err));

        // Monitorar mudança de controlador para recarregar a página
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }
}


// ==========================================================================
// ELITE AUTOMATIONS & ANALYTICS WIDGETS (NOVO)
// ==========================================================================

function initNotifications() {
    const btn = document.getElementById('btn-toggle-notifications');
    const statusText = document.getElementById('notification-status-text');
    if (!btn || !statusText) return;
    
    let stateNotif = localStorage.getItem('pointNotifications') || 'disabled';
    
    const updateUI = () => {
        if (stateNotif === 'enabled') {
            statusText.innerText = 'Status: Ativado';
            statusText.className = 'status-enabled';
            statusText.style.color = 'var(--accent-green)';
            btn.innerText = 'Desativar Lembretes';
            btn.className = 'btn btn-secondary btn-inline ripple';
        } else {
            statusText.innerText = 'Status: Desativado';
            statusText.className = 'status-disabled';
            statusText.style.color = 'var(--text-secondary)';
            btn.innerText = 'Ativar Lembretes';
            btn.className = 'btn btn-primary btn-inline ripple';
        }
    };
    
    updateUI();
    
    btn.addEventListener('click', async () => {
        if (stateNotif === 'disabled') {
            if ('Notification' in window) {
                const perm = await Notification.requestPermission();
                if (perm === 'granted') {
                    stateNotif = 'enabled';
                    localStorage.setItem('pointNotifications', 'enabled');
                    showToast('Lembretes de ponto ativados!', 'success');
                    new Notification('Lembretes Ativados!', {
                        body: 'Você receberá notificações silenciosas nos horários corretos.',
                        icon: 'https://img.icons8.com/color/192/000000/clock.png',
                        silent: true
                    });
                } else {
                    showToast('Permissão de notificações recusada pelo navegador!', 'error');
                }
            } else {
                showToast('Seu navegador não suporta notificações nativas!', 'error');
            }
        } else {
            stateNotif = 'disabled';
            localStorage.setItem('pointNotifications', 'disabled');
            showToast('Lembretes de ponto desativados!', 'success');
        }
        updateUI();
    });
    
    let lastNotifiedTime = ''; // "day_hour_min"
    
    setInterval(() => {
        if (stateNotif !== 'enabled') return;
        
        const now = new Date();
        const weekday = now.getDay(); // 0: Dom, 1: Seg, ..., 6: Sáb
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        const timeKey = `${now.toDateString()}_${hours}_${minutes}`;
        if (lastNotifiedTime === timeKey) return;
        
        let shouldNotify = false;
        let body = '';
        
        if (weekday >= 1 && weekday <= 5) {
            // Seg-Sex: 18:00 e 21:00
            if ((hours === 18 && minutes === 0) || (hours === 21 && minutes === 0)) {
                shouldNotify = true;
                body = `Horário das ${hours.toString().padStart(2, '0')}:00. Não se esqueça de registrar seu ponto de trabalho!`;
            }
        } else if (weekday === 6) {
            // Sábado: 08:30, 12:00, 13:30, 21:00
            const matches = [
                { h: 8, m: 30 },
                { h: 12, m: 0 },
                { h: 13, m: 30 },
                { h: 21, m: 0 }
            ];
            const match = matches.find(m => m.h === hours && m.m === minutes);
            if (match) {
                shouldNotify = true;
                body = `Lembrete de ponto de Sábado às ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}.`;
            }
        }
        
        if (shouldNotify) {
            lastNotifiedTime = timeKey;
            if (Notification.permission === 'granted') {
                new Notification('Hora de Bater o Ponto!', {
                    body: body,
                    icon: 'https://img.icons8.com/color/192/000000/clock.png',
                    silent: true
                });
            }
        }
    }, 15000);
}

function initInvestmentsCalc() {
    const pullBtn = document.getElementById('btn-calc-pull-patrimony');
    if (pullBtn) {
        pullBtn.addEventListener('click', () => {
            document.getElementById('calc-initial').value = state.totalInvested.toFixed(2);
            showToast(`Patrimônio total de ${formatCurrency(state.totalInvested)} importado com sucesso!`, 'success');
            calculateCompoundInterest();
        });
    }
}

window.calculateCompoundInterest = function() {
    const initialInput = document.getElementById('calc-initial').value;
    const monthlyInput = document.getElementById('calc-monthly').value;
    const rateInput = document.getElementById('calc-rate').value;
    const rateType = document.getElementById('calc-rate-type').value;
    const periodInput = document.getElementById('calc-period').value;
    const periodType = document.getElementById('calc-period-type').value;
    
    const initial = parseFloat(initialInput) || 0;
    const monthly = parseFloat(monthlyInput) || 0;
    const ratePercent = parseFloat(rateInput) || 0;
    const period = parseInt(periodInput, 10) || 0;
    
    if (period <= 0) {
        showToast('Por favor, defina um período de tempo maior que zero!', 'error');
        return;
    }
    
    const totalMonths = periodType === 'years' ? period * 12 : period;
    
    let monthlyRate = 0;
    if (rateType === 'yearly') {
        monthlyRate = Math.pow(1 + (ratePercent / 100), 1 / 12) - 1;
    } else {
        monthlyRate = ratePercent / 100;
    }
    
    let totalInvested = initial;
    let currentValue = initial;
    
    const projectionData = [];
    
    for (let m = 1; m <= totalMonths; m++) {
        currentValue = currentValue * (1 + monthlyRate) + monthly;
        totalInvested += monthly;
        
        const shouldRecord = (totalMonths <= 24) || (m % 12 === 0) || (m === totalMonths);
        if (shouldRecord) {
            const label = totalMonths <= 24 ? `Mês ${m}` : `Ano ${Math.floor(m / 12)}`;
            projectionData.push({
                label: label,
                invested: totalInvested,
                interest: currentValue - totalInvested,
                total: currentValue
            });
        }
    }
    
    const totalInterest = currentValue - totalInvested;
    
    document.getElementById('res-calc-invested').innerText = formatCurrency(totalInvested);
    document.getElementById('res-calc-interest').innerText = formatCurrency(totalInterest);
    document.getElementById('res-calc-total').innerText = formatCurrency(currentValue);
    
    const tableBody = document.getElementById('calc-projection-table-body');
    tableBody.innerHTML = '';
    
    projectionData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.label}</strong></td>
            <td>${formatCurrency(row.invested)}</td>
            <td class="text-success">${formatCurrency(row.interest)}</td>
            <td><strong>${formatCurrency(row.total)}</strong></td>
        `;
        tableBody.appendChild(tr);
    });
    
    showToast('Projeção de juros compostos simulada!', 'success');
};

function initBackupHandlers() {
    ['btn-backup-top', 'btn-download-backup'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', async () => {
                try {
                    showToast('Gerando backup local... Download em instantes!', 'success');
                    
                    const rows = await dbGetAll('rows');
                    const finance = await dbGetAll('finance');
                    const invest = await dbGetAll('invest');
                    const notes = await dbGetAll('notes');
                    const cfgRate = await dbGet('config', 'globalRate');
                    const cfgInv = await dbGet('config', 'investPercent');
                    
                    const backupData = {
                        exportedAt: new Date().toISOString(),
                        version: DB_VERSION,
                        globalRate: cfgRate ? cfgRate.value : state.globalRate,
                        investPercent: cfgInv ? cfgInv.value : state.investPercent,
                        rows,
                        financeEntries: finance,
                        investEntries: invest,
                        notes
                    };
                    
                    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `controle_horas_backup_${new Date().toISOString().substring(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    showToast('Backup JSON baixado com sucesso!', 'success');
                } catch (err) {
                    console.error('[BACKUP]', err);
                    showToast('Erro ao gerar backup!', 'error');
                }
            });
        }
    });

    // Restaurar backup JSON
    const btnRestore = document.getElementById('btn-restore-backup');
    if (btnRestore) {
        btnRestore.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    
                    if (!data.rows || !Array.isArray(data.rows)) {
                        showToast('Arquivo de backup inválido!', 'error');
                        return;
                    }
                    
                    if (!confirm(`Restaurar backup de ${data.exportedAt}? Isso sobrescreverá todos os dados atuais!`)) return;
                    
                    isImportingData = true; // Set flag
                    
                    // Importar configurações
                    if (data.globalRate) await dbPut('config', { key: 'globalRate', value: data.globalRate });
                    if (data.investPercent) await dbPut('config', { key: 'investPercent', value: data.investPercent });
                    
                    // Importar linhas
                    const txRows = db.transaction('rows', 'readwrite');
                    txRows.objectStore('rows').clear();
                    data.rows.forEach(r => txRows.objectStore('rows').put(r));
                    await new Promise((res, rej) => { txRows.oncomplete = res; txRows.onerror = rej; });
                    
                    // Importar finanças
                    if (data.financeEntries) {
                        const txFin = db.transaction('finance', 'readwrite');
                        txFin.objectStore('finance').clear();
                        data.financeEntries.forEach(f => txFin.objectStore('finance').put(f));
                        await new Promise((res, rej) => { txFin.oncomplete = res; txFin.onerror = rej; });
                    }
                    
                    // Importar investimentos
                    if (data.investEntries) {
                        const txInv = db.transaction('invest', 'readwrite');
                        txInv.objectStore('invest').clear();
                        data.investEntries.forEach(i => txInv.objectStore('invest').put(i));
                        await new Promise((res, rej) => { txInv.oncomplete = res; txInv.onerror = rej; });
                    }
                    
                    // Importar notas
                    if (data.notes) {
                        const txNot = db.transaction('notes', 'readwrite');
                        txNot.objectStore('notes').clear();
                        data.notes.forEach(n => txNot.objectStore('notes').put(n));
                        await new Promise((res, rej) => { txNot.oncomplete = res; txNot.onerror = rej; });
                    }
                    
                    isImportingData = false; // Reset flag
                    localStorage.setItem('welcome_dismissed', 'true');
                    
                    // Disparar sincronização em background na nuvem se conectado
                    localStorage.setItem('needs_sync', 'true');
                    triggerAutoSync();
                    
                    showToast('Backup restaurado com sucesso! Recarregando...', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                } catch (err) {
                    isImportingData = false; // Ensure reset on error
                    console.error('[RESTORE]', err);
                    showToast('Erro ao restaurar backup!', 'error');
                }
            };
            input.click();
        });
    }

    // Restaurar Planilha Original (Premium)
    const btnRestorePrefilled = document.getElementById('btn-restore-prefilled');
    if (btnRestorePrefilled) {
        btnRestorePrefilled.addEventListener('click', async () => {
            if (typeof PREFILLED_EXCEL_BASE64 === 'undefined' || !PREFILLED_EXCEL_BASE64) {
                showToast('Planilha original não está disponível nesta versão.', 'error');
                return;
            }
            if (!confirm('Deseja realmente carregar os dados iniciais do projeto? Isso substituirá todo o seu banco de dados local com as informações preenchidas originais!')) return;
            try {
                // Limpar tabelas existentes
                const txRows = db.transaction('rows', 'readwrite');
                txRows.objectStore('rows').clear();
                await new Promise((res, rej) => { txRows.oncomplete = res; txRows.onerror = rej; });

                const txFin = db.transaction('finance', 'readwrite');
                txFin.objectStore('finance').clear();
                await new Promise((res, rej) => { txFin.oncomplete = res; txFin.onerror = rej; });

                const txInv = db.transaction('invest', 'readwrite');
                txInv.objectStore('invest').clear();
                await new Promise((res, rej) => { txInv.oncomplete = res; txInv.onerror = rej; });

                // Chamar função de semente
                await seedFromPrefilledExcel();

                localStorage.setItem('welcome_dismissed', 'true');
                localStorage.setItem('needs_sync', 'true');
                triggerAutoSync();

                showToast('Dados originais carregados com sucesso! Recarregando...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                console.error('[RESTORE-PREFILLED]', err);
                showToast('Erro ao carregar dados iniciais!', 'error');
            }
        });
    }

    // Exportar Planilha Excel (.xlsx)
    const btnExportXlsx = document.getElementById('btn-export-xlsx');
    if (btnExportXlsx) {
        btnExportXlsx.addEventListener('click', exportExcel);
    }
    
    // Importar Planilha Excel (.xlsx) (Trigger)
    const btnTriggerImportXlsx = document.getElementById('btn-trigger-import-xlsx');
    const inputImportXlsx = document.getElementById('input-import-xlsx');
    if (btnTriggerImportXlsx && inputImportXlsx) {
        btnTriggerImportXlsx.addEventListener('click', () => {
            inputImportXlsx.click();
        });
        inputImportXlsx.addEventListener('change', importExcel);
    }
    
    // Limpar Todo o Aplicativo (Wipe)
    const btnWipeData = document.getElementById('btn-wipe-data');
    if (btnWipeData) {
        btnWipeData.addEventListener('click', wipeData);
    }

    // Guia do Google Drive
    const btnGuideGDrive = document.getElementById('btn-guide-gdrive');
    if (btnGuideGDrive) {
        btnGuideGDrive.addEventListener('click', showGoogleDriveGuideModal);
    }
}

// --------------------------------------------------------------------------
// EXCEL CLIENT-SIDE IMPORT / EXPORT & DATA WIPE LOGIC
// --------------------------------------------------------------------------

async function exportExcel() {
    try {
        showToast('Gerando planilha Excel...', 'info');
        
        const workbook = new ExcelJS.Workbook();
        
        // 1. Controle de Horas Sheet
        const sheet = workbook.addWorksheet('Controle de Horas');
        
        // Setup Headers
        sheet.getRow(1).values = [
            'Data', 'Dia da Semana', 'Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2',
            'Horas do Dia', 'Valor do Dia (R$)', 'Valor Hora', 'Observações',
            'Status Pagamento', 'Saída de Casa', 'Chegada em Casa', 'Tempo de Trajeto', 'Tempo Fora de Casa'
        ];
        
        // Style Header
        sheet.getRow(1).font = { bold: true };
        
        // Add Rows
        state.rows.forEach((row, i) => {
            const rNum = i + 2;
            const excelRow = sheet.getRow(rNum);
            
            // Converter data para data do Excel (formato Date)
            const dVal = row.date ? new Date(row.date + 'T00:00:00') : null;
            
            excelRow.getCell(1).value = dVal;
            excelRow.getCell(1).numFmt = 'yyyy-mm-dd';
            excelRow.getCell(2).value = row.weekday || '';
            excelRow.getCell(3).value = row.entrada1 || null;
            excelRow.getCell(4).value = row.saida1 || null;
            excelRow.getCell(5).value = row.entrada2 || null;
            excelRow.getCell(6).value = row.saida2 || null;
            
            // Fórmulas
            excelRow.getCell(7).value = {
                formula: `=IF(AND(C${rNum}<>"",D${rNum}<>""),(D${rNum}-C${rNum}),0)+IF(AND(E${rNum}<>"",F${rNum}<>""),(F${rNum}-E${rNum}),0)`
            };
            excelRow.getCell(7).numFmt = 'hh:mm';
            
            // Valor Hora
            excelRow.getCell(9).value = row.valorHora !== undefined && row.valorHora !== null ? row.valorHora : state.globalRate;
            
            // Valor do Dia (R$) - se houver ganho manual diferente de 0, preenche o número, se não usa a fórmula
            if (row.ganhosManual) {
                excelRow.getCell(8).value = row.ganhos;
            } else {
                excelRow.getCell(8).value = {
                    formula: `=(G${rNum}*24)*I${rNum}`
                };
            }
            excelRow.getCell(8).numFmt = '"R$"#,##0.00';
            
            excelRow.getCell(10).value = row.observacoes || null;
            excelRow.getCell(11).value = row.statusPagamento || 'Pendente';
            excelRow.getCell(12).value = row.saidaCasa || null;
            excelRow.getCell(13).value = row.chegadaCasa || null;
            excelRow.getCell(14).value = row.tempoTrajeto || null;
            excelRow.getCell(15).value = row.tempoForaCasa || null;
        });
        
        // 2. Gestão Financeira Sheet
        const finSheet = workbook.addWorksheet('Gestão Financeira');
        finSheet.getRow(1).values = ['ID', 'Data', 'Descrição', 'Tipo', 'Valor', 'Categoria'];
        finSheet.getRow(1).font = { bold: true };
        
        state.financeEntries.forEach((entry, i) => {
            const rNum = i + 2;
            const excelRow = finSheet.getRow(rNum);
            excelRow.getCell(1).value = entry.id;
            const dVal = entry.date ? new Date(entry.date + 'T00:00:00') : null;
            excelRow.getCell(2).value = dVal;
            excelRow.getCell(2).numFmt = 'yyyy-mm-dd';
            excelRow.getCell(3).value = entry.description || '';
            excelRow.getCell(4).value = entry.type || '';
            excelRow.getCell(5).value = entry.amount || 0;
            excelRow.getCell(5).numFmt = '"R$"#,##0.00';
            excelRow.getCell(6).value = entry.category || '';
        });
        
        // 3. Investimentos Sheet
        const investSheet = workbook.addWorksheet('Investimentos');
        investSheet.getRow(1).values = ['ID', 'Data', 'Origem', 'Valor', 'Tipo'];
        investSheet.getRow(1).font = { bold: true };
        
        state.investEntries.forEach((entry, i) => {
            const rNum = i + 2;
            const excelRow = investSheet.getRow(rNum);
            excelRow.getCell(1).value = entry.id;
            const dVal = entry.date ? new Date(entry.date + 'T00:00:00') : null;
            excelRow.getCell(2).value = dVal;
            excelRow.getCell(2).numFmt = 'yyyy-mm-dd';
            excelRow.getCell(3).value = entry.origin || '';
            excelRow.getCell(4).value = entry.amount || 0;
            excelRow.getCell(4).numFmt = '"R$"#,##0.00';
            excelRow.getCell(5).value = entry.type || '';
        });

        // 3.5. Serviços e Vendas Sheet
        const svcSheet = workbook.addWorksheet('Serviços e Vendas');
        svcSheet.getRow(1).values = ['ID', 'Data', 'Cliente', 'Serviço/Produto', 'Quantidade', 'Valor Unitário', 'Total', 'Status', 'Observações'];
        svcSheet.getRow(1).font = { bold: true };
        
        (state.servicesEntries || []).forEach((entry, i) => {
            const rNum = i + 2;
            const excelRow = svcSheet.getRow(rNum);
            excelRow.getCell(1).value = entry.id;
            const dVal = entry.date ? new Date(entry.date + 'T00:00:00') : null;
            excelRow.getCell(2).value = dVal;
            excelRow.getCell(2).numFmt = 'yyyy-mm-dd';
            excelRow.getCell(3).value = entry.client || '';
            excelRow.getCell(4).value = entry.service || '';
            excelRow.getCell(5).value = entry.quantity || 1;
            excelRow.getCell(6).value = entry.unitPrice || 0;
            excelRow.getCell(6).numFmt = '"R$"#,##0.00';
            
            // Fórmula do total: Quantidade * Unitário
            excelRow.getCell(7).value = {
                formula: `=E${rNum}*F${rNum}`
            };
            excelRow.getCell(7).numFmt = '"R$"#,##0.00';
            
            excelRow.getCell(8).value = entry.status || 'Pendente';
            excelRow.getCell(9).value = entry.notes || '';
        });

        // 4. Filtro Sheet
        const filterSheet = workbook.addWorksheet('Filtro');
        filterSheet.getRow(3).values = ['Data', 'Dia da Semana', 'Soma de Valor do Dia (R$)', null, 'Rótulos de Linha', 'Soma de Valor do Dia (R$)', 'Soma de Horas do Dia'];
        filterSheet.getRow(3).font = { bold: true };
        
        const monthsAbbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        for (let m = 0; m < 12; m++) {
            const rNum = m + 4;
            filterSheet.getCell(`E${rNum}`).value = monthsAbbrev[m];
            const mNum = m + 1;
            filterSheet.getCell(`F${rNum}`).value = {
                formula: `=SUMIFS('Controle de Horas'!H:H, 'Controle de Horas'!A:A, ">="&DATE(2026,${mNum},1), 'Controle de Horas'!A:A, "<="&DATE(2026,${mNum},EOMONTH(DATE(2026,${mNum},1),0)))`
            };
            filterSheet.getCell(`F${rNum}`).numFmt = '"R$"#,##0.00';
            
            filterSheet.getCell(`G${rNum}`).value = {
                formula: `=SUMIFS('Controle de Horas'!G:G, 'Controle de Horas'!A:A, ">="&DATE(2026,${mNum},1), 'Controle de Horas'!A:A, "<="&DATE(2026,${mNum},EOMONTH(DATE(2026,${mNum},1),0)))`
            };
            filterSheet.getCell(`G${rNum}`).numFmt = '[hh]:mm';
        }
        
        filterSheet.getCell('E16').value = 'Total Geral';
        filterSheet.getCell('E16').font = { bold: true };
        filterSheet.getCell('F16').value = { formula: '=SUM(F4:F15)' };
        filterSheet.getCell('F16').font = { bold: true };
        filterSheet.getCell('F16').numFmt = '"R$"#,##0.00';
        filterSheet.getCell('G16').value = { formula: '=SUM(G4:G15)' };
        filterSheet.getCell('G16').font = { bold: true };
        filterSheet.getCell('G16').numFmt = '[hh]:mm';
        
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Controle_de_Horas_Trabalho_${new Date().getFullYear()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Planilha Excel baixada com sucesso!', 'success');
    } catch (err) {
        console.error('[EXCEL-EXPORT]', err);
        showToast('Erro ao exportar planilha Excel!', 'error');
    }
}

async function importExcel(e) {
    const file = e.target.files[0];
    if (!file) return;
    await processExcelFile(file, false);
}

async function processExcelFile(file, skipConfirm = false) {
    try {
        showToast('Lendo planilha Excel...', 'info');
        
        const reader = new FileReader();
        const dataPromise = new Promise((resolve, reject) => {
            reader.onload = (evt) => resolve(evt.target.result);
            reader.onerror = (err) => reject(err);
        });
        reader.readAsArrayBuffer(file);
        const arrayBuffer = await dataPromise;
        
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        
        const sheet = workbook.getWorksheet('Controle de Horas');
        if (!sheet) {
            showToast('Planilha "Controle de Horas" não encontrada no arquivo!', 'error');
            return;
        }
        
        let importedGlobalRate = state.globalRate;
        const i2Val = sheet.getRow(2).getCell(9).value;
        if (i2Val !== null && i2Val !== undefined) {
            if (typeof i2Val === 'number') {
                importedGlobalRate = i2Val;
            } else if (typeof i2Val === 'object' && i2Val.result !== undefined) {
                importedGlobalRate = Number(i2Val.result);
            }
        }
        
        const importedRows = [];
        const rowCount = sheet.rowCount;
        for (let r = 2; r <= rowCount; r++) {
            const excelRow = sheet.getRow(r);
            const rawDate = excelRow.getCell(1).value;
            if (!rawDate) continue;
            
            const dateStr = formatCellDate(rawDate);
            if (!dateStr) continue;
            
            const rowData = {
                rowNum: r - 1,
                date: dateStr,
                weekday: excelRow.getCell(2).value || '',
                entrada1: formatCellTime(excelRow.getCell(3).value),
                saida1: formatCellTime(excelRow.getCell(4).value),
                entrada2: formatCellTime(excelRow.getCell(5).value),
                saida2: formatCellTime(excelRow.getCell(6).value),
                valorHora: excelRow.getCell(9).value !== null ? Number(excelRow.getCell(9).value) : importedGlobalRate,
                observacoes: excelRow.getCell(10).value || '',
                statusPagamento: excelRow.getCell(11).value || 'Pendente',
                saidaCasa: formatCellTime(excelRow.getCell(12).value),
                chegadaCasa: formatCellTime(excelRow.getCell(13).value)
            };
            
            recalcRow(rowData, importedGlobalRate);
            importedRows.push(rowData);
        }
        
        if (importedRows.length === 0) {
            showToast('Nenhum registro de ponto válido encontrado no Excel!', 'error');
            return;
        }
        
        const importedFinance = [];
        const finSheet = workbook.getWorksheet('Gestão Financeira');
        if (finSheet) {
            const finRowCount = finSheet.rowCount;
            for (let r = 2; r <= finRowCount; r++) {
                const excelRow = finSheet.getRow(r);
                const id = excelRow.getCell(1).value;
                const dateVal = formatCellDate(excelRow.getCell(2).value);
                if (!dateVal) continue;
                
                const entry = {
                    id: id || generateId(),
                    date: dateVal,
                    description: excelRow.getCell(3).value || '',
                    type: excelRow.getCell(4).value || 'Despesa Fixa',
                    amount: Number(excelRow.getCell(5).value || 0),
                    category: excelRow.getCell(6).value || 'Outros'
                };
                importedFinance.push(entry);
            }
        }
        
        const importedInvest = [];
        const investSheet = workbook.getWorksheet('Investimentos');
        if (investSheet) {
            const invRowCount = investSheet.rowCount;
            for (let r = 2; r <= invRowCount; r++) {
                const excelRow = investSheet.getRow(r);
                const id = excelRow.getCell(1).value;
                const dateVal = formatCellDate(excelRow.getCell(2).value);
                if (!dateVal) continue;
                
                const entry = {
                    id: id || generateId(),
                    date: dateVal,
                    origin: excelRow.getCell(3).value || '',
                    amount: Number(excelRow.getCell(4).value || 0),
                    type: excelRow.getCell(5).value || 'Manual'
                };
                importedInvest.push(entry);
            }
        }
        
        const importedServices = [];
        const svcSheet = workbook.getWorksheet('Serviços e Vendas');
        if (svcSheet) {
            const svcRowCount = svcSheet.rowCount;
            for (let r = 2; r <= svcRowCount; r++) {
                const excelRow = svcSheet.getRow(r);
                const id = excelRow.getCell(1).value;
                const dateVal = formatCellDate(excelRow.getCell(2).value);
                if (!dateVal) continue;
                
                const entry = {
                    id: id || generateId(),
                    date: dateVal,
                    client: excelRow.getCell(3).value || '',
                    service: excelRow.getCell(4).value || '',
                    quantity: Number(excelRow.getCell(5).value || 1),
                    unitPrice: Number(excelRow.getCell(6).value || 0),
                    status: excelRow.getCell(8).value || 'Pendente',
                    notes: excelRow.getCell(9).value || ''
                };
                importedServices.push(entry);
            }
        }
        
        if (!skipConfirm) {
            if (!confirm(`Planilha lida com sucesso!\n- ${importedRows.length} dias de trabalho\n- ${importedFinance.length} lançamentos financeiros\n- ${importedInvest.length} aportes de investimento\n- ${importedServices.length} registros de serviços/vendas\n\nIsso substituirá TODOS os dados atuais do aplicativo! Deseja prosseguir?`)) {
                return;
            }
        }
        
        setSyncStatus('syncing', 'Importando dados...');
        
        await dbPut('config', { key: 'globalRate', value: importedGlobalRate });
        
        const txRows = db.transaction('rows', 'readwrite');
        await txRows.objectStore('rows').clear();
        for (const row of importedRows) {
            await txRows.objectStore('rows').put(row);
        }
        
        const txFin = db.transaction('finance', 'readwrite');
        await txFin.objectStore('finance').clear();
        for (const f of importedFinance) {
            await txFin.objectStore('finance').put(f);
        }
        
        const txInv = db.transaction('invest', 'readwrite');
        await txInv.objectStore('invest').clear();
        for (const i of importedInvest) {
            await txInv.objectStore('invest').put(i);
        }

        const txSvc = db.transaction('services', 'readwrite');
        await txSvc.objectStore('services').clear();
        for (const s of importedServices) {
            await txSvc.objectStore('services').put(s);
        }
        
        showToast('Dados importados com sucesso! Recarregando...', 'success');
        setTimeout(() => window.location.reload(), 1500);
        
    } catch (err) {
        console.error('[EXCEL-IMPORT]', err);
        showToast('Erro ao ler ou processar o arquivo Excel!', 'error');
    }
}

async function wipeData() {
    if (!confirm('ATENÇÃO: Isso irá apagar PERMANENTEMENTE todos os seus dados locais (pontos, despesas, investimentos e configurações). Tem certeza que deseja continuar?')) {
        return;
    }
    
    try {
        setSyncStatus('syncing', 'Limpando dados...');
        
        localStorage.clear();
        
        const txConfig = db.transaction('config', 'readwrite');
        await txConfig.objectStore('config').clear();
        
        const txRows = db.transaction('rows', 'readwrite');
        await txRows.objectStore('rows').clear();
        
        const txFin = db.transaction('finance', 'readwrite');
        await txFin.objectStore('finance').clear();
        
        const txInv = db.transaction('invest', 'readwrite');
        await txInv.objectStore('invest').clear();
        
        showToast('Todos os dados foram apagados com sucesso!', 'success');
        setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
        console.error('[WIPE]', err);
        showToast('Erro ao apagar os dados!', 'error');
    }
}

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

function formatCellDate(cellValue) {
    if (!cellValue) return null;
    
    if (cellValue instanceof Date) {
        const y = cellValue.getUTCFullYear();
        const m = String(cellValue.getUTCMonth() + 1).padStart(2, '0');
        const d = String(cellValue.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    
    if (typeof cellValue === 'string') {
        const clean = cellValue.trim();
        const ymdMatch = clean.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
        if (ymdMatch) {
            return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
        }
        const dmyMatch = clean.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
        if (dmyMatch) {
            return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
        }
        const parsed = new Date(clean);
        if (!isNaN(parsed.getTime())) {
            const y = parsed.getUTCFullYear();
            const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
            const d = String(parsed.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return clean.substring(0, 10);
    }
    
    if (typeof cellValue === 'object' && cellValue.result) {
        return formatCellDate(cellValue.result);
    }
    
    return null;
}

async function autoSyncInvestments() {
    try {
        const investPercent = state.investPercent !== undefined ? state.investPercent : 20;
        const autoMap = new Map(); // date -> row
        state.rows.forEach(row => {
            if (row.statusPagamento === 'Pago' && row.ganhos > 0) {
                autoMap.set(row.date, row);
            }
        });

        const currentAutoEntries = state.investEntries.filter(e => e.type === 'Automático');
        const currentAutoMap = new Map(); // date -> entry
        currentAutoEntries.forEach(entry => {
            const match = entry.origin.match(/Ponto de (\d{4}-\d{2}-\d{2})/);
            if (match) {
                currentAutoMap.set(match[1], entry);
            }
        });

        const tx = db.transaction('invest', 'readwrite');
        const store = tx.objectStore('invest');
        let changed = false;

        for (const [date, row] of autoMap.entries()) {
            const expectedAmount = Number((row.ganhos * (investPercent / 100)).toFixed(2));
            const existingEntry = currentAutoMap.get(date);

            if (existingEntry) {
                if (existingEntry.amount !== expectedAmount || existingEntry.date !== date) {
                    existingEntry.amount = expectedAmount;
                    existingEntry.date = date;
                    await store.put(existingEntry);
                    // Update local state
                    const localIdx = state.investEntries.findIndex(e => e.id === existingEntry.id);
                    if (localIdx !== -1) {
                        state.investEntries[localIdx] = existingEntry;
                    }
                    changed = true;
                }
            } else {
                const newEntry = {
                    id: 'auto_inv_' + row.rowNum + '_' + Date.now().toString(36),
                    date: date,
                    origin: `Ponto de ${date}`,
                    amount: expectedAmount,
                    type: 'Automático'
                };
                await store.put(newEntry);
                state.investEntries.push(newEntry);
                changed = true;
            }
        }

        for (const [date, entry] of currentAutoMap.entries()) {
            if (!autoMap.has(date)) {
                await store.delete(entry.id);
                state.investEntries = state.investEntries.filter(e => e.id !== entry.id);
                changed = true;
            }
        }

        if (changed) {
            state.totalInvested = state.investEntries.reduce((s, e) => s + (e.amount || 0), 0);
        }
    } catch (err) {
        console.error('[INVEST-SYNC] Erro ao sincronizar investimentos automáticos:', err);
    }
}

function applyMathParserToInputs() {
    const inputIds = ['fin-amount', 'invest-amount', 'edit-day-rate', 'edit-earnings', 'calc-initial', 'calc-monthly', 'calc-rate', 'input-global-rate', 'input-goal-earnings'];
    
    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        
        input.addEventListener('focus', () => {
            input.type = 'text';
        });
        
        input.addEventListener('blur', () => {
            const val = input.value.trim();
            if (val) {
                try {
                    const cleanExpr = val.replace(/[^0-9+\-*/.()]/g, '');
                    if (cleanExpr) {
                        const result = Function(`"use strict"; return (${cleanExpr})`)();
                        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                            input.value = Number(result.toFixed(2));
                            if (id === 'edit-day-rate' || id === 'edit-earnings') {
                                runLivePreview();
                            }
                        }
                    }
                } catch (e) {
                    console.warn('[MATH-PARSER] Expressão matemática inválida:', val);
                }
            }
            input.type = 'number';
        });
    });
}

function renderHeatmap() {
    const grid = document.getElementById('productivity-heatmap-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const year = state.selectedYear;
    const month = state.selectedMonth;
    const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    const dayHoursMap = {};
    state.filteredRows.forEach(row => {
        const dateParts = parseDateParts(row.date);
        if (dateParts.month === month && dateParts.year === year) {
            dayHoursMap[dateParts.day] = row.horasFracionarias;
        }
    });
    
    for (let d = 1; d <= totalDays; d++) {
        const hours = dayHoursMap[d] || 0;
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        
        let level = 0;
        if (hours > 0) {
            if (hours < 4) level = 1;
            else if (hours < 8) level = 2;
            else level = 3;
        }
        
        cell.classList.add(`level-${level}`);
        
        const hoursFormatted = formatMinutesToHoursStr(hours * 60);
        cell.title = `Dia ${d} de ${ptMonths[month]}: ${hoursFormatted} trabalhadas`;
        
        const dayRow = state.filteredRows.find(row => {
            const dateParts = parseDateParts(row.date);
            return dateParts.day === d && dateParts.month === month && dateParts.year === year;
        });
        
        if (dayRow) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                openEditModal(dayRow);
            });
        }
        
        cell.innerHTML = `<span class="heatmap-day-lbl">${d}</span>`;
        grid.appendChild(cell);
    }
}

function renderRadarChart() {
    const canvas = document.getElementById('chart-radar-productivity');
    if (!canvas) return;
    
    const weekdayHours = {
        'Segunda-feira': 0,
        'Terça-feira': 0,
        'Quarta-feira': 0,
        'Quinta-feira': 0,
        'Sexta-feira': 0,
        'Sábado': 0,
        'Domingo': 0
    };
    
    state.filteredRows.forEach(row => {
        if (weekdayHours[row.weekday] !== undefined) {
            weekdayHours[row.weekday] += row.horasFracionarias;
        }
    });
    
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const dataValues = [
        weekdayHours['Segunda-feira'],
        weekdayHours['Terça-feira'],
        weekdayHours['Quarta-feira'],
        weekdayHours['Quinta-feira'],
        weekdayHours['Sexta-feira'],
        weekdayHours['Sábado'],
        weekdayHours['Domingo']
    ];
    
    if (state.radarChartInstance) {
        state.radarChartInstance.destroy();
    }
    
    const isDark = !document.body.classList.contains('light-theme');
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const textColor = isDark ? '#9ca3af' : '#4b5563';
    
    state.radarChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Carga Horária',
                data: dataValues,
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                borderColor: 'rgba(6, 182, 212, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(6, 182, 212, 1)',
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    grid: { color: gridColor },
                    angleLines: { color: gridColor },
                    pointLabels: {
                        color: textColor,
                        font: { family: 'Outfit', size: 10, weight: 600 }
                    },
                    ticks: { display: false }
                }
            }
        }
    });
    
    // Projeção dinâmica de Faturamento Fim de Mês
    const year = state.selectedYear;
    const month = state.selectedMonth;
    const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    const activeDaysWithHours = state.filteredRows.filter(r => r.horasFracionarias > 0).length;
    let totalEarningsMonth = 0;
    state.filteredRows.forEach(row => totalEarningsMonth += row.ganhos);
    
    let projected = 0;
    let weeklyAvg = 0;
    
    if (activeDaysWithHours > 0) {
        const today = new Date();
        let daysElapsed = totalDays;
        if (today.getFullYear() === year && today.getMonth() === month) {
            daysElapsed = today.getDate();
        }
        if (daysElapsed <= 0) daysElapsed = 1;
        
        const dailyAvg = totalEarningsMonth / daysElapsed;
        projected = dailyAvg * totalDays;
        weeklyAvg = dailyAvg * 7;
    }
    
    document.getElementById('val-forecast-earnings').innerText = formatCurrency(projected);
    document.getElementById('lbl-forecast-desc').innerText = `Média semanal atual: ${formatCurrency(weeklyAvg)}/semana`;
}

function renderFinanceScore() {
    const scoreValEl = document.getElementById('val-finance-score');
    const scoreStatusEl = document.getElementById('lbl-score-status');
    const scoreAdviceEl = document.getElementById('lbl-score-advice');
    if (!scoreValEl || !scoreStatusEl || !scoreAdviceEl) return;
    
    let hoursIncome = 0;
    state.filteredRows.forEach(row => {
        hoursIncome += row.ganhos;
    });
    
    let extraIncome = 0;
    let totalExpenses = 0;
    state.filteredFinanceEntries.forEach(entry => {
        if (entry.type === 'Ganho Extra') {
            extraIncome += entry.amount;
        } else {
            totalExpenses += entry.amount;
        }
    });
    
    const totalIncome = hoursIncome + extraIncome;
    
    let score = 100;
    let status = 'Excelente';
    let advice = 'Você está retendo mais de 30% do seu faturamento! Continue assim.';
    
    if (totalIncome > 0) {
        const savingsRate = (totalIncome - totalExpenses) / totalIncome;
        
        if (savingsRate >= 0.30) {
            score = 100;
            status = 'Excelente 🎯';
            advice = `Você poupou ${(savingsRate * 100).toFixed(0)}% das suas receitas. Saúde financeira perfeita!`;
        } else if (savingsRate >= 0.15) {
            score = Math.floor(80 + (savingsRate - 0.15) * 133);
            status = 'Muito Bom 👍';
            advice = `Ritmo saudável! Você poupou ${(savingsRate * 100).toFixed(0)}% das suas receitas este mês.`;
        } else if (savingsRate >= 0.0) {
            score = Math.floor(50 + savingsRate * 200);
            status = 'Razoável ⚠️';
            advice = `Margem estreita de ${(savingsRate * 100).toFixed(0)}%. Tente reduzir despesas variáveis supérfluas.`;
        } else {
            const absRate = Math.abs(savingsRate);
            score = Math.max(10, Math.floor(50 - absRate * 100));
            status = 'Crítico 🚨';
            advice = `Suas despesas superaram os rendimentos em R$ ${Math.abs(totalIncome - totalExpenses).toFixed(2)}. Revise seus gastos!`;
        }
    } else {
        score = 0;
        status = 'Sem Dados';
        advice = 'Adicione receitas para simular o score de saúde do mês.';
    }
    
    scoreValEl.innerText = score;
    scoreStatusEl.innerText = status;
    scoreAdviceEl.innerText = advice;
}

function renderBudgets() {
    const categories = ['Moradia', 'Alimentação', 'Outros'];
    const limits = {
        'Moradia': 600,
        'Alimentação': 400,
        'Outros': 300
    };
    
    const expenses = {
        'Moradia': 0,
        'Alimentação': 0,
        'Outros': 0
    };
    
    state.filteredFinanceEntries.forEach(entry => {
        if (entry.type !== 'Ganho Extra') {
            const cat = entry.category;
            if (expenses[cat] !== undefined) {
                expenses[cat] += entry.amount;
            } else {
                expenses['Outros'] += entry.amount;
            }
        }
    });
    
    categories.forEach(cat => {
        const exp = expenses[cat];
        const lim = limits[cat];
        const pct = Math.min(100, Math.floor((exp / lim) * 100));
        
        const valEl = document.getElementById(`budget-val-${cat}`);
        const fillEl = document.getElementById(`budget-fill-${cat}`);
        
        if (valEl && fillEl) {
            valEl.innerText = `${formatCurrency(exp)} / ${formatCurrency(lim)}`;
            fillEl.style.width = `${pct}%`;
            
            if (pct >= 90) {
                fillEl.className = 'progress-bar-fill color-red';
            } else if (pct >= 70) {
                fillEl.className = 'progress-bar-fill color-yellow';
            } else {
                if (cat === 'Moradia') fillEl.className = 'progress-bar-fill color-blue';
                else if (cat === 'Alimentação') fillEl.className = 'progress-bar-fill color-green';
                else fillEl.className = 'progress-bar-fill color-purple';
            }
        }
    });
}

window.launchRecurring = function(desc, amount, type, category) {
    document.getElementById('fin-date').value = new Date().toISOString().substring(0, 10);
    document.getElementById('fin-type').value = type;
    document.getElementById('fin-desc').value = desc;
    document.getElementById('fin-amount').value = amount;
    document.getElementById('fin-category').value = category;
    
    const catCustom = document.getElementById('fin-custom-category');
    if (catCustom) catCustom.classList.add('hidden');
    
    const form = document.getElementById('finance-entry-form');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
    showToast(`Despesa recorrente '${desc}' lançada instantaneamente!`, 'success');
};

// ==========================================================================
// OFFLINE STUBS (funções que dependiam do servidor, agora são no-ops)
// ==========================================================================
async function setupRealtimeUpdates() { /* offline: sem SSE */ }
async function resolveActiveTunnelUrl() { /* offline: sem túnal */ }
async function runConnectionDiagnostics() {
    const diagStatus = document.getElementById('diag-conn-status');
    if (diagStatus) {
        diagStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Modo Offline';
        diagStatus.style.background = 'rgba(16, 185, 129, 0.15)';
        diagStatus.style.color = '#10b981';
    }
    const diagLatency = document.getElementById('diag-latency');
    if (diagLatency) {
        diagLatency.innerText = 'IndexedDB Local';
        diagLatency.style.color = '#10b981';
    }
}
function showSetupOverlay() { /* offline: sem pareamento */ }
function updateMacroDroidLink() { /* offline: sem MacroDroid URLs */ }
function saveStateToLocalStorage() { /* offline: dados salvos no IndexedDB */ }

// ==========================================================================
// ADVANCED KEYLESS MOBILE WEB APIS & PERSISTENCE
// ==========================================================================

const MOTIVATIONAL_QUOTES = [
    "Quem quer mover o mundo, primeiro deve mover a si mesmo. — Sócrates",
    "A pressa é inimiga da perfeição, mas a consistência é a mãe da excelência.",
    "A melhor maneira de prever o futuro é criá-lo. — Peter Drucker",
    "O homem sábio poupa para o futuro; o tolo gasta tudo o que ganha. — Provérbios 21:20",
    "Não é a carga que o quebra, mas a maneira como você a carrega. — Lou Holtz",
    "A paciência é amarga, mas seu fruto é doce. — Jean-Jacques Rousseau",
    "A simplicidade é o último grau da sofisticação. — Leonardo da Vinci",
    "Aquele que conquista a si mesmo é o guerreiro mais poderoso. — Lao Tzu",
    "A riqueza não consiste em ter grandes posses, mas em ter poucas necessidades. — Epicteto",
    "A disciplina é a ponte entre metas e realizações. — Jim Rohn",
    "No meio da dificuldade encontra-se a oportunidade. — Albert Einstein",
    "A sorte favorece a mente preparada. — Louis Pasteur",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia. — Robert Collier",
    "A vida é o que acontece enquanto você está ocupado fazendo outros planos. — John Lennon",
    "Foca no que está sob seu controle e ignore o que não está. — Epicteto",
    "O único modo de fazer um excelente trabalho é amar o que você faz. — Steve Jobs",
    "A melhor vingança é não ser como seu inimigo. — Marco Aurélio",
    "A persistência realiza o impossível. — Provérbio Chinês",
    "Trabalhe duro em silêncio, deixe que o seu sucesso faça o barulho.",
    "Poupar hoje é comprar a sua liberdade amanhã.",
    "Não conte os dias, faça os dias contarem. — Muhammad Ali",
    "O tempo é o recurso mais escasso; se não for gerenciado, nada mais poderá ser. — Peter Drucker",
    "A pressa sempre gera erro. — Heródoto",
    "Conhecimento sem aplicação é o mesmo que ignorância.",
    "O investimento em conhecimento sempre paga os melhores juros. — Benjamin Franklin",
    "Quem poupa pouco a pouco, acumula muito. — Provérbio Alemão",
    "Os juros compostos são a oitava maravilha do mundo. — Albert Einstein",
    "Para colher o que poucos colhem, faça o que poucos fazem.",
    "Não busque que os eventos aconteçam como você deseja, mas deseje que aconteçam como acontecem. — Epicteto",
    "O dia de hoje é um presente, por isso é chamado de presente.",
    "O que fazemos na vida ecoa na eternidade. — Máximo Décimo Merídio"
];

function initStoragePersistence() {
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then(granted => {
            if (granted) {
                console.log('[STORAGE] Persistência concedida pelo sistema Android/Chrome.');
            } else {
                console.warn('[STORAGE] Persistência negada. O sistema pode limpar o cache em caso de pouco espaço.');
            }
        }).catch(err => {
            console.error('[STORAGE] Erro ao solicitar persistência:', err);
        });
    }
}

function loadMotivationalQuote() {
    const quoteEl = document.getElementById('motivational-quote');
    if (!quoteEl) return;
    const now = new Date();
    // Determinar índice do dia de forma segura baseada no fuso horário local do aparelho
    const localTime = now.getTime() - (now.getTimezoneOffset() * 60 * 1000);
    const dayIndex = Math.floor(localTime / (1000 * 60 * 60 * 24));
    const idx = dayIndex % MOTIVATIONAL_QUOTES.length;
    quoteEl.innerHTML = `<i class="fa-solid fa-quote-left" style="color: var(--accent-blue); opacity: 0.6; margin-right: 6px; font-size: 0.8rem;"></i> ${MOTIVATIONAL_QUOTES[idx]} <i class="fa-solid fa-quote-right" style="color: var(--accent-blue); opacity: 0.6; margin-left: 6px; font-size: 0.8rem;"></i>`;
}

function updateHideFinancialsUI() {
    const privacyIcon = document.getElementById('privacy-icon');
    if (privacyIcon) {
        if (state.hideFinancials) {
            privacyIcon.className = 'fa-solid fa-eye-slash';
            privacyIcon.title = 'Exibir Valores';
        } else {
            privacyIcon.className = 'fa-solid fa-eye';
            privacyIcon.title = 'Ocultar Valores';
        }
    }
}

async function fetchCurrencyRates() {
    try {
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');
        if (!res.ok) throw new Error('Falha na rede');
        const data = await res.json();
        
        const usdBrl = parseFloat(data.USDBRL.bid);
        const eurBrl = parseFloat(data.EURBRL.bid);
        
        const usdEl = document.getElementById('ticker-usd');
        if (usdEl) {
            usdEl.innerHTML = `<i class="fa-solid fa-dollar-sign color-green"></i> USD: R$ ${usdBrl.toFixed(2)} | <i class="fa-solid fa-euro-sign color-blue"></i> EUR: R$ ${eurBrl.toFixed(2)}`;
        }
        
        state.usdBrl = usdBrl;
        state.eurBrl = eurBrl;
        
        updateCurrencyKPIs();
    } catch (err) {
        console.warn('[CURRENCY] Não foi possível carregar cotações:', err);
    }
}

function updateCurrencyKPIs() {
    if (state.usdBrl) {
        let totalEarningsMonth = 0;
        state.filteredRows.forEach(row => totalEarningsMonth += row.ganhos);
        const usdEarnings = totalEarningsMonth / state.usdBrl;
        const sub = document.getElementById('kpi-month-hours');
        if (sub && state.activeTab === 'dashboard') {
            const currentText = sub.innerText.split(' | ')[0];
            sub.innerText = `${currentText} | $ ${usdEarnings.toFixed(2)} USD`;
        }
    }
}

async function fetchHolidays() {
    try {
        const year = state.selectedYear || new Date().getFullYear();
        const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
        if (!res.ok) throw new Error('Falha na rede');
        const list = await res.json();
        
        state.holidays = {};
        list.forEach(h => {
            state.holidays[h.date] = h.name;
        });
        
        renderHistory();
        renderCommutes();
    } catch (err) {
        console.warn('[HOLIDAYS] Não foi possível carregar feriados:', err);
    }
}

async function fetchWeather() {
    const weatherEl = document.getElementById('weather-info');
    if (!weatherEl) return;
    
    const fetchByCoords = async (lat, lon) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            if (!res.ok) throw new Error('Falha na rede');
            const data = await res.json();
            
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            
            let icon = 'fa-sun';
            let desc = 'Ensolarado';
            if (code >= 1 && code <= 3) { icon = 'fa-cloud-sun'; desc = 'Parcialmente nublado'; }
            else if (code >= 45 && code <= 48) { icon = 'fa-smog'; desc = 'Nevoeiro'; }
            else if (code >= 51 && code <= 67) { icon = 'fa-cloud-showers-heavy'; desc = 'Chovendo'; }
            else if (code >= 71 && code <= 86) { icon = 'fa-snowflake'; desc = 'Neve'; }
            else if (code >= 95) { icon = 'fa-cloud-bolt'; desc = 'Tempestade'; }
            
            weatherEl.innerHTML = `<i class="fa-solid ${icon} color-cyan" title="${desc}"></i> ${temp}°C`;
            state.defaultWeatherText = `Clima: ${temp}°C e ${desc.toLowerCase()}.`;
        } catch (err) {
            console.warn('[WEATHER]', err);
            weatherEl.innerHTML = `<i class="fa-solid fa-cloud-sun color-cyan"></i> Clima Indisponível`;
        }
    };

    const fetchFallbackIP = async () => {
        try {
            const ipRes = await fetch('https://ipapi.co/json/');
            if (!ipRes.ok) throw new Error('Falha IP');
            const ipData = await ipRes.json();
            await fetchByCoords(ipData.latitude, ipData.longitude);
        } catch (e) {
            weatherEl.innerHTML = `<i class="fa-solid fa-cloud-sun color-cyan"></i> Clima Indisponível`;
        }
    };

    if (!navigator.geolocation) {
        await fetchFallbackIP();
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchFallbackIP(), // Fallback on permission denied or timeout
        { timeout: 5000 }
    );
}

async function checkTimeSync() {
    try {
        const res = await fetch('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
        if (!res.ok) throw new Error('Falha na rede');
        const data = await res.json();
        
        const netTime = new Date(data.utc_datetime);
        const localTime = new Date();
        const diffMs = Math.abs(netTime.getTime() - localTime.getTime());
        const diffMinutes = diffMs / 60000;
        
        const warningEl = document.getElementById('time-sync-warning');
        if (warningEl) {
            if (diffMinutes > 3) {
                warningEl.classList.remove('hidden');
            } else {
                warningEl.classList.add('hidden');
            }
        }
    } catch (err) {
        console.warn('[TIME-SYNC] Não foi possível verificar sincronização de hora:', err);
    }
}

function showGoogleDriveGuideModal() {
    if (document.getElementById('modal-gdrive-guide')) return;

    const modal = document.createElement('div');
    modal.id = 'modal-gdrive-guide';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    modal.style.backdropFilter = 'blur(10px)';

    modal.innerHTML = `
        <div class="glass-card" style="width: 90%; max-width: 500px; padding: 2rem; border-radius: var(--radius-lg); position: relative; border: 1px solid rgba(6, 182, 212, 0.3); background: rgba(11, 15, 25, 0.95); max-height: 90vh; overflow-y: auto;">
            <button id="btn-close-gdrive-modal" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: var(--text-secondary); font-size: 1.25rem; cursor: pointer;">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; color: #06b6d4; margin-top: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-brands fa-google-drive"></i> Como Vincular ao Google Drive
            </h3>
            
            <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary); display: flex; flex-direction: column; gap: 1rem;">
                <p>Como o aplicativo roda <strong>100% offline e local no celular</strong>, o Android apagará todos os dados se o aplicativo for desinstalado ou o cache limpo. Siga estes passos simples para nunca perder nada:</p>
                
                <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                    <div style="background: rgba(6, 182, 212, 0.1); color: #06b6d4; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</div>
                    <div>
                        <strong style="color: #fff; display: block;">Baixe a Cópia de Segurança</strong>
                        Clique no botão <strong>"Baixar Backup Atual"</strong> abaixo para gerar o arquivo <code>.json</code> com todos os seus dados.
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                    <div style="background: rgba(6, 182, 212, 0.1); color: #06b6d4; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</div>
                    <div>
                        <strong style="color: #fff; display: block;">Salve no Google Drive do Celular</strong>
                        Ao baixar, selecione a opção de salvar o arquivo diretamente no aplicativo do <strong>Google Drive</strong> (crie uma pasta como "Backup Controle Horas").
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
                    <div style="background: rgba(6, 182, 212, 0.1); color: #06b6d4; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</div>
                    <div>
                        <strong style="color: #fff; display: block;">Recupere a Qualquer Momento</strong>
                        Caso reinstale o app ou troque de celular, basta clicar em <strong>"Escolher e Carregar do Drive"</strong> e selecionar o arquivo <code>.json</code> que você salvou no Google Drive.
                    </div>
                </div>
                
                <div style="background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.15); border-radius: var(--radius-md); padding: 0.75rem; font-size: 0.8rem; color: #06b6d4;">
                    <i class="fa-solid fa-circle-check"></i> <strong>Persistência Local Ativada:</strong> Solicitamos ao Android para blindar o cache do aplicativo, reduzindo drasticamente o risco de limpeza automática do sistema.
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
                <button id="btn-gdrive-export" class="btn btn-primary" style="background: #06b6d4; width: 100%;">
                    <i class="fa-solid fa-download"></i> Baixar Backup Atual (.json)
                </button>
                <button id="btn-gdrive-import" class="btn btn-secondary" style="width: 100%; border-color: rgba(255, 255, 255, 0.2);">
                    <i class="fa-solid fa-upload"></i> Escolher e Carregar do Drive
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btn-close-gdrive-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('btn-gdrive-export').addEventListener('click', () => {
        const downloadBtn = document.getElementById('btn-download-backup');
        if (downloadBtn) downloadBtn.click();
    });

    document.getElementById('btn-gdrive-import').addEventListener('click', () => {
        document.body.removeChild(modal);
        const restoreBtn = document.getElementById('btn-restore-backup');
        if (restoreBtn) restoreBtn.click();
    });
}

// ==========================================================================
// GOOGLE DRIVE CLOUD SYNC & AUTO-BACKUP SYSTEM
// ==========================================================================

const DEFAULT_CLIENT_ID = '1037628867375-e0g84df46f903epc5905g02u83s86tpg.apps.googleusercontent.com';
let gdriveAccessToken = null;
let tokenClient = null;
let gdriveUser = null;
let isSyncing = false;

// Hook disparado a cada alteração do IndexedDB
function onDatabaseWrite() {
    localStorage.setItem('needs_sync', 'true');
    triggerAutoSync();
}

// Obter o Client ID ativo (personalizado ou padrão)
function getGoogleClientId() {
    return localStorage.getItem('gdrive_custom_client_id') || DEFAULT_CLIENT_ID;
}

// Inicializar Google Drive
function initGoogleDrive() {
    // 1. Setup Accordion para configurações avançadas
    const accordionHeader = document.getElementById('gdrive-accordion-header');
    const accordionContent = document.getElementById('gdrive-accordion-content');
    if (accordionHeader && accordionContent) {
        accordionHeader.addEventListener('click', () => {
            const isActive = accordionHeader.classList.toggle('active');
            accordionContent.style.display = isActive ? 'flex' : 'none';
            
            const chevron = accordionHeader.querySelector('.fa-chevron-down');
            if (chevron) {
                chevron.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    // 2. Preencher Client ID personalizado se existir
    const inputClientId = document.getElementById('input-gdrive-client-id');
    if (inputClientId) {
        inputClientId.value = localStorage.getItem('gdrive_custom_client_id') || '';
    }

    // Botão salvar Client ID
    const btnSaveClientId = document.getElementById('btn-save-gdrive-client-id');
    if (btnSaveClientId && inputClientId) {
        btnSaveClientId.addEventListener('click', () => {
            const val = inputClientId.value.trim();
            if (val) {
                localStorage.setItem('gdrive_custom_client_id', val);
                showToast('Google Client ID personalizado salvo!', 'success');
                setupGoogleTokenClient();
            } else {
                localStorage.removeItem('gdrive_custom_client_id');
                showToast('Google Client ID removido.', 'info');
            }
        });
    }

    // Botão resetar Client ID
    const btnResetClientId = document.getElementById('btn-reset-gdrive-client-id');
    if (btnResetClientId && inputClientId) {
        btnResetClientId.addEventListener('click', () => {
            localStorage.removeItem('gdrive_custom_client_id');
            inputClientId.value = '';
            showToast('Google Client ID restaurado para o padrão!', 'success');
            setupGoogleTokenClient();
        });
    }

    // 3. Setup Token Client de Autenticação Google
    setupGoogleTokenClient();

    // 4. Configurar listeners dos botões de sincronização
    const btnConnect = document.getElementById('btn-gdrive-connect');
    if (btnConnect) {
        btnConnect.addEventListener('click', connectGoogleDrive);
    }

    const btnDisconnect = document.getElementById('btn-gdrive-disconnect');
    if (btnDisconnect) {
        btnDisconnect.addEventListener('click', disconnectGoogleDrive);
    }

    const btnSyncNow = document.getElementById('btn-gdrive-sync-now');
    if (btnSyncNow) {
        btnSyncNow.addEventListener('click', async () => {
            showToast('Iniciando sincronização na nuvem...', 'info');
            localStorage.setItem('needs_sync', 'true');
            await triggerAutoSync(true);
        });
    }

    const btnRestoreCloud = document.getElementById('btn-gdrive-restore-cloud');
    if (btnRestoreCloud) {
        btnRestoreCloud.addEventListener('click', () => {
            restoreFromGoogleDriveBackup();
        });
    }

    // Carregar preferências de auto-sync
    const chkAutosync = document.getElementById('chk-gdrive-autosync');
    if (chkAutosync) {
        const savedAutosync = localStorage.getItem('gdrive_autosync');
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode') || 'user';
        
        if (savedAutosync === null) {
            // Se for versão Premium (mode=user), ativa por padrão. Se limpo, desativa ou ativa
            chkAutosync.checked = (mode !== 'clean');
            localStorage.setItem('gdrive_autosync', chkAutosync.checked.toString());
        } else {
            chkAutosync.checked = (savedAutosync === 'true');
        }

        chkAutosync.addEventListener('change', () => {
            localStorage.setItem('gdrive_autosync', chkAutosync.checked.toString());
            if (chkAutosync.checked) {
                triggerAutoSync();
            }
        });
    }

    // Recarregar token de sessão se existir
    const sToken = sessionStorage.getItem('gdrive_token');
    if (sToken) {
        gdriveAccessToken = sToken;
        localStorage.setItem('gdrive_connected', 'true');
        fetchUserProfile().then(updateGDriveUI);
    } else if (localStorage.getItem('gdrive_connected') === 'true') {
        // Tentar obter token de forma silenciosa se já logou antes
        setTimeout(() => {
            if (tokenClient) {
                console.log('[GDRIVE] Tentando reconexão automática silenciosa...');
                try {
                    tokenClient.requestAccessToken({ prompt: 'none' });
                } catch (e) {
                    console.warn('[GDRIVE] Falha ao solicitar token silencioso:', e);
                }
            }
        }, 1000);
    }

    // 6. Monitoramento de Rede
    window.addEventListener('online', () => {
        console.log('[REDE] Conexão reestabelecida!');
        updateNetworkSyncStatus();
        if (localStorage.getItem('needs_sync') === 'true') {
            showToast('Conexão reestabelecida! Sincronizando dados pendentes...', 'info');
            triggerAutoSync();
        }
    });

    window.addEventListener('offline', () => {
        console.log('[REDE] Conexão perdida.');
        updateNetworkSyncStatus();
    });

    // Atualizar UI de rede inicial
    updateNetworkSyncStatus();

    // 7. Assistente de Boas-vindas (Welcome Wizard) se o banco estiver vazio
    setTimeout(checkAndShowWelcomeWizard, 1200);
}

// Configurar o Token Client da Google
function setupGoogleTokenClient() {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
        console.warn('[GDRIVE] Biblioteca Google GIS não carregada. Aguardando conexão...');
        if (navigator.onLine) {
            setTimeout(setupGoogleTokenClient, 3000);
        }
        return;
    }

    try {
        const client_id = getGoogleClientId();
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: client_id,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: async (resp) => {
                if (resp.error) {
                    console.error('[GDRIVE] Erro de autenticação:', resp.error);
                    // Se for silencioso e falhar por consentimento pendente, não incomoda
                    if (resp.error === 'immediate_failed') {
                        console.log('[GDRIVE] Reconexão silenciosa falhou (necessário interação).');
                        return;
                    }
                    showToast('Falha na autenticação com o Google.', 'error');
                    localStorage.setItem('gdrive_connected', 'false');
                    updateGDriveUI();
                    return;
                }

                if (resp.access_token) {
                    gdriveAccessToken = resp.access_token;
                    localStorage.setItem('gdrive_connected', 'true');
                    sessionStorage.setItem('gdrive_token', gdriveAccessToken);
                    
                    await fetchUserProfile();
                    updateGDriveUI();
                    showToast('Google Drive conectado!', 'success');

                    // Sincronizar se necessário
                    if (localStorage.getItem('needs_sync') === 'true' || localStorage.getItem('gdrive_autosync') === 'true') {
                        triggerAutoSync();
                    }
                }
            }
        });
        console.log('[GDRIVE] Google Token Client configurado.');
    } catch (e) {
        console.error('[GDRIVE] Erro ao configurar Token Client:', e);
    }
}

// Conectar ao Google Drive
function connectGoogleDrive() {
    if (!navigator.onLine) {
        showToast('Sem conexão de internet para conectar ao Drive!', 'warning');
        return;
    }
    if (!tokenClient) {
        showToast('Biblioteca Google carregando. Aguarde um instante...', 'info');
        setupGoogleTokenClient();
        return;
    }
    tokenClient.requestAccessToken({ prompt: 'consent' });
}

// Desconectar Google Drive
function disconnectGoogleDrive() {
    if (gdriveAccessToken) {
        try {
            google.accounts.oauth2.revokeToken(gdriveAccessToken, () => {
                console.log('[GDRIVE] Token revogado.');
            });
        } catch (e) {}
    }
    gdriveAccessToken = null;
    gdriveUser = null;
    sessionStorage.removeItem('gdrive_token');
    localStorage.setItem('gdrive_connected', 'false');
    updateGDriveUI();
    showToast('Google Drive desconectado.', 'info');
}

// Buscar perfil do usuário
async function fetchUserProfile() {
    try {
        const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${gdriveAccessToken}` }
        });
        if (resp.ok) {
            gdriveUser = await resp.json();
            console.log('[GDRIVE] Usuário autenticado:', gdriveUser.email);
        }
    } catch (e) {
        console.warn('[GDRIVE] Não foi possível ler perfil do usuário:', e);
    }
}

// Atualizar interface de acordo com a conexão do Google Drive
function updateGDriveUI() {
    const loginPrompt = document.getElementById('gdrive-login-prompt');
    const profileInfo = document.getElementById('gdrive-profile-info');
    const syncOptions = document.getElementById('gdrive-sync-options');
    const statusBadge = document.getElementById('gdrive-status-badge');

    const connected = (gdriveAccessToken !== null);

    if (connected) {
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (profileInfo) profileInfo.style.display = 'flex';
        if (syncOptions) syncOptions.style.display = 'flex';
        
        if (statusBadge) {
            statusBadge.innerText = 'Conectado';
            statusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
            statusBadge.style.color = '#10b981';
            statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
        }

        if (gdriveUser) {
            const avatarEl = document.getElementById('gdrive-user-avatar');
            const nameEl = document.getElementById('gdrive-user-name');
            const emailEl = document.getElementById('gdrive-user-email');
            
            if (avatarEl) avatarEl.src = gdriveUser.picture || '';
            if (nameEl) nameEl.innerText = gdriveUser.name || 'Conectado';
            if (emailEl) emailEl.innerText = gdriveUser.email || '';
        }
    } else {
        if (loginPrompt) loginPrompt.style.display = 'flex';
        if (profileInfo) profileInfo.style.display = 'none';
        if (syncOptions) syncOptions.style.display = 'none';
        
        if (statusBadge) {
            statusBadge.innerText = 'Desconectado';
            statusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
            statusBadge.style.color = '#ef4444';
            statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
        }
    }
    
    updateNetworkSyncStatus();
}

// Atualiza o status visual no footer da sincronização
function updateNetworkSyncStatus() {
    const statusFooter = document.getElementById('sync-status');
    const connected = (gdriveAccessToken !== null);
    const online = navigator.onLine;

    if (!online) {
        setSyncStatus('offline', 'Pendente (Sem Internet) ⚠️');
        return;
    }

    if (connected) {
        if (localStorage.getItem('needs_sync') === 'true') {
            setSyncStatus('syncing', 'Alterações Pendentes ⚠️');
        } else {
            setSyncStatus('connected', 'Nuvem Sincronizada ✔');
        }
    } else {
        setSyncStatus('connected', 'Salvo Localmente (Sem Nuvem)');
    }
}

// Helper genérico para chamadas à API do Google Drive
async function gdriveRequest(urlPath, method = 'GET', body = null, headers = {}) {
    if (!gdriveAccessToken) {
        gdriveAccessToken = sessionStorage.getItem('gdrive_token');
        if (!gdriveAccessToken) {
            throw new Error('Google Drive não autenticado.');
        }
    }

    const options = {
        method: method,
        headers: {
            'Authorization': `Bearer ${gdriveAccessToken}`,
            ...headers
        }
    };

    if (body) {
        if (body instanceof ArrayBuffer || body instanceof Blob) {
            options.body = body;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
    }

    const response = await fetch(`https://www.googleapis.com/${urlPath}`, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API Google: ${response.status} - ${errorText}`);
    }

    return response.json();
}

// Obter ou criar a pasta no Google Drive
async function getOrCreateFolder() {
    const folderName = 'Controle de Horas Premium';
    const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const searchResult = await gdriveRequest(`drive/v3/files?q=${query}&fields=files(id)`);
    
    if (searchResult.files && searchResult.files.length > 0) {
        return searchResult.files[0].id;
    }
    
    const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
    };
    
    const newFolder = await gdriveRequest('drive/v3/files', 'POST', folderMetadata);
    return newFolder.id;
}

// Fazer upload ou atualização de um arquivo na pasta específica
async function uploadFileToFolder(folderId, fileName, mimeType, content) {
    const query = encodeURIComponent(`name = '${fileName}' and '${folderId}' in parents and trashed = false`);
    const searchResult = await gdriveRequest(`drive/v3/files?q=${query}&fields=files(id)`);
    
    let fileId = null;
    if (searchResult.files && searchResult.files.length > 0) {
        fileId = searchResult.files[0].id;
    }
    
    if (!fileId) {
        const metadata = {
            name: fileName,
            parents: [folderId],
            mimeType: mimeType
        };
        const newFile = await gdriveRequest('drive/v3/files', 'POST', metadata);
        fileId = newFile.id;
    }
    
    let bodyData = content;
    if (typeof content === 'object' && !(content instanceof Blob) && !(content instanceof ArrayBuffer)) {
        bodyData = JSON.stringify(content);
    }
    
    await gdriveRequest(
        `upload/drive/v3/files/${fileId}?uploadType=media`,
        'PATCH',
        bodyData,
        { 'Content-Type': mimeType }
    );
    
    return fileId;
}

// Sincronizar todos os dados locais na nuvem (JSON e Excel)
async function triggerAutoSync(force = false) {
    if (isSyncing) return;
    if (!gdriveAccessToken) return; // Não conectado
    
    const autosync = localStorage.getItem('gdrive_autosync') === 'true';
    if (!autosync && !force) return;
    
    if (!navigator.onLine) {
        console.warn('[GDRIVE] Dispositivo offline. Marcado para sincronização posterior.');
        localStorage.setItem('needs_sync', 'true');
        updateNetworkSyncStatus();
        return;
    }
    
    isSyncing = true;
    updateNetworkSyncStatus();
    setSyncStatus('syncing', 'Sincronizando Nuvem... 🔄');
    
    try {
        const folderId = await getOrCreateFolder();
        
        // 1. Exportar e Enviar JSON de Backup
        const rows = await dbGetAll('rows');
        const finance = await dbGetAll('finance');
        const invest = await dbGetAll('invest');
        const notes = await dbGetAll('notes');
        const cfgRate = await dbGet('config', 'globalRate');
        const cfgInv = await dbGet('config', 'investPercent');
        
        const backupData = {
            exportedAt: new Date().toISOString(),
            version: DB_VERSION,
            globalRate: cfgRate ? cfgRate.value : state.globalRate,
            investPercent: cfgInv ? cfgInv.value : state.investPercent,
            rows,
            financeEntries: finance,
            investEntries: invest,
            notes
        };
        
        await uploadFileToFolder(folderId, 'controle_horas_backup.json', 'application/json', backupData);
        
        // 2. Exportar e Enviar Planilha Excel (.xlsx) formatada
        const workbook = new ExcelJS.Workbook();
        
        // Controle de Horas
        const sheet = workbook.addWorksheet('Controle de Horas');
        sheet.getRow(1).values = [
            'Data', 'Dia da Semana', 'Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2',
            'Horas do Dia', 'Valor do Dia (R$)', 'Valor Hora', 'Observações',
            'Status Pagamento', 'Saída de Casa', 'Chegada em Casa', 'Tempo de Trajeto', 'Tempo Fora de Casa'
        ];
        sheet.getRow(1).font = { bold: true };
        
        state.rows.forEach((row, i) => {
            const rNum = i + 2;
            const excelRow = sheet.getRow(rNum);
            const dVal = row.date ? new Date(row.date + 'T00:00:00') : null;
            
            excelRow.getCell(1).value = dVal;
            excelRow.getCell(1).numFmt = 'yyyy-mm-dd';
            excelRow.getCell(2).value = row.weekday || '';
            excelRow.getCell(3).value = row.entrada1 || null;
            excelRow.getCell(4).value = row.saida1 || null;
            excelRow.getCell(5).value = row.entrada2 || null;
            excelRow.getCell(6).value = row.saida2 || null;
            excelRow.getCell(8).value = row.ganhos || 0;
            excelRow.getCell(8).numFmt = '"R$"#,##0.00';
            excelRow.getCell(9).value = row.valorHora !== null && row.valorHora !== undefined && row.valorHora !== '' ? parseFloat(row.valorHora) : state.globalRate;
            excelRow.getCell(9).numFmt = '"R$"#,##0.00';
            excelRow.getCell(10).value = row.obs || '';
            excelRow.getCell(11).value = row.statusPagamento || 'Pendente';
            excelRow.getCell(12).value = row.commuteDeparture || null;
            excelRow.getCell(13).value = row.commuteArrival || null;
            excelRow.getCell(14).value = row.tempoTrajeto || null;
            excelRow.getCell(15).value = row.tempoForaCasa || null;
            
            excelRow.getCell(7).value = {
                formula: `IF(AND(C${rNum}<>"",D${rNum}<>""), D${rNum}-C${rNum}, 0) + IF(AND(E${rNum}<>"",F${rNum}<>""), F${rNum}-E${rNum}, 0)`,
                result: row.horasFracionarias / 24
            };
            excelRow.getCell(7).numFmt = '[hh]:mm';
        });
        
        // Filtro
        const filterSheet = workbook.addWorksheet('Filtro');
        filterSheet.getRow(1).values = [
            'Total Horas Trabalhadas', 'Total a Receber (R$)', 'Total Recebido (R$)', 'Total Pendente (R$)'
        ];
        filterSheet.getRow(1).font = { bold: true };
        
        let totalWorkedSec = state.rows.reduce((s, r) => s + (r.minutosTrabalhados || 0) * 60, 0);
        let totalVal = state.rows.reduce((s, r) => s + (r.ganhos || 0), 0);
        let totalPaid = state.rows.reduce((s, r) => s + (r.statusPagamento === 'Pago' ? (r.ganhos || 0) : 0), 0);
        let totalPend = state.rows.reduce((s, r) => s + (r.statusPagamento !== 'Pago' ? (r.ganhos || 0) : 0), 0);
        
        filterSheet.getRow(2).getCell(1).value = totalWorkedSec / 86400;
        filterSheet.getRow(2).getCell(1).numFmt = '[hh]:mm';
        filterSheet.getRow(2).getCell(2).value = totalVal;
        filterSheet.getRow(2).getCell(2).numFmt = '"R$"#,##0.00';
        filterSheet.getRow(2).getCell(3).value = totalPaid;
        filterSheet.getRow(2).getCell(3).numFmt = '"R$"#,##0.00';
        filterSheet.getRow(2).getCell(4).value = totalPend;
        filterSheet.getRow(2).getCell(4).numFmt = '"R$"#,##0.00';
        
        // Gestão Financeira
        const finSheet = workbook.addWorksheet('Gestão Financeira');
        finSheet.getRow(1).values = ['ID', 'Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Conta'];
        finSheet.getRow(1).font = { bold: true };
        state.financeEntries.forEach((entry, idx) => {
            const r = finSheet.getRow(idx + 2);
            r.values = [
                entry.id,
                entry.date ? new Date(entry.date + 'T00:00:00') : null,
                entry.type === 'income' ? 'Receita' : 'Despesa',
                entry.category || '',
                entry.description || '',
                entry.amount || 0,
                entry.account || 'Principal'
            ];
            r.getCell(2).numFmt = 'yyyy-mm-dd';
            r.getCell(6).numFmt = '"R$"#,##0.00';
        });

        // Investimentos
        const invSheet = workbook.addWorksheet('Investimentos');
        invSheet.getRow(1).values = ['ID', 'Data', 'Ativo', 'Tipo', 'Quantidade', 'Valor Aporte (R$)', 'Instituição'];
        invSheet.getRow(1).font = { bold: true };
        state.investEntries.forEach((entry, idx) => {
            const r = invSheet.getRow(idx + 2);
            r.values = [
                entry.id,
                entry.date ? new Date(entry.date + 'T00:00:00') : null,
                entry.assetName || 'Investimento Geral',
                entry.assetType || 'Outros',
                entry.shares || 1,
                entry.amount || 0,
                entry.broker || 'Corretora'
            ];
            r.getCell(2).numFmt = 'yyyy-mm-dd';
            r.getCell(6).numFmt = '"R$"#,##0.00';
        });

        const excelBuffer = await workbook.xlsx.writeBuffer();
        await uploadFileToFolder(folderId, 'Controle_de_Horas_Trabalho.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', excelBuffer);

        localStorage.removeItem('needs_sync');
        updateNetworkSyncStatus();
        
        if (force) {
            showToast('Nuvem sincronizada!', 'success');
        }
    } catch (err) {
        console.error('[GDRIVE-SYNC-ERRO]', err);
        localStorage.setItem('needs_sync', 'true');
        updateNetworkSyncStatus();
        if (force) {
            showToast('Erro ao sincronizar com Google Drive.', 'error');
        }
    } finally {
        isSyncing = false;
    }
}

// Procurar e carregar o arquivo de backup no Google Drive (Restaurar)
async function restoreFromGoogleDriveBackup() {
    if (!navigator.onLine) {
        showToast('Sem conexão de internet para buscar backup!', 'warning');
        return;
    }
    if (!gdriveAccessToken) {
        showToast('Conecte ao Google Drive primeiro!', 'info');
        connectGoogleDrive();
        return;
    }

    showToast('Buscando backups no Google Drive...', 'info');

    try {
        const folderId = await getOrCreateFolder();
        const query = encodeURIComponent(`name = 'controle_horas_backup.json' and '${folderId}' in parents and trashed = false`);
        const searchResult = await gdriveRequest(`drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`);
        
        if (!searchResult.files || searchResult.files.length === 0) {
            showToast('Nenhum backup encontrado no Google Drive!', 'warning');
            return;
        }

        const file = searchResult.files[0];
        const confirmRestore = confirm(`Backup encontrado!\nModificado em: ${new Date(file.modifiedTime).toLocaleString()}.\n\nDeseja restaurar? Isso substituirá todos os dados locais atuais.`);
        if (!confirmRestore) return;

        showToast('Baixando backup da nuvem...', 'info');

        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
            headers: { 'Authorization': `Bearer ${gdriveAccessToken}` }
        });

        if (!response.ok) {
            throw new Error(`Erro ao baixar arquivo: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.rows || !Array.isArray(data.rows)) {
            showToast('Arquivo de backup inválido!', 'error');
            return;
        }

        isImportingData = true;
        
        // Importar configurações
        if (data.globalRate) await dbPut('config', { key: 'globalRate', value: data.globalRate });
        if (data.investPercent) await dbPut('config', { key: 'investPercent', value: data.investPercent });
        
        // Importar linhas
        const txRows = db.transaction('rows', 'readwrite');
        txRows.objectStore('rows').clear();
        data.rows.forEach(r => txRows.objectStore('rows').put(r));
        await new Promise((res, rej) => { txRows.oncomplete = res; txRows.onerror = rej; });
        
        // Importar finanças
        if (data.financeEntries) {
            const txFin = db.transaction('finance', 'readwrite');
            txFin.objectStore('finance').clear();
            data.financeEntries.forEach(f => txFin.objectStore('finance').put(f));
            await new Promise((res, rej) => { txFin.oncomplete = res; txFin.onerror = rej; });
        }
        
        // Importar investimentos
        if (data.investEntries) {
            const txInv = db.transaction('invest', 'readwrite');
            txInv.objectStore('invest').clear();
            data.investEntries.forEach(i => txInv.objectStore('invest').put(i));
            await new Promise((res, rej) => { txInv.oncomplete = res; txInv.onerror = rej; });
        }
        
        // Importar notas
        if (data.notes) {
            const txNot = db.transaction('notes', 'readwrite');
            txNot.objectStore('notes').clear();
            data.notes.forEach(n => txNot.objectStore('notes').put(n));
            await new Promise((res, rej) => { txNot.oncomplete = res; txNot.onerror = rej; });
        }

        isImportingData = false;
        localStorage.removeItem('needs_sync');
        localStorage.setItem('welcome_dismissed', 'true');
        
        showToast('Dados restaurados com sucesso!', 'success');
        setTimeout(() => window.location.reload(), 1500);

    } catch (e) {
        isImportingData = false;
        console.error('[GDRIVE-RESTORE-ERRO]', e);
        showToast('Erro ao restaurar backup da nuvem.', 'error');
    }
}

// Verificar se o banco está vazio e exibir assistente de Boas-vindas (Welcome Wizard)
function checkAndShowWelcomeWizard() {
    if (localStorage.getItem('welcome_dismissed') === 'true') return;
    if (state.rows.length > 0 || state.financeEntries.length > 0) return;
    if (document.getElementById('modal-welcome-wizard')) return;

    const modal = document.createElement('div');
    modal.id = 'modal-welcome-wizard';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(11, 15, 25, 0.9)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '3000';
    modal.style.backdropFilter = 'blur(15px)';

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'user';

    modal.innerHTML = `
        <div class="glass-card" style="width: 90%; max-width: 520px; padding: 2rem; border-radius: var(--radius-lg); border: 1px solid rgba(6, 182, 212, 0.3); background: rgba(15, 23, 42, 0.95); text-align: center; max-height: 95vh; overflow-y: auto;">
            <i class="fa-solid fa-hourglass-start" style="font-size: 2.75rem; color: #06b6d4; margin-bottom: 0.75rem;"></i>
            
            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem; color: #fff; margin-top: 0; margin-bottom: 0.5rem;">
                Controle de Horas Premium 2026
            </h2>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.4;">
                Olá! Não encontramos registros locais no seu aparelho. Escolha uma opção para iniciar:
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem; text-align: left;">
                <!-- Carregar Planilha Original (Premium) -->
                ${(typeof PREFILLED_EXCEL_BASE64 !== 'undefined' && PREFILLED_EXCEL_BASE64 && mode !== 'clean') ? `
                <button id="btn-wizard-prefilled" class="btn ripple" style="background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.35); color: #fff; padding: 0.85rem; border-radius: var(--radius-md); text-align: left; display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; width: 100%;">
                    <i class="fa-solid fa-file-invoice-dollar" style="font-size: 1.4rem; color: #06b6d4; margin-top: 2px;"></i>
                    <div style="flex-grow: 1;">
                        <strong style="display: block; font-size: 0.8rem; color: #06b6d4;">Carregar Planilha Padrão (Recomendado)</strong>
                        <span style="display: block; font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.1rem; line-height: 1.2;">
                            Inicializa o aplicativo diretamente com os seus dados do Excel pré-preenchidos.
                        </span>
                    </div>
                </button>
                ` : ''}

                <!-- Conectar Drive -->
                <button id="btn-wizard-gdrive" class="btn ripple" style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); color: #fff; padding: 0.85rem; border-radius: var(--radius-md); text-align: left; display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; width: 100%;">
                    <i class="fa-brands fa-google-drive" style="font-size: 1.4rem; color: #06b6d4; margin-top: 2px;"></i>
                    <div style="flex-grow: 1;">
                        <strong style="display: block; font-size: 0.8rem; color: #06b6d4;">Restaurar do Google Drive</strong>
                        <span style="display: block; font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.1rem; line-height: 1.2;">
                            Conecte sua conta Google para procurar e baixar seu backup anterior automaticamente em segundos.
                        </span>
                    </div>
                </button>
                
                <!-- Planilha Limpa -->
                <button id="btn-wizard-clean" class="btn ripple" style="background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.2); color: #fff; padding: 0.85rem; border-radius: var(--radius-md); text-align: left; display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; width: 100%;">
                    <i class="fa-solid fa-file-excel" style="font-size: 1.4rem; color: #10b981; margin-top: 2px;"></i>
                    <div style="flex-grow: 1;">
                        <strong style="display: block; font-size: 0.8rem; color: #10b981;">Começar do Zero (Planilha Limpa)</strong>
                        <span style="display: block; font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.1rem; line-height: 1.2;">
                            Cria um banco de dados em branco e limpo para novos lançamentos de ponto e finanças.
                        </span>
                    </div>
                </button>
                
                <!-- Restaurar Local JSON -->
                <button id="btn-wizard-json" class="btn ripple" style="background: rgba(245, 158, 11, 0.04); border: 1px solid rgba(245, 158, 11, 0.2); color: #fff; padding: 0.85rem; border-radius: var(--radius-md); text-align: left; display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; width: 100%;">
                    <i class="fa-solid fa-file-import" style="font-size: 1.4rem; color: #f59e0b; margin-top: 2px;"></i>
                    <div style="flex-grow: 1;">
                        <strong style="display: block; font-size: 0.8rem; color: #f59e0b;">Restaurar Backup Local (.json)</strong>
                        <span style="display: block; font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.1rem; line-height: 1.2;">
                            Selecione um arquivo de backup JSON salvo no seu aparelho para carregar os dados.
                        </span>
                    </div>
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; font-size: 0.65rem; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                <i class="fa-solid fa-lock"></i> Seus dados ficam protegidos no seu aparelho e no seu próprio Drive privado.
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const btnWizardPrefilled = document.getElementById('btn-wizard-prefilled');
    if (btnWizardPrefilled) {
        btnWizardPrefilled.addEventListener('click', async () => {
            document.body.removeChild(modal);
            try {
                showToast('Importando dados padrão...', 'info');
                await seedFromPrefilledExcel();
                localStorage.setItem('welcome_dismissed', 'true');
                localStorage.setItem('needs_sync', 'true');
                triggerAutoSync();
                showToast('Dados iniciais carregados com sucesso! Recarregando...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (e) {
                console.error(e);
                showToast('Erro ao importar dados padrão!', 'error');
            }
        });
    }

    document.getElementById('btn-wizard-clean').addEventListener('click', () => {
        localStorage.setItem('welcome_dismissed', 'true');
        document.body.removeChild(modal);
        showToast('Planilha vazia iniciada!', 'success');
    });

    document.getElementById('btn-wizard-gdrive').addEventListener('click', async () => {
        document.body.removeChild(modal);
        if (!gdriveAccessToken) {
            connectGoogleDrive();
            localStorage.setItem('needs_sync', 'true');
        } else {
            restoreFromGoogleDriveBackup();
        }
    });

    document.getElementById('btn-wizard-json').addEventListener('click', () => {
        document.body.removeChild(modal);
        const restoreBtn = document.getElementById('btn-restore-backup');
        if (restoreBtn) restoreBtn.click();
    });
}

// ==========================================================================
// PREMIUM TOOLS & INTEGRATED NOTEPAD LOGIC
// ==========================================================================

let isToolsInitialized = false;

function renderToolsTab() {
    initToolsEvents();
    loadNotes();
}

function initToolsEvents() {
    if (isToolsInitialized) return;
    isToolsInitialized = true;

    console.log('[TOOLS] Inicializando eventos das ferramentas...');

    // 1. Bloco de Notas: Evento de Submit do Formulário
    const noteForm = document.getElementById('note-form');
    if (noteForm) {
        noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idInput = document.getElementById('note-id');
            const titleInput = document.getElementById('note-title');
            const tagInput = document.getElementById('note-tag');
            const contentInput = document.getElementById('note-content');

            const id = idInput.value || 'note_' + Date.now();
            const note = {
                id,
                title: titleInput.value,
                tag: tagInput.value,
                content: contentInput.value,
                updatedAt: new Date().toISOString()
            };

            try {
                await dbPut('notes', note);
                showToast('Nota salva com sucesso!', 'success');
                noteForm.reset();
                idInput.value = '';
                document.getElementById('btn-clear-note').classList.add('hidden');
                loadNotes();
                
                // Disparar sincronização em background na nuvem se conectado
                localStorage.setItem('needs_sync', 'true');
                triggerAutoSync();
            } catch (err) {
                console.error('[NOTES]', err);
                showToast('Erro ao salvar nota!', 'error');
            }
        });
    }

    // Bloco de Notas: Cancelar Edição
    const btnClearNote = document.getElementById('btn-clear-note');
    if (btnClearNote) {
        btnClearNote.addEventListener('click', () => {
            noteForm.reset();
            document.getElementById('note-id').value = '';
            btnClearNote.classList.add('hidden');
        });
    }

    // Bloco de Notas: Busca Dinâmica
    const searchNotesInput = document.getElementById('search-notepad');
    if (searchNotesInput) {
        searchNotesInput.addEventListener('input', () => {
            loadNotes(searchNotesInput.value);
        });
    }

    // 2. Calculadora de Juros Compostos
    const btnCalcInterest = document.getElementById('btn-calc-interest');
    if (btnCalcInterest) {
        btnCalcInterest.addEventListener('click', () => {
            const initial = parseFloat(document.getElementById('calc-initial').value) || 0;
            const monthly = parseFloat(document.getElementById('calc-monthly').value) || 0;
            const rate = parseFloat(document.getElementById('calc-interest').value) || 0;
            const years = parseFloat(document.getElementById('calc-years').value) || 0;

            const months = years * 12;
            const monthlyRate = Math.pow(1 + (rate / 100), 1 / 12) - 1; // Conversão taxa anual para mensal

            let total = initial;
            let totalInvested = initial;

            for (let i = 0; i < months; i++) {
                total = total * (1 + monthlyRate) + monthly;
                totalInvested += monthly;
            }

            const interestGained = total - totalInvested;

            document.getElementById('result-total').innerText = 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            document.getElementById('result-invested').innerText = 'R$ ' + totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            document.getElementById('result-interest').innerText = 'R$ ' + interestGained.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            document.getElementById('calc-interest-results').classList.remove('hidden');
            showToast('Projeção calculada!', 'success');
        });
    }

    // 3. Conversor de Moedas Dinâmico
    const btnConvertCurrency = document.getElementById('btn-convert-currency');
    if (btnConvertCurrency) {
        btnConvertCurrency.addEventListener('click', () => {
            const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
            const from = document.getElementById('conv-from').value;
            const to = document.getElementById('conv-to').value;

            if (from === to) {
                document.getElementById('conv-result-text').innerText = `${amount.toFixed(2)} ${from} = ${amount.toFixed(2)} ${to}`;
                return;
            }

            // Usar taxas salvas no estado global
            const usdToBrl = state.usdBrl || 5.40; // Fallback se offline
            const eurToBrl = state.eurBrl || 5.80;

            let amountInBrl = amount;
            if (from === 'USD') amountInBrl = amount * usdToBrl;
            else if (from === 'EUR') amountInBrl = amount * eurToBrl;

            let finalAmount = amountInBrl;
            if (to === 'USD') finalAmount = amountInBrl / usdToBrl;
            else if (to === 'EUR') finalAmount = amountInBrl / eurToBrl;

            document.getElementById('conv-result-text').innerText = `${amount.toLocaleString('pt-BR')} ${from} = ${finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}`;
            showToast('Moeda convertida com cotação atual!', 'success');
        });
    }

    // 4. Calculadora de Tarifa Horária PJ
    const btnCalcRate = document.getElementById('btn-calc-rate');
    if (btnCalcRate) {
        btnCalcRate.addEventListener('click', () => {
            const salary = parseFloat(document.getElementById('rate-salary').value) || 0;
            const expenses = parseFloat(document.getElementById('rate-expenses').value) || 0;
            const hoursPerDay = parseFloat(document.getElementById('rate-hours-day').value) || 8;
            const daysPerMonth = parseFloat(document.getElementById('rate-days-month').value) || 22;

            const totalNeeded = salary + expenses;
            const totalHours = hoursPerDay * daysPerMonth;
            const recommendedRate = totalNeeded / totalHours;

            document.getElementById('rate-result-value').innerText = 'R$ ' + recommendedRate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '/h';
            document.getElementById('rate-total-needed').innerText = totalNeeded.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            document.getElementById('rate-results').classList.remove('hidden');
            showToast('Tarifa recomendada calculada!', 'success');
        });
    }

    // 5. Simulador CLT vs PJ
    const btnCalcCltPj = document.getElementById('btn-calc-clt-pj');
    if (btnCalcCltPj) {
        btnCalcCltPj.addEventListener('click', () => {
            const cltSalary = parseFloat(document.getElementById('clt-salary').value) || 0;
            const cltBenefits = parseFloat(document.getElementById('clt-benefits').value) || 0;
            const pjBilling = parseFloat(document.getElementById('pj-billing').value) || 0;

            // CLT Anual Líquido Estimado: 13.33 salários + benefícios * 12 + FGTS (8% * 12)
            // Desconto médio de impostos/INSS CLT ~18% (fator 0.82)
            const cltAnnualSalaryNet = (cltSalary * 13.33) * 0.82;
            const cltAnnualBenefits = cltBenefits * 12;
            const cltAnnualFgts = cltSalary * 0.08 * 12;
            const totalCltNet = cltAnnualSalaryNet + cltAnnualBenefits + cltAnnualFgts;

            // PJ Anual Líquido Estimado: faturamento * 12 - imposto médio (Simples Nacional 6% + MEI DAS ~960)
            const pjAnnualGross = pjBilling * 12;
            const pjAnnualTaxes = (pjAnnualGross * 0.06) + 960;
            const totalPjNet = pjAnnualGross - pjAnnualTaxes;

            document.getElementById('result-clt-annual').innerText = 'R$ ' + totalCltNet.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            document.getElementById('result-pj-annual').innerText = 'R$ ' + totalPjNet.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const diff = Math.abs(totalPjNet - totalCltNet);
            const diffStr = diff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const compTextEl = document.getElementById('clt-pj-comparison-text');
            if (totalPjNet > totalCltNet) {
                compTextEl.innerHTML = `PJ é mais vantajoso por <span class="color-green">R$ ${diffStr}</span> / ano`;
            } else if (totalCltNet > totalPjNet) {
                compTextEl.innerHTML = `CLT é mais vantajoso por <span style="color: #ef4444;">R$ ${diffStr}</span> / ano`;
            } else {
                compTextEl.innerHTML = `Ambos possuem rendimentos líquidos equivalentes!`;
            }

            document.getElementById('clt-pj-results').classList.remove('hidden');
            showToast('Simulação concluída!', 'success');
        });
    }

    // 6. Botão de Privacidade (Ocultar/Exibir Valores Financeiros)
    const btnTogglePrivacy = document.getElementById('btn-toggle-privacy');
    if (btnTogglePrivacy) {
        btnTogglePrivacy.addEventListener('click', () => {
            state.hideFinancials = !state.hideFinancials;
            localStorage.setItem('hideFinancials', state.hideFinancials ? 'true' : 'false');
            updateHideFinancialsUI();
            applyFilters();
            showToast(state.hideFinancials ? 'Valores financeiros ocultados!' : 'Valores financeiros visíveis!', 'info');
        });
    }
}

async function loadNotes(filterQuery = '') {
    const listContainer = document.getElementById('notes-list-container');
    if (!listContainer) return;

    try {
        const notes = await dbGetAll('notes');
        listContainer.innerHTML = '';

        const filteredNotes = notes.filter(n => {
            if (!filterQuery) return true;
            const q = filterQuery.toLowerCase();
            return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tag.toLowerCase().includes(q);
        });

        if (filteredNotes.length === 0) {
            listContainer.innerHTML = `<p style="font-size: 0.75rem; text-align: center; color: var(--text-secondary); margin: 1rem 0;">${filterQuery ? 'Nenhuma nota encontrada.' : 'Nenhuma nota criada ainda.'}</p>`;
            return;
        }

        // Ordenar notas por data de atualização (mais recentes primeiro)
        filteredNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

        filteredNotes.forEach(n => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.padding = '0.75rem';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '0.25rem';
            card.style.border = '1px solid rgba(255,255,255,0.06)';
            card.style.background = 'rgba(255,255,255,0.01)';
            card.style.cursor = 'pointer';

            let tagColor = '#06b6d4'; // Trabalho
            if (n.tag === 'Pessoal') tagColor = '#10b981';
            else if (n.tag === 'Ideias') tagColor = '#f59e0b';
            else if (n.tag === 'Lembrete') tagColor = '#8b5cf6';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 0.8rem; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">${n.title}</strong>
                    <span style="font-size: 0.6rem; padding: 0.1rem 0.35rem; border-radius: 10px; font-weight: bold; background: ${tagColor}22; color: ${tagColor}; border: 1px solid ${tagColor}44;">${n.tag}</span>
                </div>
                <p style="font-size: 0.7rem; color: var(--text-secondary); margin: 0.25rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;">${n.content}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; font-size: 0.6rem; color: var(--text-secondary);">
                    <span>${new Date(n.updatedAt).toLocaleDateString()}</span>
                    <button class="btn-delete-note" data-id="${n.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 5px;" title="Excluir Nota">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;

            // Clique para carregar na edição
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete-note')) return;

                document.getElementById('note-id').value = n.id;
                document.getElementById('note-title').value = n.title;
                document.getElementById('note-tag').value = n.tag;
                document.getElementById('note-content').value = n.content;

                document.getElementById('btn-clear-note').classList.remove('hidden');
                document.getElementById('note-title').focus();
            });

            // Clique para deletar
            const delBtn = card.querySelector('.btn-delete-note');
            delBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm('Deseja realmente excluir esta nota?')) return;
                try {
                    const tx = db.transaction('notes', 'readwrite');
                    tx.objectStore('notes').delete(n.id);
                    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
                    showToast('Nota excluída!', 'success');
                    loadNotes(document.getElementById('search-notepad').value);
                    
                    // Disparar sincronização na nuvem
                    localStorage.setItem('needs_sync', 'true');
                    triggerAutoSync();
                } catch (err) {
                    console.error('[NOTES-DELETE]', err);
                    showToast('Erro ao excluir nota!', 'error');
                }
            });

            listContainer.appendChild(card);
        });
    } catch (err) {
        console.error('[NOTES-LOAD]', err);
    }
}

// ==========================================================================
// 30 NOVAS FUNCIONALIDADES - IMPLEMENTAÇÃO COMPLETA
// ==========================================================================

// ====== FEAT #1: Live Work Timer (Timer ao vivo de horas trabalhadas hoje) ======
let liveWorkTimerInterval = null;
function startLiveWorkTimer() {
    if (liveWorkTimerInterval) clearInterval(liveWorkTimerInterval);
    liveWorkTimerInterval = setInterval(updateLiveWorkTimer, 10000);
    updateLiveWorkTimer();
}
function updateLiveWorkTimer() {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    const todayRow = state.rows.find(r => r.date === todayStr);
    const timerDiv = document.getElementById('live-work-timer');
    const timerVal = document.getElementById('live-work-timer-val');
    if (!timerDiv || !timerVal) return;
    if (!todayRow || !todayRow.entrada1) { timerDiv.style.display = 'none'; return; }

    const nowMin = now.getHours() * 60 + now.getMinutes();
    let worked = 0;
    const toMin = (t) => { if (!t) return null; const p = t.split(':'); return parseInt(p[0])*60 + parseInt(p[1]); };
    const e1 = toMin(todayRow.entrada1), s1 = toMin(todayRow.saida1);
    const e2 = toMin(todayRow.entrada2), s2 = toMin(todayRow.saida2);

    if (e1 !== null) worked += (s1 !== null ? s1 : nowMin) - e1;
    if (e2 !== null) worked += (s2 !== null ? s2 : nowMin) - e2;
    worked = Math.max(0, worked);

    timerDiv.style.display = 'block';
    timerVal.innerText = formatMinutesToHoursStr(worked);
}

// ====== FEAT #2-#8: Extra KPI cards - Streak, Dias Trabalhados, Melhor Dia, Média Horas ======
function renderExtraKPIs() {
    const monthRows = state.filteredRows.filter(r => r.minutosTrabalhados > 0);
    const daysWorked = monthRows.length;
    const el_dw = document.getElementById('kpi-days-worked');
    if (el_dw) el_dw.innerText = `${daysWorked} dia${daysWorked !== 1 ? 's' : ''}`;

    // Best day of month
    let bestDay = null;
    monthRows.forEach(r => { if (!bestDay || r.ganhos > bestDay.ganhos) bestDay = r; });
    const el_bd = document.getElementById('kpi-best-day');
    const el_bdl = document.getElementById('kpi-best-day-label');
    if (el_bd) el_bd.innerText = bestDay ? formatCurrency(bestDay.ganhos) : 'R$ 0,00';
    if (el_bdl && bestDay) {
        const dp = parseDateParts(bestDay.date);
        el_bdl.innerText = `${String(dp.day).padStart(2,'0')}/${String(dp.month+1).padStart(2,'0')} - ${bestDay.horasMinutos}`;
    }

    // Average hours per day
    const avgMin = daysWorked > 0 ? Math.round(monthRows.reduce((s,r) => s+r.minutosTrabalhados, 0)/daysWorked) : 0;
    const el_ah = document.getElementById('kpi-avg-hours');
    if (el_ah) el_ah.innerText = formatMinutesToHoursStr(avgMin);

    // Streak of consecutive working days
    const streak = calculateStreak();
    const el_str = document.getElementById('kpi-streak');
    const el_strs = document.getElementById('kpi-streak-subtitle');
    if (el_str) el_str.innerText = `${streak} dia${streak !== 1 ? 's' : ''}`;
    if (el_strs) el_strs.innerText = streak > 0 ? `🔥 Sequência ativa!` : 'Sem sequência ativa';
}

function calculateStreak() {
    const sorted = [...state.rows].filter(r => r.minutosTrabalhados > 0).sort((a,b) => b.date.localeCompare(a.date));
    if (!sorted.length) return 0;
    let streak = 0;
    let prev = null;
    for (const row of sorted) {
        const d = new Date(row.date + 'T00:00:00');
        if (!prev) { streak = 1; prev = d; continue; }
        const diff = (prev - d) / (1000 * 60 * 60 * 24);
        if (diff === 1 || (diff === 2 && isSunday(d))) { streak++; prev = d; }
        else if (diff === 0) continue;
        else break;
    }
    return streak;
}
function isSunday(d) { return d.getDay() === 0; }

// ====== FEAT #9: Daily Tips ======
const dailyTips = [
    "Registre seus horários logo ao entrar e sair do trabalho para manter a precisão.",
    "Separe 20% de cada pagamento recebido para investimentos automáticos.",
    "Revise seus gastos fixos mensalmente — pequenas economias acumulam muito.",
    "Use o Pomodoro para aumentar sua produtividade: 25 min de foco + 5 min de pausa.",
    "Mantenha um fundo de emergência de pelo menos 3 meses de despesas.",
    "Diversifique seus investimentos: Tesouro Direto, CDB, FIIs e ações.",
    "Negocie sua taxa horária pelo menos 1x por ano com base no mercado.",
    "Como PJ, lembre-se de separar 15-27% para impostos antes de gastar.",
    "Configure o backup automático no Google Drive para nunca perder dados.",
    "Analise seu dia da semana mais produtivo e priorize reuniões nesse dia.",
    "Horas extras não registradas são dinheiro perdido. Bata o ponto sempre!",
    "A inadimplência corrói seu caixa. Controle os recebimentos pendentes.",
    "Defina metas mensais claras para ter um norte no seu trabalho autônomo.",
    "Invista em cursos e capacitação — isso aumenta sua taxa horária.",
    "Mantenha contratos atualizados com todos os seus clientes.",
    "Revise periodicamente o relatório de horas para identificar padrões.",
    "Um controle financeiro rigoroso é a base de qualquer negócio saudável.",
    "Registre despesas no mesmo dia para não esquecer pequenos gastos.",
    "Considere abrir MEI para reduzir a carga tributária nas suas prestações.",
    "Use a calculadora de break-even para saber qual o mínimo que precisa faturar.",
    "Sempre peça recibo ou nota fiscal pelos serviços que você presta.",
    "Dinheiro parado em conta corrente perde valor. Invista o excedente!",
    "Crie templates de horário para os dias padronizados e economize tempo.",
    "Compare sua situação mês a mês para identificar crescimento.",
    "Seja pontual nos seus compromissos — reputação vale mais que taxa horária.",
    "Configure alertas de vencimento para nunca pagar multa por atraso.",
    "Documente todas as suas entregas e acordos com clientes por escrito.",
    "A saúde financeira começa pelo controle do que entra e do que sai.",
    "Revise sua meta mensal a cada trimestre baseado no seu ritmo real.",
    "Horas de trajeto também têm valor. Considere isso ao negociar contratos."
];

function loadDailyTip() {
    const el = document.getElementById('daily-tip');
    if (!el) return;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000*60*60*24));
    el.innerText = dailyTips[dayOfYear % dailyTips.length];
}

// ====== FEAT #9b: Weekly Summary ======
function renderWeeklySummary() {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    const refDate = todayStr;
    const weekDays = getDaysOfCurrentWeek(refDate);
    const weekRows = state.rows.filter(r => weekDays.includes(r.date));
    const wkMins = weekRows.reduce((s,r) => s+r.minutosTrabalhados, 0);
    const wkEarnings = weekRows.reduce((s,r) => s+r.ganhos, 0);
    const wkDays = weekRows.filter(r => r.minutosTrabalhados > 0).length;

    const elH = document.getElementById('wk-hours');
    const elE = document.getElementById('wk-earnings');
    const elD = document.getElementById('wk-days');
    if (elH) elH.innerText = formatMinutesToHoursStr(wkMins);
    if (elE) elE.innerText = formatCurrency(wkEarnings);
    if (elD) elD.innerText = `${wkDays} dia${wkDays !== 1 ? 's' : ''}`;
}

// ====== FEAT #10: Day Intensity Indicator ======
function renderDayIntensity() {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    const todayRow = state.rows.find(r => r.date === todayStr);
    const mins = todayRow ? todayRow.minutosTrabalhados : 0;

    const emoji = document.getElementById('intensity-emoji');
    const label = document.getElementById('intensity-label');
    const desc = document.getElementById('intensity-desc');
    if (!emoji) return;

    if (mins === 0) {
        emoji.innerText = '😴'; label.innerText = 'Sem Registro'; desc.innerText = 'Nenhuma hora registrada hoje.';
    } else if (mins < 240) {
        emoji.innerText = '🌤️'; label.innerText = 'Dia Leve'; desc.innerText = `${formatMinutesToHoursStr(mins)} registradas — menos de 4h.`;
    } else if (mins < 480) {
        emoji.innerText = '💪'; label.innerText = 'Dia Normal'; desc.innerText = `${formatMinutesToHoursStr(mins)} registradas — ótimo ritmo!`;
    } else {
        emoji.innerText = '🔥'; label.innerText = 'Dia Intenso'; desc.innerText = `${formatMinutesToHoursStr(mins)} registradas — dia pesado! Descanse bem.`;
    }

    // Weekly goal alert
    const weeklyGoal = parseFloat(localStorage.getItem('weeklyHoursGoal') || '40');
    const now2 = new Date();
    const weekDays = getDaysOfCurrentWeek(todayStr);
    const wkMins = state.rows.filter(r => weekDays.includes(r.date)).reduce((s,r) => s+r.minutosTrabalhados, 0);
    const dayOfWeek = now2.getDay(); // 0=Sun
    const remainingDays = Math.max(0, 5 - (dayOfWeek === 0 ? 5 : dayOfWeek));
    const needed = weeklyGoal * 60 - wkMins;
    const alertEl = document.getElementById('weekly-goal-alert');
    if (alertEl) {
        if (needed > 0 && remainingDays <= 1 && needed > 120) {
            alertEl.style.display = 'block';
        } else {
            alertEl.style.display = 'none';
        }
    }
}

// ====== FEAT #11: Achievement Badges ======
function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    const daysWorked = state.filteredRows.filter(r => r.minutosTrabalhados > 0).length;
    const totalEarnings = state.totalEarningsSinceJan;
    const streak = calculateStreak();
    const totalDays = state.rows.filter(r => r.minutosTrabalhados > 0).length;

    const badges = [
        { icon: '🎯', label: 'Primeiro Ponto', desc: 'Primeiro registro de ponto', unlocked: totalDays >= 1 },
        { icon: '📅', label: '7 Dias Seguidos', desc: 'Sequência de 7 dias', unlocked: streak >= 7 },
        { icon: '💰', label: 'R$ 1.000 Ganhos', desc: 'Alcançou R$ 1.000 no ano', unlocked: totalEarnings >= 1000 },
        { icon: '⭐', label: 'R$ 5.000 Ganhos', desc: 'Alcançou R$ 5.000 no ano', unlocked: totalEarnings >= 5000 },
        { icon: '🏆', label: 'R$ 10.000 Ganhos', desc: 'Alcançou R$ 10.000 no ano', unlocked: totalEarnings >= 10000 },
        { icon: '📆', label: '20 Dias no Mês', desc: '20+ dias trabalhados no mês', unlocked: daysWorked >= 20 },
        { icon: '🔥', label: 'Streak 30 dias', desc: 'Sequência de 30 dias', unlocked: streak >= 30 },
        { icon: '💎', label: 'R$ 50.000 Ganhos', desc: 'Faturamento anual de R$ 50k', unlocked: totalEarnings >= 50000 },
    ];

    grid.innerHTML = badges.map(b => `
        <div title="${b.desc}" style="display:flex; flex-direction:column; align-items:center; gap:0.25rem; padding:0.75rem; border-radius:12px; background:${b.unlocked ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${b.unlocked ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}; min-width:70px; opacity:${b.unlocked ? 1 : 0.4};">
            <span style="font-size:1.5rem;">${b.icon}</span>
            <span style="font-size:0.62rem; text-align:center; color:${b.unlocked ? '#fff' : 'var(--text-secondary)'}; font-weight:${b.unlocked ? 600 : 400};">${b.label}</span>
            ${b.unlocked ? '<span style="font-size:0.55rem; color:#10b981;">✓ Desbloqueada</span>' : '<span style="font-size:0.55rem; color:var(--text-secondary);">Bloqueada</span>'}
        </div>
    `).join('');
}

// ====== FEAT #12: National Holidays 2026 ======
const HOLIDAYS_2026 = [
    { date: '2026-01-01', name: 'Ano Novo' },
    { date: '2026-02-16', name: 'Carnaval' },
    { date: '2026-04-03', name: 'Sexta-feira Santa' },
    { date: '2026-04-21', name: 'Tiradentes' },
    { date: '2026-05-01', name: 'Dia do Trabalho' },
    { date: '2026-06-04', name: 'Corpus Christi' },
    { date: '2026-09-07', name: 'Independência' },
    { date: '2026-10-12', name: 'N.S. Aparecida' },
    { date: '2026-11-02', name: 'Finados' },
    { date: '2026-11-15', name: 'Proclamação República' },
    { date: '2026-12-25', name: 'Natal' },
];

function renderHolidaysList() {
    const el = document.getElementById('holidays-list');
    if (!el) return;
    const today = new Date().toISOString().slice(0,10);
    el.innerHTML = HOLIDAYS_2026.map(h => {
        const isPast = h.date < today;
        const dp = h.date.split('-');
        return `<button onclick="markHolidayOnCalendar('${h.date}', '${h.name}')" style="padding:0.3rem 0.6rem; border-radius:20px; font-size:0.7rem; border:1px solid rgba(255,255,255,0.12); background:${isPast ? 'rgba(255,255,255,0.03)' : 'rgba(245,158,11,0.1)'}; color:${isPast ? 'var(--text-secondary)' : '#f59e0b'}; cursor:pointer; transition:all 0.2s;" title="Marcar ${h.name} no registro">
            ${isPast ? '✓' : '📅'} ${dp[2]}/${dp[1]} — ${h.name}
        </button>`;
    }).join('');
}

window.markHolidayOnCalendar = async function(dateStr, name) {
    const existing = state.rows.find(r => r.date === dateStr);
    if (existing) {
        showToast(`${name} já existe no histórico.`, 'info');
        return;
    }
    const d = new Date(dateStr + 'T00:00:00');
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const newRow = {
        rowNum: Date.now(),
        date: dateStr,
        weekday: weekdays[d.getDay()],
        entrada1: '', saida1: '', entrada2: '', saida2: '',
        saidaCasa: '', chegadaCasa: '',
        observacoes: `🎉 Feriado: ${name}`,
        valorHora: '',
        ganhosManuais: 0,
        statusPagamento: 'Pago',
        ganhos: 0, minutosTrabalhados: 0, horasMinutos: '0:00', horasFracionarias: 0,
        tempoTrajeto: '0:00', minutosTrajeto: 0, tempoForaCasa: '0:00', minutosForaCasa: 0
    };
    await dbPut('rows', newRow);
    state.rows.push(newRow);
    state.rows.sort((a,b) => a.date.localeCompare(b.date));
    applyFilters();
    logActivity(`Feriado "${name}" marcado em ${dateStr}`);
    showToast(`✅ Feriado "${name}" adicionado ao histórico!`, 'success');
};

// ====== FEAT #13: Schedule Templates ======
window.applyScheduleTemplate = async function(e1, s1, e2, s2) {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    let todayRow = state.rows.find(r => r.date === todayStr);
    if (!todayRow) {
        const weekdays = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
        todayRow = {
            rowNum: Date.now(), date: todayStr, weekday: weekdays[now.getDay()],
            entrada1: '', saida1: '', entrada2: '', saida2: '',
            saidaCasa: '', chegadaCasa: '', observacoes: '', valorHora: '',
            ganhosManuais: null, statusPagamento: 'Pendente',
            ganhos: 0, minutosTrabalhados: 0, horasMinutos: '0:00', horasFracionarias: 0,
            tempoTrajeto: '0:00', minutosTrajeto: 0, tempoForaCasa: '0:00', minutosForaCasa: 0
        };
        state.rows.push(todayRow);
    }
    todayRow.entrada1 = e1; todayRow.saida1 = s1; todayRow.entrada2 = e2; todayRow.saida2 = s2;
    recalcRow(todayRow, state.globalRate);
    await dbPut('rows', todayRow);
    state.totalEarningsSinceJan = state.rows.reduce((s,r) => s+r.ganhos, 0);
    state.pendingEarnings = state.rows.filter(r => r.statusPagamento !== 'Pago').reduce((s,r) => s+r.ganhos, 0);
    applyFilters();
    logActivity(`Template aplicado: ${e1}→${s1} / ${e2}→${s2}`);
    showToast(`✅ Horário template ${e1}–${s1} / ${e2 || '--'}–${s2 || '--'} aplicado para hoje!`, 'success');
};

// ====== FEAT #14: Weekly Expenses Breakdown ======
function renderWeeklyExpensesBreakdown() {
    const el = document.getElementById('weekly-expenses-breakdown');
    if (!el) return;
    const year = state.selectedYear;
    const month = state.selectedMonth;
    const weeks = [[], [], [], [], []];
    state.filteredFinanceEntries.filter(e => ['Despesa Fixa','Despesa Variável','Gastos Cartão'].includes(e.type)).forEach(e => {
        const dp = parseDateParts(e.date);
        const weekNum = Math.min(4, Math.floor((dp.day - 1) / 7));
        weeks[weekNum].push(e);
    });
    el.innerHTML = weeks.map((w, i) => {
        const total = w.reduce((s, e) => s + e.amount, 0);
        if (total === 0) return '';
        const barWidth = Math.min(100, (total / 2000) * 100);
        return `<div style="display:flex; align-items:center; gap:0.75rem; font-size:0.78rem;">
            <span style="width:55px; color:var(--text-secondary); flex-shrink:0;">Sem. ${i+1}</span>
            <div style="flex-grow:1; height:8px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden;">
                <div style="width:${barWidth}%; height:100%; background:linear-gradient(90deg,#3b82f6,#8b5cf6); border-radius:4px;"></div>
            </div>
            <span style="color:#ef4444; white-space:nowrap; width:75px; text-align:right;">${formatCurrency(total)}</span>
        </div>`;
    }).join('');
    if (!el.innerHTML.trim()) el.innerHTML = '<div style="color:var(--text-secondary); font-size:0.78rem;">Nenhuma despesa registrada neste mês.</div>';
}

// ====== FEAT #15: Due Dates / Alertas de Vencimento ======
function initDueDates() {
    const btn = document.getElementById('btn-add-due');
    if (!btn) return;
    btn.addEventListener('click', addDueItem);
    renderDueItems();
}

function addDueItem() {
    const name = document.getElementById('due-item-name')?.value?.trim();
    const date = document.getElementById('due-item-date')?.value;
    if (!name || !date) { showToast('Preencha nome e data de vencimento.', 'warning'); return; }
    const items = JSON.parse(localStorage.getItem('due_items') || '[]');
    items.push({ id: generateId(), name, date });
    localStorage.setItem('due_items', JSON.stringify(items));
    document.getElementById('due-item-name').value = '';
    document.getElementById('due-item-date').value = '';
    renderDueItems();
    logActivity(`Vencimento adicionado: ${name} em ${date}`);
    showToast(`✅ Alerta de vencimento para "${name}" salvo!`, 'success');
}

function renderDueItems() {
    const el = document.getElementById('due-items-list');
    if (!el) return;
    const items = JSON.parse(localStorage.getItem('due_items') || '[]');
    const today = new Date().toISOString().slice(0,10);
    if (!items.length) { el.innerHTML = '<div style="font-size:0.75rem; color:var(--text-secondary);">Nenhum vencimento cadastrado.</div>'; return; }
    el.innerHTML = items.sort((a,b) => a.date.localeCompare(b.date)).map(item => {
        const dp = item.date.split('-');
        const daysLeft = Math.ceil((new Date(item.date+'T00:00:00') - new Date()) / (1000*60*60*24));
        const isOverdue = daysLeft < 0;
        const isUrgent = daysLeft >= 0 && daysLeft <= 3;
        const color = isOverdue ? '#ef4444' : (isUrgent ? '#f59e0b' : '#10b981');
        return `<div style="display:flex; align-items:center; gap:0.75rem; padding:0.5rem; background:rgba(255,255,255,0.03); border-radius:8px; border-left:3px solid ${color}; font-size:0.78rem;">
            <i class="fa-solid fa-bell" style="color:${color};"></i>
            <div style="flex-grow:1;"><strong style="color:#fff;">${item.name}</strong><br><span style="color:var(--text-secondary);">${dp[2]}/${dp[1]}/${dp[0]} — ${isOverdue ? 'VENCIDO' : (daysLeft === 0 ? 'HOJE!' : `em ${daysLeft} dia${daysLeft>1?'s':''}`)}</span></div>
            <button onclick="removeDueItem('${item.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.8rem;"><i class="fa-solid fa-xmark"></i></button>
        </div>`;
    }).join('');
}

window.removeDueItem = function(id) {
    let items = JSON.parse(localStorage.getItem('due_items') || '[]');
    items = items.filter(i => i.id !== id);
    localStorage.setItem('due_items', JSON.stringify(items));
    renderDueItems();
};

// ====== FEAT #16: Month Comparison ======
function renderMonthComparison() {
    const curM = state.selectedMonth;
    const curY = state.selectedYear;
    const prevM = curM === 0 ? 11 : curM - 1;
    const prevY = curM === 0 ? curY - 1 : curY;

    const curRows = state.rows.filter(r => { const d = parseDateParts(r.date); return d.month === curM && d.year === curY; });
    const prevRows = state.rows.filter(r => { const d = parseDateParts(r.date); return d.month === prevM && d.year === prevY; });
    const curFin = state.financeEntries.filter(r => { const d = parseDateParts(r.date); return d.month === curM && d.year === curY; });
    const prevFin = state.financeEntries.filter(r => { const d = parseDateParts(r.date); return d.month === prevM && d.year === prevY; });

    const curIncome = curRows.reduce((s,r) => s+r.ganhos, 0);
    const prevIncome = prevRows.reduce((s,r) => s+r.ganhos, 0);
    const curExpense = curFin.filter(e => e.type !== 'Ganho Extra').reduce((s,e) => s+e.amount, 0);
    const prevExpense = prevFin.filter(e => e.type !== 'Ganho Extra').reduce((s,e) => s+e.amount, 0);

    const elCI = document.getElementById('compare-curr-income');
    const elPI = document.getElementById('compare-prev-income');
    const elCE = document.getElementById('compare-curr-expense');
    const elPE = document.getElementById('compare-prev-expense');
    const elDelta = document.getElementById('compare-delta-text');
    if (elCI) elCI.innerText = formatCurrency(curIncome);
    if (elPI) elPI.innerText = formatCurrency(prevIncome);
    if (elCE) elCE.innerText = `Despesas: ${formatCurrency(curExpense)}`;
    if (elPE) elPE.innerText = `Despesas: ${formatCurrency(prevExpense)}`;
    if (elDelta) {
        const delta = curIncome - prevIncome;
        const sign = delta >= 0 ? '+' : '';
        const color = delta >= 0 ? '#10b981' : '#ef4444';
        elDelta.innerHTML = `<span style="color:${color};">${sign}${formatCurrency(delta)}</span> em relação ao mês anterior`;
    }
}

// ====== FEAT #17: Theme Toggle ======
function initThemeToggle() {
    const btnDark = document.getElementById('btn-theme-dark');
    const btnLight = document.getElementById('btn-theme-light');
    if (btnDark) btnDark.addEventListener('click', () => {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        localStorage.setItem('app_theme', 'dark');
        showToast('Modo escuro ativado!', 'success');
    });
    if (btnLight) btnLight.addEventListener('click', () => {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('app_theme', 'light');
        showToast('Modo claro ativado!', 'success');
    });
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
}

// ====== FEAT #18: Weekly Hours Goal ======
function initWeeklyHoursGoal() {
    const input = document.getElementById('input-weekly-hours-goal');
    const btn = document.getElementById('btn-save-weekly-goal');
    if (!input || !btn) return;
    const saved = localStorage.getItem('weeklyHoursGoal') || '40';
    input.value = saved;
    btn.addEventListener('click', () => {
        const val = parseFloat(input.value) || 40;
        localStorage.setItem('weeklyHoursGoal', String(val));
        showToast(`Meta semanal de ${val}h salva!`, 'success');
        renderDayIntensity();
        logActivity(`Meta semanal configurada: ${val}h/semana`);
    });
}

// ====== FEAT #19: Pomodoro Timer ======
let pomodoroInterval = null;
let pomodoroSecondsLeft = 25 * 60;
let pomodoroRunning = false;
let pomodoroSessions = 0;
let pomodoroPhase = 'focus'; // 'focus' | 'break'

function initPomodoro() {
    const btnStart = document.getElementById('btn-pomodoro-start');
    const btnReset = document.getElementById('btn-pomodoro-reset');
    if (!btnStart || !btnReset) return;
    btnStart.addEventListener('click', togglePomodoro);
    btnReset.addEventListener('click', resetPomodoro);
}

function togglePomodoro() {
    if (pomodoroRunning) {
        clearInterval(pomodoroInterval);
        pomodoroRunning = false;
        document.getElementById('btn-pomodoro-start').innerHTML = '<i class="fa-solid fa-play"></i> Retomar';
    } else {
        pomodoroRunning = true;
        document.getElementById('btn-pomodoro-start').innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
        pomodoroInterval = setInterval(() => {
            pomodoroSecondsLeft--;
            updatePomodoroDisplay();
            if (pomodoroSecondsLeft <= 0) {
                clearInterval(pomodoroInterval);
                pomodoroRunning = false;
                if (pomodoroPhase === 'focus') {
                    pomodoroSessions++;
                    document.getElementById('pomodoro-sessions').innerText = pomodoroSessions;
                    pomodoroPhase = 'break';
                    pomodoroSecondsLeft = 5 * 60;
                    document.getElementById('pomodoro-phase').innerText = '☕ Pausa — Descanse 5 min';
                    showToast('🍅 Sessão Pomodoro concluída! Faça uma pausa de 5 min.', 'success');
                } else {
                    pomodoroPhase = 'focus';
                    pomodoroSecondsLeft = 25 * 60;
                    document.getElementById('pomodoro-phase').innerText = `🍅 Foco — Sessão ${pomodoroSessions + 1}`;
                    showToast('☕ Pausa encerrada! Hora de focar novamente.', 'info');
                }
                document.getElementById('btn-pomodoro-start').innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
                updatePomodoroDisplay();
                logActivity(`Pomodoro: ${pomodoroPhase === 'break' ? 'sessão concluída' : 'pausa encerrada'}`);
            }
        }, 1000);
    }
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
    pomodoroSecondsLeft = 25 * 60;
    pomodoroPhase = 'focus';
    document.getElementById('btn-pomodoro-start').innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
    document.getElementById('pomodoro-phase').innerText = `🍅 Foco — Sessão ${pomodoroSessions + 1}`;
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const m = Math.floor(pomodoroSecondsLeft / 60);
    const s = pomodoroSecondsLeft % 60;
    const el = document.getElementById('pomodoro-display');
    if (el) el.innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ====== FEAT #20: INSS / IR Calculator ======
function initINSSCalculator() {
    const btn = document.getElementById('btn-calc-inss');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const income = parseFloat(document.getElementById('inss-income')?.value) || 0;
        const type = document.getElementById('inss-type')?.value;
        let inss = 0, ir = 0;
        if (type === 'mei') {
            inss = 75.90;
        } else if (type === 'simples') {
            // Simples Nacional faixa 1: 6% até R$ 180k/ano
            inss = income * 0.06;
        } else {
            // Autônomo: 20% INSS teto máx R$ 908 (2026 aprox)
            inss = Math.min(income * 0.20, 908);
            // IR progressivo simplificado
            const base = income - inss;
            if (base <= 2824) ir = 0;
            else if (base <= 3751) ir = base * 0.075 - 211.30;
            else if (base <= 4664) ir = base * 0.15 - 422.60;
            else if (base <= 5675) ir = base * 0.225 - 769.70;
            else ir = base * 0.275 - 1053.55;
            ir = Math.max(0, ir);
        }
        const net = income - inss - ir;
        document.getElementById('res-inss').innerText = formatCurrency(inss);
        document.getElementById('res-ir').innerText = formatCurrency(ir);
        document.getElementById('res-inss-net').innerText = formatCurrency(net);
        document.getElementById('inss-results').classList.remove('hidden');
        logActivity(`INSS/IR calculado: bruto ${formatCurrency(income)}, líquido ${formatCurrency(net)}`);
    });
}

// ====== FEAT #21: Overtime Calculator ======
function initOvertimeCalculator() {
    const btn = document.getElementById('btn-calc-ot');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const base = parseFloat(document.getElementById('ot-base-rate')?.value) || 0;
        const hours = parseFloat(document.getElementById('ot-hours')?.value) || 0;
        const pct = parseFloat(document.getElementById('ot-percent')?.value) || 50;
        const otRate = base * (1 + pct/100);
        const total = otRate * hours;
        document.getElementById('res-ot-rate').innerText = `${formatCurrency(otRate)}/h`;
        document.getElementById('res-ot-total').innerText = formatCurrency(total);
        document.getElementById('ot-results').classList.remove('hidden');
        logActivity(`Horas extras calculadas: ${hours}h × ${formatCurrency(otRate)}/h = ${formatCurrency(total)}`);
    });
}

// ====== FEAT #22: CLT Resignation Calculator ======
function initRescisaoCalculator() {
    const btn = document.getElementById('btn-calc-rescisao');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const salary = parseFloat(document.getElementById('res-salary')?.value) || 0;
        const months = parseFloat(document.getElementById('res-months')?.value) || 0;
        const type = document.getElementById('res-type')?.value;
        const years = months / 12;
        const curMonth = new Date().getMonth() + 1;
        const workDaysLeft = Math.max(0, 30 - new Date().getDate());

        // Saldo de salário (dias restantes do mês)
        const saldo = (salary / 30) * workDaysLeft;
        // 13º proporcional
        const decimo = (salary / 12) * (curMonth);
        // Férias proporcionais + 1/3
        const feriasMeses = Math.floor(months % 12);
        const ferias = (salary / 12) * feriasMeses * (4/3);
        // Aviso prévio (30 dias + 3 por ano, máx 90)
        const avisoDias = Math.min(90, 30 + Math.floor(years) * 3);
        const aviso = type === 'sem-justa-causa' ? (salary / 30) * avisoDias : 0;
        // FGTS + multa 40%
        const fgts = type === 'sem-justa-causa' ? salary * 0.08 * months * 1.40 : 0;

        let total = 0;
        if (type === 'justa-causa') {
            total = saldo; // Apenas saldo de salário
        } else if (type === 'pedido-demissao') {
            total = saldo + decimo + ferias;
        } else {
            total = saldo + decimo + ferias + aviso + fgts;
        }

        document.getElementById('res-saldo').innerText = formatCurrency(saldo);
        document.getElementById('res-decimo').innerText = formatCurrency(decimo);
        document.getElementById('res-ferias').innerText = formatCurrency(ferias);
        document.getElementById('res-aviso').innerText = formatCurrency(aviso);
        document.getElementById('res-fgts').innerText = formatCurrency(fgts);
        document.getElementById('res-total').innerText = formatCurrency(total);
        document.getElementById('rescisao-results').classList.remove('hidden');
        logActivity(`Rescisão calculada: ${months} meses, ${formatCurrency(total)}`);
    });
}

// ====== FEAT #23: Installment Calculator ======
function initInstallmentCalculator() {
    const btn = document.getElementById('btn-calc-parc');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const total = parseFloat(document.getElementById('parc-total')?.value) || 0;
        const n = parseInt(document.getElementById('parc-n')?.value) || 1;
        const rate = parseFloat(document.getElementById('parc-rate')?.value) || 0;
        let parcVal, totalPay, interest;
        if (rate === 0) {
            parcVal = total / n;
            totalPay = total;
            interest = 0;
        } else {
            const r = rate / 100;
            parcVal = total * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
            totalPay = parcVal * n;
            interest = totalPay - total;
        }
        document.getElementById('res-parc-val').innerText = `${formatCurrency(parcVal)}/mês`;
        document.getElementById('res-parc-total').innerText = formatCurrency(totalPay);
        document.getElementById('res-parc-interest').innerText = formatCurrency(interest);
        document.getElementById('parc-results').classList.remove('hidden');
        logActivity(`Parcelamento: ${n}x ${formatCurrency(parcVal)}, total ${formatCurrency(totalPay)}`);
    });
}

// ====== FEAT #24: Share Monthly Summary ======
function initShareSummary() {
    const btn = document.getElementById('btn-gen-share');
    if (!btn) return;
    btn.addEventListener('click', generateShareSummary);
}

function generateShareSummary() {
    const monthName = ptMonths[state.selectedMonth];
    const daysWorked = state.filteredRows.filter(r => r.minutosTrabalhados > 0).length;
    const totalMins = state.filteredRows.reduce((s,r) => s+r.minutosTrabalhados, 0);
    const totalEarnings = state.filteredRows.reduce((s,r) => s+r.ganhos, 0);
    const pendingRows = state.filteredRows.filter(r => r.statusPagamento === 'Pendente');
    const pendingEarnings = pendingRows.reduce((s,r) => s+r.ganhos, 0);

    const text = `📊 *Resumo de ${monthName}/${state.selectedYear}*

⏰ Horas trabalhadas: ${formatMinutesToHoursStr(totalMins)}
📅 Dias trabalhados: ${daysWorked} dias
💰 Ganhos brutos: ${formatCurrency(totalEarnings)}
⏳ Pendente: ${formatCurrency(pendingEarnings)}
✅ Recebido: ${formatCurrency(totalEarnings - pendingEarnings)}

📈 Taxa média/h: ${formatCurrency(totalMins > 0 ? totalEarnings / (totalMins/60) : 0)}/h

_Gerado pelo Controle Premium_ 🚀`;

    const textarea = document.getElementById('share-summary-text');
    const box = document.getElementById('share-summary-box');
    if (textarea) textarea.value = text;
    if (box) box.classList.remove('hidden');
    logActivity(`Resumo mensal gerado para ${monthName}/${state.selectedYear}`);
}

window.copyShareSummary = function() {
    const textarea = document.getElementById('share-summary-text');
    if (!textarea) return;
    navigator.clipboard.writeText(textarea.value)
        .then(() => showToast('✅ Resumo copiado! Cole no WhatsApp ou e-mail.', 'success'))
        .catch(() => {
            textarea.select();
            document.execCommand('copy');
            showToast('✅ Resumo copiado!', 'success');
        });
};

// ====== FEAT #25: Focus Mode ======
let focusModeActive = false;
function initFocusMode() {
    const btn = document.getElementById('btn-focus-mode');
    if (!btn) return;
    btn.addEventListener('click', toggleFocusMode);
}
function toggleFocusMode() {
    focusModeActive = !focusModeActive;
    const btn = document.getElementById('btn-focus-mode');
    const status = document.getElementById('focus-mode-status');
    const elementsToHide = document.querySelectorAll('.chart-container-card, .productivity-heatmap-card, .productivity-projection-card');
    if (focusModeActive) {
        elementsToHide.forEach(el => el.style.display = 'none');
        if (btn) { btn.innerHTML = '<i class="fa-solid fa-eye"></i> Desativar Modo Foco'; btn.style.background = 'rgba(139,92,246,0.2)'; btn.style.borderColor = 'rgba(139,92,246,0.4)'; btn.style.color = '#8b5cf6'; }
        if (status) status.style.display = 'block';
        showToast('Modo Foco ativado — gráficos ocultados.', 'info');
    } else {
        elementsToHide.forEach(el => el.style.display = '');
        if (btn) { btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Ativar Modo Foco'; btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }
        if (status) status.style.display = 'none';
        showToast('Modo Foco desativado.', 'success');
    }
    logActivity(`Modo Foco ${focusModeActive ? 'ativado' : 'desativado'}`);
}

// ====== FEAT #26: Rate Converter (Hora/Dia/Mês) ======
function initRateConverter() {
    const btn = document.getElementById('btn-conv-rate');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const val = parseFloat(document.getElementById('rate-conv-input')?.value) || 0;
        const from = document.getElementById('rate-conv-from')?.value;
        let perHour = val;
        if (from === 'dia') perHour = val / 8;
        else if (from === 'mes') perHour = val / 176;
        const perDay = perHour * 8;
        const perMonth = perHour * 176;
        document.getElementById('res-rate-hora').innerText = `${formatCurrency(perHour)}/h`;
        document.getElementById('res-rate-dia').innerText = `${formatCurrency(perDay)}/dia`;
        document.getElementById('res-rate-mes').innerText = `${formatCurrency(perMonth)}/mês`;
        document.getElementById('rate-conv-results').classList.remove('hidden');
    });
}

// ====== FEAT #27: Copy Yesterday's Schedule ======
function initCopyYesterday() {
    const btn = document.getElementById('btn-copy-yesterday');
    if (!btn) return;
    btn.addEventListener('click', copyYesterdaySchedule);
}

async function copyYesterdaySchedule() {
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    // Find last worked day before today
    const lastWorked = [...state.rows].filter(r => r.date < todayStr && r.minutosTrabalhados > 0)
        .sort((a,b) => b.date.localeCompare(a.date))[0];
    if (!lastWorked) { showToast('Nenhum dia anterior com registros encontrado!', 'warning'); return; }

    const preview = document.getElementById('copy-yesterday-preview');
    if (preview) {
        preview.style.display = 'block';
        preview.innerText = `Copiando de ${lastWorked.date}: ${lastWorked.entrada1 || '--'}→${lastWorked.saida1 || '--'} / ${lastWorked.entrada2 || '--'}→${lastWorked.saida2 || '--'}`;
    }

    await applyScheduleTemplate(lastWorked.entrada1 || '', lastWorked.saida1 || '', lastWorked.entrada2 || '', lastWorked.saida2 || '');
    logActivity(`Horário de ${lastWorked.date} replicado para hoje`);
}

// ====== FEAT #28: Activity Log ======
function logActivity(msg) {
    const logs = JSON.parse(localStorage.getItem('activity_log') || '[]');
    const now = new Date();
    logs.unshift({ time: now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}), date: now.toLocaleDateString('pt-BR'), msg });
    if (logs.length > 50) logs.pop();
    localStorage.setItem('activity_log', JSON.stringify(logs));
    renderActivityLog();
}

function renderActivityLog() {
    const el = document.getElementById('activity-log');
    if (!el) return;
    const logs = JSON.parse(localStorage.getItem('activity_log') || '[]');
    if (!logs.length) {
        el.innerHTML = '<div style="color:var(--text-secondary); text-align:center; padding:0.5rem;">Nenhuma atividade registrada ainda.</div>';
        return;
    }
    el.innerHTML = logs.map(l => `
        <div style="display:flex; gap:0.5rem; align-items:flex-start; padding:0.25rem 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <span style="color:var(--accent-blue); flex-shrink:0; font-size:0.68rem; margin-top:1px;">${l.time}</span>
            <span>${l.msg}</span>
        </div>
    `).join('');
}

window.clearActivityLog = function() {
    localStorage.removeItem('activity_log');
    renderActivityLog();
    showToast('Log de atividades limpo!', 'success');
};

// ====== FEAT #29: Productivity Analysis ======
function renderProductivityAnalysis() {
    const rows = state.rows.filter(r => r.minutosTrabalhados > 0);
    if (!rows.length) return;

    const bestHours = rows.reduce((b,r) => r.minutosTrabalhados > b.minutosTrabalhados ? r : b, rows[0]);
    const worstHours = rows.reduce((b,r) => r.minutosTrabalhados < b.minutosTrabalhados ? r : b, rows[0]);
    const bestEarnings = rows.reduce((b,r) => r.ganhos > b.ganhos ? r : b, rows[0]);

    // Best weekday
    const weekdayTotals = {};
    rows.forEach(r => {
        if (!weekdayTotals[r.weekday]) weekdayTotals[r.weekday] = { mins: 0, count: 0 };
        weekdayTotals[r.weekday].mins += r.minutosTrabalhados;
        weekdayTotals[r.weekday].count++;
    });
    const bestWeekday = Object.entries(weekdayTotals).sort((a,b) => (b[1].mins/b[1].count) - (a[1].mins/a[1].count))[0];

    const fmt = (dateStr) => { const dp = parseDateParts(dateStr); return `${String(dp.day).padStart(2,'0')}/${String(dp.month+1).padStart(2,'0')}`; };
    const el_bd = document.getElementById('prod-best-day');
    const el_wd = document.getElementById('prod-worst-day');
    const el_be = document.getElementById('prod-best-earn');
    const el_bw = document.getElementById('prod-best-weekday');
    if (el_bd) el_bd.innerText = `${fmt(bestHours.date)} (${bestHours.horasMinutos})`;
    if (el_wd) el_wd.innerText = `${fmt(worstHours.date)} (${worstHours.horasMinutos})`;
    if (el_be) el_be.innerText = `${fmt(bestEarnings.date)} (${formatCurrency(bestEarnings.ganhos)})`;
    if (el_bw && bestWeekday) el_bw.innerText = bestWeekday[0].split('-')[0];

    document.getElementById('btn-refresh-prod')?.addEventListener('click', renderProductivityAnalysis);
}

// ====== FEAT #30: Break-even Calculator ======
function initBreakevenCalculator() {
    const btn = document.getElementById('btn-calc-breakeven');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const fixed = parseFloat(document.getElementById('be-fixed-costs')?.value) || 0;
        const rateEl = document.getElementById('be-hourly-rate');
        const rate = parseFloat(rateEl?.value) || state.globalRate || 1;
        const hours = fixed / rate;
        const days = hours / 8;
        document.getElementById('res-be-hours').innerText = `${Math.ceil(hours)}h/mês`;
        document.getElementById('res-be-days').innerText = `Equivale a ${Math.ceil(days)} dias úteis (8h/dia)`;
        document.getElementById('breakeven-results').classList.remove('hidden');
        logActivity(`Break-even: ${Math.ceil(hours)}h/mês para cobrir ${formatCurrency(fixed)}`);
    });
    // Auto-fill hourly rate from state
    const rateEl = document.getElementById('be-hourly-rate');
    if (rateEl && state.globalRate) rateEl.value = state.globalRate;
}

// ====== MAIN INIT - Hook all new features ======
function initAllNewFeatures() {
    // Timers and display
    startLiveWorkTimer();
    loadDailyTip();
    renderHolidaysList();
    renderActivityLog();

    // Tools tab calculators
    initPomodoro();
    initINSSCalculator();
    initOvertimeCalculator();
    initRescisaoCalculator();
    initInstallmentCalculator();
    initShareSummary();
    initFocusMode();
    initRateConverter();
    initCopyYesterday();
    initDueDates();
    initThemeToggle();
    initWeeklyHoursGoal();
    initBreakevenCalculator();

    // Pre-fill hourly rate in break-even
    const beRate = document.getElementById('be-hourly-rate');
    if (beRate && state.globalRate) beRate.value = state.globalRate;
}

// Hook into applyFilters to render new dashboard sections
const _origRenderDashboard = renderDashboard;
renderDashboard = function() {
    _origRenderDashboard();
    // New dashboard features
    renderExtraKPIs();
    renderWeeklySummary();
    renderDayIntensity();
    renderAchievements();
    updateLiveWorkTimer();
};

const _origRenderFinance = renderFinance;
renderFinance = function() {
    _origRenderFinance();
    renderWeeklyExpensesBreakdown();
    renderMonthComparison();
    renderDueItems();
};

// ====== FEAT: Dynamic Color System ======
function initColorSystem() {
    const swatches = document.querySelectorAll('.color-swatch');
    const customPicker = document.getElementById('custom-color-picker');
    
    // Load saved color
    const savedColor = localStorage.getItem('app-color-h');
    const savedCustom = localStorage.getItem('app-color-hex');
    
    function applyColor(h, s, l) {
        document.documentElement.style.setProperty('--color-primary-h', h);
        document.documentElement.style.setProperty('--color-primary-s', s);
        document.documentElement.style.setProperty('--color-primary-l', l);
        localStorage.setItem('app-color-h', h);
        localStorage.setItem('app-color-s', s);
        localStorage.setItem('app-color-l', l);
        localStorage.removeItem('app-color-hex'); // Clear custom hex flag
    }
    
    function applyCustomColor(hex) {
        // Convert hex to HSL for our CSS variables
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
        if (delta == 0) h = 0;
        else if (cmax == r) h = ((g - b) / delta) % 6;
        else if (cmax == g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        applyColor(h, s + '%', l + '%');
        localStorage.setItem('app-color-hex', hex);
    }
    
    // Apply on load
    if (savedCustom) {
        applyCustomColor(savedCustom);
        if (customPicker) customPicker.value = savedCustom;
        swatches.forEach(s => s.classList.remove('active'));
    } else if (savedColor) {
        document.documentElement.style.setProperty('--color-primary-h', savedColor);
        document.documentElement.style.setProperty('--color-primary-s', localStorage.getItem('app-color-s') || '100%');
        document.documentElement.style.setProperty('--color-primary-l', localStorage.getItem('app-color-l') || '60%');
        
        swatches.forEach(s => {
            s.classList.remove('active');
            if (s.dataset.h === savedColor) s.classList.add('active');
        });
    }

    swatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            swatches.forEach(s => s.classList.remove('active'));
            e.target.classList.add('active');
            applyColor(e.target.dataset.h, e.target.dataset.s, e.target.dataset.l);
            showToast('Cor do tema atualizada', 'success');
        });
    });

    if (customPicker) {
        customPicker.addEventListener('input', (e) => {
            swatches.forEach(s => s.classList.remove('active'));
            applyCustomColor(e.target.value);
        });
        customPicker.addEventListener('change', (e) => {
            showToast('Cor customizada aplicada', 'success');
        });
    }
}

// ====== FEAT: Font Size System ======
function initFontSize() {
    const btns = document.querySelectorAll('.font-size-btn');
    const savedSize = localStorage.getItem('app-font-size') || 'md';
    
    function applySize(size) {
        document.body.classList.remove('font-sm', 'font-md', 'font-lg');
        document.body.classList.add(`font-${size}`);
        localStorage.setItem('app-font-size', size);
        
        btns.forEach(b => {
            b.classList.remove('active');
            if (b.dataset.size === size) b.classList.add('active');
        });
    }
    
    applySize(savedSize);
    
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            applySize(e.target.dataset.size);
            showToast('Tamanho da fonte atualizado', 'success');
        });
    });
}

// Initialize on DOM ready - append to existing DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Apply theme and font size ASAP to avoid flicker
    initColorSystem();
    initFontSize();
    
    // Run after main init (slight delay to let state load)
    setTimeout(initAllNewFeatures, 800);
    setTimeout(() => {
        renderProductivityAnalysis();
        // Add break-even rate from state
        const beRate = document.getElementById('be-hourly-rate');
        if (beRate && state.globalRate) beRate.value = state.globalRate;
    }, 1500);
});

// ==========================================================================
// COPILOTO IA PREMIUM & OVERLAYS SYSTEM
// ==========================================================================
window.toggleCopilotOverlay = function() {
    const overlay = document.getElementById('copilot-fullscreen-overlay');
    if (!overlay) return;
    const isActive = overlay.classList.toggle('active');
    if (isActive) {
        window.switchCopilotMobileTab('list');
        setTimeout(() => {
            const input = document.getElementById('copilot-input');
            if (input) input.focus();
        }, 300);
    }
};

window.switchCopilotMobileTab = function(tabName) {
    const btnList = document.getElementById('btn-copilot-mob-list');
    const btnChat = document.getElementById('btn-copilot-mob-chat');
    const sidebar = document.getElementById('copilot-sidebar-pane');
    const chatPane = document.getElementById('copilot-chat-pane');
    
    if (tabName === 'list') {
        if (btnList) btnList.classList.add('active');
        if (btnChat) btnChat.classList.remove('active');
        if (sidebar) sidebar.classList.add('active-mobile-pane');
        if (chatPane) chatPane.classList.remove('active-mobile-pane');
    } else {
        if (btnList) btnList.classList.remove('active');
        if (btnChat) btnChat.classList.add('active');
        if (sidebar) sidebar.classList.remove('active-mobile-pane');
        if (chatPane) chatPane.classList.add('active-mobile-pane');
    }
};

window.updateDailyQuote = async function(force = false) {
    const quoteEl = document.getElementById('daily-message-text');
    if (!quoteEl) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const cachedDate = localStorage.getItem('daily_quote_date');
    const cachedText = localStorage.getItem('daily_quote_text');
    const greetingStr = `Olá, ${state.userName || 'Premium'}! 🌟 `;
    
    if (!force && cachedDate === todayStr && cachedText) {
        quoteEl.innerText = greetingStr + cachedText;
        return;
    }
    
    // Fallback de frases offline refinadas de acordo com idade/gênero
    const offlineQuotes = [
        "A consistência é a chave para o sucesso de longo prazo.",
        "Seu tempo é o ativo mais valioso; invista-o com sabedoria.",
        "Monitore suas horas, controle suas finanças, governe seu destino.",
        "O sucesso não é o destino final, mas o foco diário na jornada.",
        "Menos correria, mais planejamento. O dia rende quando a mente está calma.",
        "Pequenas quantias poupadas hoje constroem grandes impérios amanhã.",
        "A produtividade inteligente supera o esforço exaustivo.",
        "Valorize seu descanso tanto quanto valoriza o seu trabalho.",
        "Não conte as horas; faça as horas contarem.",
        "O controle financeiro traz a liberdade que o dinheiro não compra."
    ];
    
    let quote = "";
    
    if (state.geminiKey && window.callGeminiAPI && navigator.onLine) {
        try {
            quoteEl.innerText = greetingStr + '"Pensando em um insight personalizado..."';
            const prompt = `Gere uma única frase curta e altamente inspiradora de motivação profissional ou inteligência financeira direcionada para o profissional ${state.userName || 'Premium'}, que tem ${state.userAge || 30} anos. Retorne apenas a frase direta (máximo de 20 palavras), sem introduções ou observações.`;
            const res = await window.callGeminiAPI(prompt);
            quote = res.trim();
            if (quote.startsWith('"') && quote.endsWith('"')) {
                // manter aspas
            } else {
                quote = `"${quote}"`;
            }
        } catch (e) {
            console.warn("Erro ao buscar quote da API Gemini: ", e);
            const idx = Math.floor(Math.random() * offlineQuotes.length);
            quote = `"${offlineQuotes[idx]}"`;
        }
    } else {
        const idx = Math.floor(Math.random() * offlineQuotes.length);
        quote = `"${offlineQuotes[idx]}"`;
    }
    
    localStorage.setItem('daily_quote_date', todayStr);
    localStorage.setItem('daily_quote_text', quote);
    quoteEl.innerText = greetingStr + quote;
};

window.triggerDailyMessageManual = function() {
    window.updateDailyQuote(true);
    showToast("Frase do dia atualizada!", "info");
};

// Inicialização de novos recursos do app
window.initAllNewFeatures = function() {
    window.updateDailyQuote(false);
    
    // Fechar overlay clicando fora ou com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('copilot-fullscreen-overlay');
            if (overlay && overlay.classList.contains('active')) {
                window.toggleCopilotOverlay();
            }
        }
    });

    // Carregar parâmetros de Automação de Trajetos
    const savedAutoCommute = localStorage.getItem('autoCommute');
    if (savedAutoCommute) {
        try {
            state.autoCommute = JSON.parse(savedAutoCommute);
            setTimeout(() => {
                const chk = document.getElementById('chk-auto-commute-gps');
                const home = document.getElementById('commute-home-coords');
                const work = document.getElementById('commute-work-coords');
                const wifi = document.getElementById('commute-work-wifi');
                
                if (chk && state.autoCommute) {
                    chk.checked = true;
                    const configPanel = document.getElementById('gps-commute-config');
                    if (configPanel) configPanel.style.display = 'flex';
                    if (home) home.value = state.autoCommute.home || '';
                    if (work) work.value = state.autoCommute.work || '';
                    if (wifi) wifi.value = state.autoCommute.wifi || '';
                }
            }, 500);
        } catch (e) {
            console.error('Erro ao ler autoCommute config:', e);
        }
    }
};

// Automação de Trajetos Inteligente
window.toggleAutoCommuteGPS = function(e) {
    const configPanel = document.getElementById('gps-commute-config');
    if (configPanel) {
        configPanel.style.display = e.target.checked ? 'flex' : 'none';
    }
};

window.captureGPSLocation = function(type) {
    if (!navigator.geolocation) {
        showToast("Geolocalização não suportada no seu navegador!", "error");
        return;
    }
    showToast("Obtendo localização atual pelo GPS...", "info");
    navigator.geolocation.getCurrentPosition(position => {
        const coords = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
        const input = document.getElementById(`commute-${type}-coords`);
        if (input) input.value = coords;
        showToast(`Localização de ${type === 'home' ? 'Casa' : 'Trabalho'} capturada!`, "success");
    }, error => {
        showToast("Erro ao obter localização: " + error.message, "error");
    });
};

window.saveAutoCommuteConfig = function() {
    const home = document.getElementById('commute-home-coords').value;
    const work = document.getElementById('commute-work-coords').value;
    const wifi = document.getElementById('commute-work-wifi').value.trim();
    
    state.autoCommute = { home, work, wifi };
    localStorage.setItem('autoCommute', JSON.stringify(state.autoCommute));
    
    showToast("Configurações de automação salvas com sucesso!", "success");
    
    if (home && work) {
        const hParts = home.split(',').map(Number);
        const wParts = work.split(',').map(Number);
        
        const dy = 111.3 * (hParts[0] - wParts[0]);
        const dx = 111.3 * (hParts[1] - wParts[1]) * Math.cos(hParts[0] * Math.PI / 180);
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        const estimatedMinutes = Math.round((distance / 30) * 60 + 5);
        showToast(`Estimativa de trajeto automática: ${estimatedMinutes} min (${distance.toFixed(2)} km).`, "info");
    }
};

