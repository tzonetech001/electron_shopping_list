const { ipcRenderer } = require('electron');

const connectBtn = document.getElementById('connect');
const disconnectBtn = document.getElementById('disconnect');
const sendBtn = document.getElementById('send');
const cmdInput = document.getElementById('cmd');
const statusEl = document.getElementById('status');
const logEl = document.getElementById('log');

function appendLog(msg){
  const time = new Date().toLocaleTimeString();
  logEl.textContent += `[${time}] ${msg}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

connectBtn.addEventListener('click', async () => {
  const res = await ipcRenderer.invoke('device-connect');
  appendLog('Connect -> ' + JSON.stringify(res));
});

disconnectBtn.addEventListener('click', async () => {
  const res = await ipcRenderer.invoke('device-disconnect');
  appendLog('Disconnect -> ' + JSON.stringify(res));
});

sendBtn.addEventListener('click', async () => {
  const cmd = cmdInput.value || '';
  const res = await ipcRenderer.invoke('device-send', cmd);
  appendLog('Sent -> ' + JSON.stringify(res));
});

ipcRenderer.on('device-status', (evt, s) => {
  statusEl.textContent = s;
  const connected = s === 'connected';
  connectBtn.disabled = connected;
  disconnectBtn.disabled = !connected;
  sendBtn.disabled = !connected;
});

ipcRenderer.on('device-data', (evt, data) => {
  appendLog('DATA: ' + JSON.stringify(data));
});

ipcRenderer.on('device-log', (evt, entry) => {
  appendLog('LOG: ' + JSON.stringify(entry));
});
