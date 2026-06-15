// ==========================================================================
// STATE MANAGEMENT (EXPANDIDO)
// ==========================================================================
const state = {
    globalRate: 12.0,
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
    
    // Filtros e Configurações
    selectedMonth: new Date().getMonth(),
    selectedYear: 2026,
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
    comparisonChart: null
};

let resolvedApiHost = '';
let isPromptingPin = false;

// Interceptar todas as requisições fetch para injetar o PIN de segurança e bypass de túnel
const originalFetch = window.fetch;
window.fetch = async function(resource, options = {}) {
    if (typeof resource === 'string' && resource.includes('/api/')) {
        const pin = localStorage.getItem('access_pin');
        options.headers = options.headers || {};
        
        // Injetar PIN de segurança se disponível
        if (pin) {
            if (options.headers instanceof Headers) {
                options.headers.set('x-access-pin', pin);
            } else if (Array.isArray(options.headers)) {
                options.headers.push(['x-access-pin', pin]);
            } else {
                options.headers['x-access-pin'] = pin;
            }
        }

        // Injetar bypass de aviso de túnel (localtunnel exige isso para pular a tela de confirmação)
        if (options.headers instanceof Headers) {
            options.headers.set('bypass-tunnel-reminder', 'true');
        } else if (Array.isArray(options.headers)) {
            options.headers.push(['bypass-tunnel-reminder', 'true']);
        } else {
            options.headers['bypass-tunnel-reminder'] = 'true';
        }
    }
    
    try {
        const response = await originalFetch(resource, options);
        if (response.status === 401) {
            handleUnauthorizedAccess();
        }
        return response;
    } catch (err) {
        throw err;
    }
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
    } else if (tabName === 'settings') {
        fetchNetworkInfo();
    }
}

