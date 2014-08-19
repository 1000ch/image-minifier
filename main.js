'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var crashReporter = require('crash-reporter');

var win = null;

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-finish-launching', function () {
  crashReporter.start({
    productName: 'pngo-app'
  });
});

app.on('finish-launching', function () {
  win = new BrowserWindow({
    width: 500,
    height: 450
  });
  win.loadUrl('file://' + __dirname + '/index.html');

  win.on('closed', function () {
    win = null;
  });
});