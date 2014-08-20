'use strict';

var async = node('async');
var fs = node('fs');
var path = node('path');
var PNGO = node('pngo');

function minify(files, callback) {

  var array = [];

  async.each(files, function (file, i, next) {

    fs.readFile(file.path, function (error, buffer) {
      if (error) {
        return next(error);
      }
      var pngo = new PNGO(file.path);
      pngo.optimize(function (e, data) {
        if (e) {
          next(e);
        }
        array.push({
          path: file.path,
          original: buffer.length,
          dest: data.contents.length
        });
        next();
      });
    });

  }, function (error) {

    if (error) {
      return callback(error);
    }
    callback(null, array)

  });
}

var dropArea = document.querySelector('#js-drop-area');

dropArea.addEventListener('dragover', function (e) {
  // "default" prevents drop
  e.preventDefault();
});

dropArea.addEventListener('drop', function () {
  // stop propagation for browser redirecting
  e.stopPropagation();

  console.log(e);
});