function handleUnauthorizedAccess() {
    if (isPromptingPin) return;
    isPromptingPin = true;
    
    localStorage.removeItem('access_pin');
    const accessPinInput = document.getElementById('input-access-pin');
    if (accessPinInput) accessPinInput.value = '';
    
    setTimeout(() => {
        switchTab('settings');
        const pinInput = document.getElementById('input-access-pin');
        if (pinInput) {
            pinInput.focus();
            pinInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        showToast('PIN de acesso incorreto ou expirado! Digite o PIN de 6 dígitos abaixo.', 'error');
        isPromptingPin = false;
    }, 100);
}

// Obter a URL base da API (suporta servidor customizado para APK)
function getApiHost() {
    const currentHost = window.location.hostname;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Se estiver rodando localmente no PC (não no celular), ignora túneis externos e fala direto com o IP local
    if (!isMobile && (currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.startsWith('192.168.'))) {
        const customHost = localStorage.getItem('custom_api_host');
        if (customHost && (customHost.includes('lhr.life') || customHost.includes('serveo') || customHost.includes('loca.lt'))) {
            localStorage.removeItem('custom_api_host');
            const input = document.getElementById('input-custom-host');
            if (input) input.value = '';
        }
        return '';
    }

    const serverId = localStorage.getItem('server_id');
    if (serverId && serverId !== 'local_fallback') {
        // Se estamos usando o pareamento por ID na nuvem, limpamos e ignoramos qualquer host customizado anterior
        localStorage.removeItem('custom_api_host');
        const input = document.getElementById('input-custom-host');
        if (input) input.value = '';
    }

    const customHost = localStorage.getItem('custom_api_host');
    if (customHost) {
        try {
            const customOrigin = new URL(customHost).origin;
            // Se o host salvo for de um túnel dinâmico antigo (lhr.life, serveo, loca.lt) e for diferente do resolvido, limpa
            if (resolvedApiHost) {
                const resolvedOrigin = new URL(resolvedApiHost).origin;
                if (customOrigin !== resolvedOrigin) {
                    if (customOrigin.includes('lhr.life') || customOrigin.includes('serveo') || customOrigin.includes('loca.lt')) {
                        console.log('[API] Limpando host de túnel expirado do localStorage:', customOrigin);
                        localStorage.removeItem('custom_api_host');
                        const input = document.getElementById('input-custom-host');
                        if (input) input.value = '';
                        return resolvedApiHost || '';
                    }
                }
            }
        } catch (e) {}
        return customHost.replace(/\/$/, ''); // Remove barra no final
    }
    return resolvedApiHost || ''; // Padrão é a resolvida do ExtendsClass/GitHub, ou o host atual
}

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
    // Capturar parâmetros de sincronização na URL (se presentes)
    const urlParams = new URLSearchParams(window.location.search);
    const urlSid = urlParams.get('sid');
    const urlPin = urlParams.get('pin');
    if (urlSid) {
        localStorage.setItem('server_id', urlSid.trim());
        console.log('[REGISTRO] ID do servidor configurado via URL:', urlSid);
    }
    if (urlPin) {
        localStorage.setItem('access_pin', urlPin.trim());
        const accessPinInput = document.getElementById('input-access-pin');
        if (accessPinInput) accessPinInput.value = urlPin.trim();
        console.log('[REGISTRO] PIN de acesso configurado via URL:', urlPin);
    }
    if (urlSid || urlPin) {
        // Limpar a barra de endereços para remover as credenciais expostas
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Carregar configurações locais
    const savedGoal = localStorage.getItem('goalEarnings');
    if (savedGoal) {
        state.goalEarnings = parseFloat(savedGoal);
        document.getElementById('input-goal-earnings').value = state.goalEarnings;
    }
    
    const savedAlarms = localStorage.getItem('alarms');
    if (savedAlarms) {
        state.alarms = JSON.parse(savedAlarms);
        document.getElementById('alarm-departure').value = state.alarms.departure;
        document.getElementById('alarm-arrival').value = state.alarms.arrival;
    }
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        updateThemeIcon(true);
    }
    
    document.getElementById('filter-month').value = state.selectedMonth;
    
    const customHostInput = document.getElementById('input-custom-host');
    if (customHostInput) {
        customHostInput.value = localStorage.getItem('custom_api_host') || '';
    }
    const accessPinInput = document.getElementById('input-access-pin');
    if (accessPinInput) {
        accessPinInput.value = localStorage.getItem('access_pin') || '';
    }

    // Tentar carregar dados em cache do localStorage para exibição imediata (Offline-first)
    const cachedData = localStorage.getItem('app_state_data');
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            state.globalRate = parsed.globalRate || 12.0;
            state.rows = parsed.rows || [];
            state.financeEntries = parsed.financeEntries || [];
            state.investEntries = parsed.investEntries || [];
            state.totalEarningsSinceJan = parsed.totalEarningsSinceJan || 0;
            state.pendingEarnings = parsed.pendingEarnings || 0;
            state.totalInvested = parsed.totalInvested || 0.0;
            applyFilters(); // Exibir imediatamente o que está no cache local!
        } catch (e) {
            console.error('Falha ao carregar cache local:', e);
        }
    }

    // Iniciar Relógio
    startClock();
    
    // Buscar dinamicamente a URL ativa do túnel no GitHub (se estiver acessando remotamente)
    await resolveActiveTunnelUrl();
    
    // Carregar do Servidor
    fetchData();
    fetchNetworkInfo();

    // Eventos
    bindEvents();
    
    // Inicializar Novos Helpers Premium
    initNotifications();
    initInvestmentsCalc();
    initBackupHandlers();
    applyMathParserToInputs();
    
    // Registrar PWA Service Worker
    registerServiceWorker();
    
    // Configurar atualizações em tempo real (SSE)
    setupRealtimeUpdates();
});

