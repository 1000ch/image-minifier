'use strict';

const app   = require('app');
const BrowserWindow = require('browser-window');
const dialog = require('dialog');
const ipc = require('ipc');

require('crash-reporter').start();

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('finish-launching', function () {

  // initialize browser window
  let browserWindow = new BrowserWindow({
    width: 800,
    height: 480
  });

  // handle openFileDialog event
  ipc.on('asynchronous-message', (e, arg) => {
    if (arg === 'open-file-dialog') {
      dialog.showOpenDialog(browserWindow, {
        properties: [
          'openFile',
          'openDirectory',
          'multiSelections'
        ],
        filters: [{
          name: 'Images',
          extensions: ['jpg', 'png', 'gif', 'svg']
        }]
      }, args => {
        e.sender.send('asynchronous-reply', args);
      });
    }
  });

  // open window
  browserWindow.loadUrl('file://' + __dirname + '/index.html');

  browserWindow.on('closed', () => browserWindow = null);
});
