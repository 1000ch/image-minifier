'use strict';

const app = require('app');
const BrowserWindow = require('browser-window');
const globalShortcut = require('global-shortcut');
const dialog = require('dialog');
const ipc = require('ipc');

require('crash-reporter').start();

let mainWindow = null;

function onClosed() {
  mainWindow = null;
}

function createMainWindow() {
  let window = new BrowserWindow({
    width: 960,
    height: 640
  });

  window.loadUrl('file://' + __dirname + '/build/index.html');
  window.on('closed', onClosed);

  return window;
}

function openFileDialog() {
  return new Promise((resolve, reject) => {
    resolve(dialog.showOpenDialog(mainWindow, {
      properties: [
        'openFile',
        'openDirectory',
        'multiSelections'
      ],
      filters: [{
        name: 'Images',
        extensions: ['jpg', 'png', 'gif', 'svg']
      }]
    }));
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate-with-no-open-windows', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {

  mainWindow = createMainWindow();

  globalShortcut.register('Command+O', () => {
    openFileDialog().then(args => mainWindow.webContents.send('path-selected', args));
  });

  ipc.on('select-path', e => {
    openFileDialog().then(args => e.sender.send('path-selected', args));
  });
});

app.on('will-quit', () => globalShortcut.unregisterAll());