// ==========================================================================
// API REST WRAPPERS
// ==========================================================================
async function fetchData() {
    try {
        setSyncStatus('syncing', 'Sincronizando...');
        const response = await fetch(`${getApiHost()}/api/data?_=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Erro ao carregar do servidor');
        
        const data = await response.json();
        state.globalRate = data.globalRate;
        state.totalEarningsSinceJan = data.totalEarningsSinceJan;
        state.pendingEarnings = data.pendingEarnings;
        state.rows = data.rows;
        state.financeEntries = data.financeEntries || [];
        state.investEntries = data.investEntries || [];
        state.totalInvested = data.totalInvested || 0.0;
        
        // Salvar cópia local no localStorage (Offline-first)
        saveStateToLocalStorage();
        
        // Injetar URLs de IP dinamicamente para o MacroDroid
        updateMacroDroidLink();
        
        // Atualizar taxa horária nas configurações
        const rateValEl = document.getElementById('kpi-rate-val');
        if (rateValEl) {
            rateValEl.innerText = `R$ ${state.globalRate.toFixed(2)}/h`;
        }
        const rateInputEl = document.getElementById('input-global-rate');
        if (rateInputEl) {
            rateInputEl.value = state.globalRate;
        }
        
        // Carregar categorias dinâmicas
        populateCategoriesDropdown();
        
        // Filtrar e Renderizar
        applyFilters();
        setSyncStatus('connected', 'Online');
    } catch (err) {
        console.error(err);
        showToast('Erro ao carregar dados da planilha Excel!', 'error');
        setSyncStatus('offline', 'Desconectado');
    }
}

// Obter informações de rede do computador/servidor
async function fetchNetworkInfo() {
    try {
        const response = await fetch(`${getApiHost()}/api/network-info`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        // Exibir PIN de segurança e ID do Servidor se fornecidos (apenas localmente no PC)
        const pinDisplayWrapper = document.getElementById('pin-display-wrapper');
        const desktopAccessPin = document.getElementById('desktop-access-pin');
        const desktopServerId = document.getElementById('desktop-server-id');
        if (data.accessPin) {
            if (desktopAccessPin) desktopAccessPin.innerText = data.accessPin;
            if (desktopServerId) desktopServerId.innerText = data.serverId || 'local_fallback';
            if (pinDisplayWrapper) pinDisplayWrapper.style.display = 'flex';
        } else {
            if (pinDisplayWrapper) pinDisplayWrapper.style.display = 'none';
        }
        
        const tunnelInput = document.getElementById('phone-tunnel-url');
        const localInput = document.getElementById('phone-local-url');
        const apkInput = document.getElementById('phone-apk-url');
        
        const tunnelQrImg = document.getElementById('tunnel-qr-img');
        const localQrImg = document.getElementById('local-qr-img');
        const apkQrImg = document.getElementById('apk-qr-img');
        
        const tunnelQrWrapper = document.getElementById('tunnel-qr-wrapper');
        const localQrWrapper = document.getElementById('local-qr-wrapper');
        const apkQrWrapper = document.getElementById('apk-qr-wrapper');
        
        if (data.tunnelUrl || data.apkUrl) {
            if (tunnelInput) tunnelInput.value = data.tunnelUrl || 'Conectando túnel remoto...';
            if (tunnelQrImg) {
                if (data.tunnelUrl) {
                    const qrData = data.serverId 
                        ? `https://andreturco.github.io/horascontrole/public/?sid=${data.serverId}&pin=${data.accessPin}`
                        : data.tunnelUrl;
                    tunnelQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
                    if (tunnelQrWrapper) tunnelQrWrapper.style.display = 'block';
                } else {
                    if (tunnelQrWrapper) tunnelQrWrapper.style.display = 'none';
                }
            }
            
            const apkUrl = data.apkUrl || (data.tunnelUrl ? `${data.tunnelUrl}/controle-horas.apk` : '');
            if (apkUrl) {
                if (apkInput) apkInput.value = apkUrl;
                if (apkQrImg) {
                    apkQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(apkUrl)}`;
                    if (apkQrWrapper) apkQrWrapper.style.display = 'block';
                }
            } else {
                if (apkInput) apkInput.value = 'Compilando APK em segundo plano...';
                if (apkQrWrapper) apkQrWrapper.style.display = 'none';
            }
        } else {
            if (tunnelInput) tunnelInput.value = 'Sem túnel remoto ativo (tente reiniciar o servidor)';
            if (tunnelQrWrapper) tunnelQrWrapper.style.display = 'none';
            if (apkInput) apkInput.value = 'Sem túnel ativo para download';
            if (apkQrWrapper) apkQrWrapper.style.display = 'none';
        }
        
        if (data.localIps && data.localIps.length > 0) {
            const localUrl = data.serverId
                ? `http://${data.localIps[0]}:${data.port}/?sid=${data.serverId}&pin=${data.accessPin}`
                : `http://${data.localIps[0]}:${data.port}`;
            if (localInput) localInput.value = localUrl;
            if (localQrImg) {
                localQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(localUrl)}`;
                if (localQrWrapper) localQrWrapper.style.display = 'block';
            }
        } else {
            if (localInput) localInput.value = 'IP local não detectado';
            if (localQrWrapper) localQrWrapper.style.display = 'none';
        }
    } catch (err) {
        console.warn('Erro ao carregar informações de rede do servidor:', err);
    }
}

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

// Salvar linha específica com dados absolutos
async function saveRow(rowData) {
    try {
        setSyncStatus('syncing', 'Gravando...');
        const response = await fetch(`${getApiHost()}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rowData)
        });
        if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error || 'Falha ao salvar dia');
        }
        const res = await response.json();
        showToast(res.message, 'success');
        await fetchData();
        return true;
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Erro ao gravar dados na planilha!', 'error');
        setSyncStatus('connected', 'Online');
        return false;
    }
}

