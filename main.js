'use strict';

var application   = require('app');
var remote        = require('remote');
var BrowserWindow = require('browser-window');
var crashReporter = require('crash-reporter');
var dialog        = require('dialog');
var ipc           = require('ipc');

application.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

application.on('will-finish-launching', function () {
  crashReporter.start({
    productName: 'imgo-app'
  });
});

application.on('finish-launching', function () {

  // initialize browser window
  var browserWindow = new BrowserWindow({
    width: 800,
    height: 460
  });

  // handle openFileDialog event
  ipc.on('openFileDialog', function (e, arg) {
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
    }, function (arg) {
      e.sender.send('asynchronous-reply', arg);
    });
  });

  // open window
  browserWindow.loadUrl('file://' + __dirname + '/index.html');

  browserWindow.on('closed', function () {
    browserWindow = null;
  });
});
