const { app, BrowserWindow } = require('electron');
const path = require('path');

// Iniciar o Express Backend e os túneis SSH
const server = require('./server.js');

let mainWindow;

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

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Fechar completamente o processo do Express e conexões de túnel SSH quando fechar a janela
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