// Salvar taxa horária global
async function saveGlobalRate(rate) {
    try {
        setSyncStatus('syncing', 'Salvando taxa...');
        const response = await fetch(`${getApiHost()}/api/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ globalRate: rate })
        });
        if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error || 'Falha ao salvar taxa');
        }
        const res = await response.json();
        showToast(res.message, 'success');
        await fetchData();
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Falha ao gravar taxa global!', 'error');
        setSyncStatus('connected', 'Online');
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
    
    // Salvar estado original para rollback em caso de falha de rede
    const originalRows = JSON.parse(JSON.stringify(state.rows));
    
    try {
        setSyncStatus('syncing', 'Batendo ponto...');
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + 
            String(now.getMinutes()).padStart(2, '0');

        // Atualizar memória local imediatamente (Optimistic Update)
        const todayRowIndex = state.rows.findIndex(r => r.date === dateStr);
        if (todayRowIndex !== -1) {
            const target = state.rows[todayRowIndex];
            let slotName = '';
            if (!target.entrada1) {
                target.entrada1 = timeStr;
                slotName = 'Entrada 1';
            } else if (!target.saida1) {
                target.saida1 = timeStr;
                slotName = 'Saída 1';
            } else if (!target.entrada2) {
                target.entrada2 = timeStr;
                slotName = 'Entrada 2';
            } else if (!target.saida2) {
                target.saida2 = timeStr;
                slotName = 'Saída 2';
            }
            
            if (slotName) {
                // Recalcular horas e trajetos locais para exibição instantânea
                const wMin = calculateWorkedMinutes(target.entrada1, target.saida1, target.entrada2, target.saida2);
                target.minutosTrabalhados = wMin;
                target.horasMinutos = minutesToTimeStr(wMin);
                target.horasFracionarias = wMin / 60;
                
                let dayRate = state.globalRate;
                if (target.valorHora !== null && target.valorHora !== '') {
                    dayRate = parseFloat(target.valorHora);
                }
                
                if (target.ganhosManuais !== null && target.ganhosManuais !== undefined) {
                    target.ganhos = parseFloat(target.ganhosManuais);
                } else {
                    target.ganhos = (wMin / 60) * dayRate;
                }
                
                // Atualizar tempo de trajetos locais para exibição instantânea
                const commuteMinutes = calculateCommuteMinutes(target.saidaCasa, target.entrada1, target.saida1, target.entrada2, target.saida2, target.chegadaCasa);
                const timeOutsideMinutes = calculateTimeOutsideMinutes(target.saidaCasa, target.chegadaCasa);
                target.tempoTrajeto = minutesToTimeStr(commuteMinutes);
                target.minutosTrajeto = commuteMinutes;
                target.tempoForaCasa = minutesToTimeStr(timeOutsideMinutes);
                target.minutosForaCasa = timeOutsideMinutes;

                // Salvar no localStorage e atualizar a tela imediatamente
                saveStateToLocalStorage();
                applyFilters();
            }
        }

        const response = await fetch(`${getApiHost()}/api/clock-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: dateStr, time: timeStr })
        });
        
        if (!response.ok) {
            const errRes = await response.json();
            throw new Error(errRes.error || 'Falha ao bater ponto');
        }
        
        const res = await response.json();
        showToast(res.message, 'success');
        await fetchData();
    } catch (err) {
        console.error(err);
        // Realizar rollback do estado local em caso de erro na rede ou no servidor
        state.rows = originalRows;
        saveStateToLocalStorage();
        applyFilters();
        showToast(err.message || 'Erro de conexão ao bater ponto!', 'error');
        setSyncStatus('offline', 'Desconectado');
    } finally {
        // Reabilitar botão após 3 segundos
        setTimeout(() => {
            btn.disabled = false;
            if (btnText) btnText.innerText = originalText;
            btn.style.opacity = '';
        }, 3000);
    }
}

