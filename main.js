'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var crashReporter = require('crash-reporter');

var dialog = require('dialog');
var ipc = require('ipc');

var win = null;

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-finish-launching', function () {
  crashReporter.start({
    productName: 'imgo-app'
  });
});

app.on('finish-launching', function () {

  // initialize browser window
  win = new BrowserWindow({
    width: 800,
    height: 460
  });

  // handle openFileDialog event
  ipc.on('openFileDialog', function (e, arg) {
    dialog.showOpenDialog(win, {
      properties: [
        'openFile',
        'openDirectory',
        'multiSelections'
      ],
      filters: [{
        name: 'Images',
        extensions: ['jpg', 'png', 'gif', 'svg']
      }]
    }, function (arg) {
      e.sender.send('asynchronous-reply', arg);
    });
  });

  // open window
  win.loadUrl('file://' + __dirname + '/index.html');

  win.on('closed', function () {
    win = null;
  });
});