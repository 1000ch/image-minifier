'use strict';

var async = node('async');
var fs = node('fs');
var path = node('path');
var PNGO = node('pngo');

function minify(files, callback) {

  var array = [];

  async.each(files, function (file, next) {

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
          original: data.before.size,
          dest: data.after.size
        });

        next();
      });
    });

  }, function (error) {

    if (error) {
      callback(error);
    }
    callback(null, array);
  });
}

var dropArea = document.querySelector('#js-drop-area');

dropArea.addEventListener('dragover', function (e) {

  // "default" prevents drop
  e.stopPropagation();
  e.preventDefault();

});

dropArea.addEventListener('drop', function (e) {

  // stop propagation for browser redirecting
  e.stopPropagation();
  e.preventDefault();

  var files = e.dataTransfer.files || [];

  minify(files, function (error, results) {
    if (error) {
      throw error;
    }
    results.forEach(function (result) {
      console.log(
        result.path,
        'before:' + result.original,
        'after:' + result.dest
      );
    });
  });
});