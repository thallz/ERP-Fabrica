const { app, BrowserWindow } = require('electron');
const path = require('path');

function criarJanelaPrincipal () {
  // Cria a janela do programa
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    // Esconde a barra de menus do topo para parecer um sistema real
    autoHideMenuBar: true, 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Carrega o seu ficheiro HTML que contém a interface
  mainWindow.loadFile('index.html');
  
  // (Opcional) Maximiza a janela ao abrir - ideal para chão de fábrica
  mainWindow.maximize();
}

// Quando o Electron estiver pronto, abre a janela
app.whenReady().then(() => {
  criarJanelaPrincipal();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      criarJanelaPrincipal();
    }
  });
});

// Fecha o programa quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});