// Quitar lote de faturamento pendente
async function payBatch(dateLimit) {
    try {
        setSyncStatus('syncing', 'Quitando lote...');
        const response = await fetch(`${getApiHost()}/api/pay-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateLimit })
        });
        if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error || 'Erro ao pagar lote');
        }
        const res = await response.json();
        showToast(res.message, 'success');
        await fetchData();
        document.getElementById('pay-cutoff-date').value = '';
        document.getElementById('btn-quit-batch').disabled = true;
        document.getElementById('cutoff-pending-val').innerText = 'R$ 0,00';
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Erro ao quitar lançamentos na planilha!', 'error');
        setSyncStatus('connected', 'Online');
    }
}

// Salvar transação de gestão financeira (Mobills)
async function saveFinanceEntry(entryData) {
    try {
        setSyncStatus('syncing', 'Salvando transação...');
        const response = await fetch(`${getApiHost()}/api/finance/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData)
        });
        if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error || 'Erro ao salvar transação');
        }
        const res = await response.json();
        showToast(res.message, 'success');
        
        // Reset do formulário financeiro
        document.getElementById('finance-entry-form').reset();
        document.getElementById('fin-entry-id').value = '';
        
        await fetchData();
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Erro ao salvar transação financeira!', 'error');
        setSyncStatus('connected', 'Online');
    }
}

