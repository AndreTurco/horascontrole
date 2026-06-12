const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

// Garantir instância única do aplicativo e evitar conflitos de porta 3080
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
    process.exit(0);
}

// Iniciar o Express Backend e os túneis SSH
const server = require('./server.js');

let mainWindow;
let tray = null;
let isQuitting = false;
let hasShownMinimizeNotification = false;

// Configurar o aplicativo para iniciar automaticamente com o Windows
function configureAutoStart() {
    try {
        app.setLoginItemSettings({
            openAtLogin: true,
            openAsHidden: true,
            path: process.execPath
        });
    } catch (e) {
        console.warn('[WARNING] Não foi possível configurar inicialização automática:', e.message);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Controle de Horas Premium",
        icon: path.join(__dirname, 'public', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Remove a barra de menus padrão para aparência nativa de software premium
    mainWindow.setMenu(null);

    // Esperar um breve delay (1.2s) para garantir que o express iniciou
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:3080');
    }, 1200);

    // Interceptar o fechamento da janela para minimizar na bandeja do sistema (System Tray)
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            
            if (!hasShownMinimizeNotification && tray) {
                try {
                    tray.displayBalloon({
                        title: 'Controle de Horas Premium',
                        content: 'O sistema continua ativo em segundo plano na barra de tarefas (próximo ao relógio) para manter a sincronização com o celular.',
                        iconType: 'info'
                    });
                    hasShownMinimizeNotification = true;
                } catch (e) {
                    console.warn('[WARNING] Não foi possível exibir notificação do tray:', e.message);
                }
            }
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'public', 'icon.ico');
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Abrir Painel', 
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                } else {
                    createWindow();
                }
            } 
        },
        { type: 'separator' },
        { 
            label: 'Sair Completamente', 
            click: () => {
                isQuitting = true;
                app.quit();
            } 
        }
    ]);

    tray.setToolTip('Controle de Horas Premium (Rodando em Segundo Plano)');
    tray.setContextMenu(contextMenu);

    // Dar clique simples ou duplo clique no ícone para restaurar
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        } else {
            createWindow();
        }
    });
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        } else {
            createWindow();
        }
    });
}

app.whenReady().then(() => {
    configureAutoStart();
    createWindow();
    createTray();

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Alguém tentou abrir uma segunda instância, foca e restaura a janela principal
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Fechar completamente o processo quando o app for finalizado pelo menu da bandeja
app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (isQuitting) {
            app.quit();
        }
    }
});
