// Simular ambiente de navegador no Node.js com mocks completos
const fs = require('fs');
const path = require('path');

// Mocks do navegador completos
global.window = {
    location: {
        host: 'localhost:3080'
    }
};
global.document = {
    addEventListener: (event, cb) => {
        if (event === 'DOMContentLoaded') {
            global.DOMContentLoaded_cb = cb;
        }
    },
    getElementById: (id) => {
        return {
            addEventListener: () => {},
            value: '',
            style: {},
            classList: {
                add: () => {},
                remove: () => {},
                toggle: () => {},
                contains: () => false
            },
            querySelector: () => ({ innerText: '' }),
            options: [],
            appendChild: () => {},
            getContext: () => ({
                createLinearGradient: () => ({ addColorStop: () => {} })
            })
        };
    },
    querySelectorAll: () => [],
    createElement: () => ({
        classList: { add: () => {} },
        addEventListener: () => {},
        innerHTML: ''
    }),
    body: {
        classList: {
            add: () => {},
            remove: () => {},
            toggle: () => {},
            contains: () => false
        },
        style: {}
    }
};
global.localStorage = {
    getItem: () => null,
    setItem: () => null
};
global.navigator = {
    serviceWorker: { register: () => Promise.resolve() }
};

// Mock de fetch retornando dados válidos da planilha
global.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
        globalRate: 12,
        totalEarningsSinceJan: 1500,
        pendingEarnings: 300,
        totalInvested: 500,
        rows: [
            { date: '2026-05-31', weekday: 'Sábado', minutosTrabalhados: 480, ganhos: 96, horasFracionarias: 8, horasMinutos: '08:00', statusPagamento: 'Pago' }
        ],
        financeEntries: [],
        investEntries: []
    })
});

// Mock de Chart.js
global.Chart = class {
    constructor() {}
    destroy() {}
};

try {
    console.log('[TEST] Tentando carregar public/app.js...');
    const appJsPath = path.join(__dirname, '..', 'public', 'app.js');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    eval(appJsContent);
    console.log('[TEST] public/app.js carregado com sucesso!');
    
    if (global.DOMContentLoaded_cb) {
        console.log('[TEST] Tentando rodar o callback de DOMContentLoaded...');
        global.DOMContentLoaded_cb();
        console.log('[TEST] DOMContentLoaded rodou sem erros!');
    }
} catch (err) {
    console.error('[ERRO ENCONTRADO]');
    console.error(err);
    process.exit(1);
}