// Deletar transação financeira
async function deleteFinanceEntry(id) {
    try {
        setSyncStatus('syncing', 'Excluindo transação...');
        const response = await fetch(`${getApiHost()}/api/finance/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error || 'Erro ao excluir transação');
        }
        const res = await response.json();
        showToast(res.message, 'success');
        await fetchData();
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Falha ao deletar transação!', 'error');
        setSyncStatus('connected', 'Online');
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
    
    state.filteredRows.sort((a, b) => a.date.localeCompare(b.date));
    
    // 2. Filtrar Transações Financeiras (Aba Mobills)
    state.filteredFinanceEntries = state.financeEntries.filter(entry => {
        const dateParts = parseDateParts(entry.date);
        return dateParts.month === monthSelect;
    });
    
    state.filteredFinanceEntries.sort((a, b) => a.date.localeCompare(b.date));
    
    // 3. Filtrar Investimentos (Aba Investimentos)
    state.filteredInvestEntries = state.investEntries.filter(entry => {
        const dateParts = parseDateParts(entry.date);
        return dateParts.month === monthSelect;
    });
    
    state.filteredInvestEntries.sort((a, b) => a.date.localeCompare(b.date));
    
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

    // Calcular faturamento do mês atual filtrado
    let totalMinutesMonth = 0;
    let totalEarningsMonth = 0;
    
    state.filteredRows.forEach(row => {
        totalMinutesMonth += row.minutosTrabalhados;
        totalEarningsMonth += row.ganhos;
    });
    
    // Horas da semana atual
    let totalMinutesWeek = 0;
    const currentWeekDays = getDaysOfCurrentWeek();
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
    
    // Atualizar KPI Reserva 20% Recebida Geral
    const totalReceived = state.totalEarningsSinceJan - state.pendingEarnings;
    const globalAutoInvest = totalReceived * 0.20;
    const kpiGlobalInvestAuto = document.getElementById('kpi-global-invest-auto');
    if (kpiGlobalInvestAuto) {
        kpiGlobalInvestAuto.innerText = formatCurrency(globalAutoInvest);
    }
    const kpiGlobalInvestAutoSub = document.getElementById('kpi-global-invest-auto-subtitle');
    if (kpiGlobalInvestAutoSub) {
        kpiGlobalInvestAutoSub.innerText = `Ref: 20% de ${formatCurrency(totalReceived)} pagos`;
    }
    
    // Meta de progresso mensal
    const goalPercent = Math.min(100, Math.floor((totalEarningsMonth / state.goalEarnings) * 100));
    document.getElementById('goal-percent-text').innerText = `${goalPercent}%`;
    document.getElementById('goal-progress-fill').style.width = `${goalPercent}%`;
    document.getElementById('goal-min-text').innerText = `Meta: R$ ${state.goalEarnings.toFixed(2)}`;
    document.getElementById('goal-current-text').innerText = `Ganhos: R$ ${totalEarningsMonth.toFixed(2)}`;
}

// 2. Tabela e Calendário de Pontos
function renderHistory() {
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '';
    
    if (state.filteredRows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum registro de ponto encontrado para este mês ou busca.</td></tr>';
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
    state.rows.forEach(row => {
        const dateParts = parseDateParts(row.date);
        if (dateParts.month === month && dateParts.year === year) {
            dayMap[dateParts.day] = row;
        }
    });

    for (let d = 1; d <= totalDays; d++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';
        
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

    // 20% de Investimento retido das horas pagas
    let paidHoursIncome = 0;
    state.filteredRows.forEach(row => {
        if (row.statusPagamento === 'Pago') {
            paidHoursIncome += row.ganhos;
        }
    });
    const monthlyAutoInvested = paidHoursIncome * 0.20;
    const finInvestedEl = document.getElementById('fin-month-invested');
    if (finInvestedEl) {
        finInvestedEl.innerText = formatCurrency(monthlyAutoInvested);
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

    // Injetar virtualmente a transferência automática de 20% p/ Investimentos do faturamento Pago do mês
    if (monthlyAutoInvested > 0) {
        const item = document.createElement('div');
        item.className = 'extract-item';
        
        item.innerHTML = `
            <div class="extract-item-left">
                <div class="extract-icon" style="background-color: rgba(16, 185, 129, 0.15); color: var(--accent-green)">
                    <i class="fa-solid fa-vault"></i>
                </div>
                <div class="extract-info">
                    <span class="extract-desc">Reserva 20% p/ Investimentos</span>
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

// Dinamicamente obter IP e preencher URL do MacroDroid no Modal explicativo
function updateMacroDroidLink() {
    const linkEl = document.getElementById('macrodroid-api-url');
    if (linkEl) {
        const host = window.location.host;
        linkEl.innerText = `http://${host}/api/auto-arrival`;
    }
}

// ==========================================================================
// EVENT BINDINGS
// ==========================================================================
function bindEvents() {
    // 0. Botão de sincronização manual (Sync Badge)
    document.getElementById('sync-status').addEventListener('click', () => {
        fetchData();
        fetchNetworkInfo();
        showToast('Atualizando dados da planilha...', 'success');
    });

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
                fetchNetworkInfo();
            }
        });
    });

    // 2. Filtros e Pesquisa
    document.getElementById('filter-month').addEventListener('change', applyFilters);
    document.getElementById('search-notes').addEventListener('input', applyFilters);

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

    // 10b. Servidor Customizado (API Host)
    const btnSaveHost = document.getElementById('btn-save-custom-host');
    if (btnSaveHost) {
        btnSaveHost.addEventListener('click', () => {
            let hostVal = document.getElementById('input-custom-host').value.trim();
            let pinVal = document.getElementById('input-access-pin').value.trim();
            
            if (hostVal) {
                // Adicionar http:// se não tiver protocolo
                if (!/^https?:\/\//i.test(hostVal)) {
                    hostVal = 'http://' + hostVal;
                }
                localStorage.setItem('custom_api_host', hostVal);
                document.getElementById('input-custom-host').value = hostVal;
            } else {
                localStorage.removeItem('custom_api_host');
            }
            
            if (pinVal) {
                localStorage.setItem('access_pin', pinVal);
            } else {
                localStorage.removeItem('access_pin');
            }
            
            showToast('Configurações de conexão salvas!', 'success');
            fetchData();
            fetchNetworkInfo();
            setupRealtimeUpdates();
        });
    }

    const btnClearHost = document.getElementById('btn-clear-custom-host');
    if (btnClearHost) {
        btnClearHost.addEventListener('click', () => {
            localStorage.removeItem('custom_api_host');
            localStorage.removeItem('access_pin');
            document.getElementById('input-custom-host').value = '';
            document.getElementById('input-access-pin').value = '';
            showToast('Configurações de conexão redefinidas!', 'success');
            fetchData();
            fetchNetworkInfo();
            setupRealtimeUpdates();
        });
    }

    // 11. Alternador de Tema Escuro / Claro
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const body = document.body;
        const isLight = body.classList.toggle('light-theme');
        body.classList.toggle('dark-theme', !isLight);
        
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeIcon(isLight);
        
        setTimeout(() => {
            renderCharts();
            renderFinance();
        }, 100);
        showToast(`Tema ${isLight ? 'Claro' : 'Escuro'} ativo!`, 'success');
    });

    // 12. Exportações
    document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
    document.getElementById('btn-export-pdf').addEventListener('click', exportPDFReport);

    // 13. Event Delegation (Removed in favor of direct click binding on tr elements for reliability)
}

