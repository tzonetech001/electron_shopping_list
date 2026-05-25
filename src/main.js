const { app, BrowserWindow, ipcMain } = require('electron');
let win = null;
let deviceInterval = null;
let connected = false;

function createWindow(){
  win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('index.html');
}

ipcMain.handle('device-connect', async () => {
  if(connected) return { status: 'already' };
  connected = true;
  win.webContents.send('device-status', 'connected');
  deviceInterval = setInterval(() => {
    const payload = { ts: Date.now(), value: Math.random() };
    win.webContents.send('device-data', payload);
  }, 1500);
  return { status: 'ok' };
});

ipcMain.handle('device-disconnect', async () => {
  if(!connected) return { status: 'already' };
  connected = false;
  clearInterval(deviceInterval);
  deviceInterval = null;
  win.webContents.send('device-status', 'disconnected');
  return { status: 'ok' };
});

ipcMain.handle('device-send', async (evt, cmd) => {
  // In a real app, forward the command to the device. Here we echo it back.
  const entry = { type: 'echo', cmd, time: Date.now() };
  win.webContents.send('device-log', entry);
  return { status: 'sent', echo: cmd };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
