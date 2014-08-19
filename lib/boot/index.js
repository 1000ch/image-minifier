'use strict';

var Menu = require('menu');
var MenuItem = require('menu-item');
var minify = require('minify');

function run() {
  var menu = Menu.buildFromTemplate([
    {
      label: 'optimize selected image with pngo',
      click: function (e) {
        console.log(e);
      }
    }
  ]);
  Menu.setApplicationMenu(menu);
}

run();