// Alternar Ícone do Tema
function updateThemeIcon(isLight) {
    const icon = document.querySelector('#theme-toggle i');
    if (isLight) {
        icon.className = 'fa-solid fa-moon';
    } else {
        icon.className = 'fa-solid fa-sun';
    }
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
    
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    
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

function formatCurrency(value) {
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
    if (!dateStr) return { year: NaN, month: NaN, day: NaN };
    // dateStr could be 'YYYY-MM-DD' or 'YYYY-MM-DDT00:00:00.000Z'
    const cleanStr = typeof dateStr === 'string' ? dateStr.substring(0, 10) : '';
    const parts = cleanStr.split('-');
    if (parts.length < 3) return { year: NaN, month: NaN, day: NaN };
    return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10) - 1, // 0-indexed
        day: parseInt(parts[2], 10)
    };
}

function saveStateToLocalStorage() {
    try {
        localStorage.setItem('app_state_data', JSON.stringify({
            globalRate: state.globalRate,
            rows: state.rows,
            financeEntries: state.financeEntries,
            investEntries: state.investEntries,
            totalEarningsSinceJan: state.totalEarningsSinceJan,
            pendingEarnings: state.pendingEarnings,
            totalInvested: state.totalInvested
        }));
    } catch (e) {
        console.error('Falha ao salvar no localStorage:', e);
    }
}

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

function getDaysOfCurrentWeek() {
    const now = new Date();
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
            subAuto.innerText = `${autoCountTotal} aporte${autoCountTotal !== 1 ? 's' : ''} de 20% desde Jan`;
        }
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
        const response = await fetch(`${getApiHost()}/api/invest/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(investData)
        });
        if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error || 'Erro ao salvar investimento');
        }
        const res = await response.json();
        showToast(res.message, 'success');
        
        document.getElementById('invest-entry-form').reset();
        document.getElementById('invest-entry-id').value = '';
        const cancelBtn = document.getElementById('btn-cancel-invest-edit');
        if (cancelBtn) cancelBtn.classList.add('hidden');
        document.getElementById('invest-form-title').innerHTML = '<i class="fa-solid fa-wallet color-green"></i> Registrar Aporte Manual';
        
        await fetchData();
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Erro ao salvar transação de investimento!', 'error');
        setSyncStatus('connected', 'Online');
    }
}

async function deleteInvestEntry(id) {
    try {
        setSyncStatus('syncing', 'Excluindo aporte...');
        const response = await fetch(`${getApiHost()}/api/invest/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (!response.ok) {
            const errRes = await response.json().catch(() => ({}));
            throw new Error(errRes.error || 'Erro ao excluir investimento');
        }
        const res = await response.json();
        showToast(res.message, 'success');
        await fetchData();
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Falha ao deletar aporte!', 'error');
        setSyncStatus('connected', 'Online');
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
            btn.addEventListener('click', () => {
                showToast('Gerando backup seguro... Download iniciando em instantes!', 'success');
                window.location.href = '/api/backup/download';
            });
        }
    });
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

// Função para ouvir atualizações em tempo real enviadas pelo servidor
async function setupRealtimeUpdates() {
    // Buscar dinamicamente a URL ativa do túnel no GitHub antes de tentar conectar
    await resolveActiveTunnelUrl();

    const apiHost = getApiHost();
    const pin = localStorage.getItem('access_pin') || '';
    const sseUrl = `${apiHost}/api/updates-stream?pin=${encodeURIComponent(pin)}`;
    console.log('[SSE] Conectando ao canal de atualizações em tempo real:', sseUrl);
    
    let eventSource = new EventSource(sseUrl);
    
    eventSource.onopen = function() {
        console.log('[SSE] Conexão com o servidor estabelecida com sucesso!');
        setSyncStatus('connected', 'Online');
        // Ao conectar/reconectar, sincroniza imediatamente os dados com o servidor
        fetchData();
        fetchNetworkInfo();
    };
    
    eventSource.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'reload') {
                console.log('[SSE] Sincronização em tempo real acionada! Atualizando dados...');
                fetchData();
            }
        } catch (e) {
            console.error('[SSE] Erro ao analisar evento SSE:', e);
        }
    };
    
    eventSource.onerror = function(err) {
        console.warn('[SSE] Canal desconectado. Tentando reconectar em 5 segundos...');
        setSyncStatus('offline', 'Desconectado');
        eventSource.close();
        setTimeout(setupRealtimeUpdates, 5000);
    };
}

// Exibir painel de configuração inicial do celular
function showSetupOverlay() {
    const overlay = document.getElementById('setup-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        
        const connectBtn = document.getElementById('setup-connect-btn');
        const serverIdInput = document.getElementById('setup-server-id');
        const accessPinInput = document.getElementById('setup-access-pin');
        
        // Pré-preencher se já houver algo no localStorage
        if (serverIdInput) serverIdInput.value = localStorage.getItem('server_id') || '';
        if (accessPinInput) accessPinInput.value = localStorage.getItem('access_pin') || '';
        
        if (connectBtn) {
            connectBtn.onclick = async () => {
                const sid = serverIdInput ? serverIdInput.value.trim() : '';
                const pin = accessPinInput ? accessPinInput.value.trim() : '';
                
                if (!sid || !pin) {
                    showToast('Preencha o ID do Servidor e o PIN!', 'error');
                    return;
                }
                
                connectBtn.disabled = true;
                connectBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';
                
                try {
                    // Validar se o ID de Registro existe na nuvem
                    const res = await fetch(`https://extendsclass.com/api/json-storage/bin/${sid}?_=${Date.now()}`, { cache: 'no-store' });
                    if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('server_id', sid);
                        localStorage.setItem('access_pin', pin);
                        
                        const mainAccessPinInput = document.getElementById('input-access-pin');
                        if (mainAccessPinInput) mainAccessPinInput.value = pin;
                        
                        if (data.url) {
                            resolvedApiHost = data.url.replace(/\/$/, '');
                        }
                        
                        showToast('Servidor pareado com sucesso!', 'success');
                        overlay.style.display = 'none';
                        
                        // Inicializar conexões com o servidor pareado
                        fetchData();
                        fetchNetworkInfo();
                        setupRealtimeUpdates();
                    } else {
                        showToast('ID do Servidor inválido ou não encontrado!', 'error');
                    }
                } catch (e) {
                    console.error('[SETUP] Erro ao parear:', e);
                    showToast('Erro ao parear. Verifique sua conexão.', 'error');
                } finally {
                    connectBtn.disabled = false;
                    connectBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Conectar';
                }
            };
        }
    }
}

// Resolver dinamicamente a URL ativa do túnel
async function resolveActiveTunnelUrl() {
    const currentHost = window.location.hostname;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Se estiver rodando localmente no PC (não no celular), não altera nada
    const isLocal = currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.startsWith('192.168.') || currentHost.startsWith('10.') || currentHost.startsWith('172.');
    if (!isMobile && isLocal) {
        return;
    }

    // 1. Tentar resolver o túnel dinâmico via ID do Servidor (ExtendsClass JSON bin)
    const savedServerId = localStorage.getItem('server_id');
    if (savedServerId && savedServerId !== 'local_fallback') {
        try {
            console.log('[API] Buscando URL ativa na nuvem com o ID:', savedServerId);
            const response = await fetch(`https://extendsclass.com/api/json-storage/bin/${savedServerId.trim()}?_=${Date.now()}`, { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                if (data.url) {
                    resolvedApiHost = data.url.replace(/\/$/, '');
                    console.log('[API] Conectado via nuvem. URL resolvida:', resolvedApiHost);
                    
                    if (data.pin) {
                        localStorage.setItem('access_pin', data.pin);
                        const accessPinInput = document.getElementById('input-access-pin');
                        if (accessPinInput) accessPinInput.value = data.pin;
                    }
                    return;
                }
            }
        } catch (err) {
            console.warn('[API] Falha ao consultar o ID na nuvem. Tentando fallbacks...', err);
        }
    }

    // 2. Se não houver ID do servidor, e estiver remoto, exibir a tela de configuração inicial (Setup Overlay)
    if (!isLocal && !savedServerId) {
        showSetupOverlay();
    }

    // 3. Fallback clássico: buscar a URL ativa resolvida do GitHub (caso seja o usuário André usando o legado)
    try {
        console.log('[API] Resolvendo URL do túnel dinâmico via repositório legado do GitHub...');
        const response = await fetch('https://raw.githubusercontent.com/AndreTurco/horascontrole/main/tunnel_url.json?_=' + Date.now(), { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            if (data.url) {
                resolvedApiHost = data.url.replace(/\/$/, '');
                console.log('[API] URL ativa resolvida do GitHub (Legado):', resolvedApiHost);
            }
            if (data.pin) {
                localStorage.setItem('access_pin', data.pin);
                const accessPinInput = document.getElementById('input-access-pin');
                if (accessPinInput) accessPinInput.value = data.pin;
                console.log('[API] PIN de acesso configurado automaticamente do GitHub (Legado).');
            }
        }
    } catch (e) {
        console.error('[API-ERROR] Falha ao ler tunnel_url.json do GitHub:', e);
    }
}
