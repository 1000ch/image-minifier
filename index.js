'use strict';

var fs = node('fs');
var path = node('path');
var async = node('async');
var filesize = node('filesize');
var PNGO = node('pngo');
var JPGO = node('jpgo');
var execFile = node('child_process').execFile;

function minify(files, callback) {

  var array = [];

  async.each(files, function (file, next) {

    fs.readFile(file.path, function (error, buffer) {

      if (error) {
        return next(error);
      }

      var optimizeCallback = function (e, data) {

        if (e) {
          next(e);
        }

        array.push({
          path: file.path,
          original: data.before.size,
          dest: data.after.size
        });

        next();
      };

      // optimize
      var extname = path.extname(file.path).toLowerCase();
      if (extname === '.png') {

        var pngo = new PNGO(file.path);
        pngo.optimize(optimizeCallback);

      } else if (extname === '.jpg' || extname === '.jpeg') {

        var jpgo = new JPGO(file.path);
        jpgo.optimize(optimizeCallback);

      } else if (extname === '.svg') {

        var before = fs.statSync(file.path);
        var after = null;
        var svgoPath = './node_modules/svgo/bin/svgo';
        var args = [file.path, file.path];
        execFile(svgoPath, args, function () {
          after = fs.statSync(file.path);
          array.push({
            path: file.path,
            original: before.size,
            dest: after.size
          });
          next();
        });

      } else if (extname === '.gif') {

        var before = fs.statSync(file.path);
        var after = null;
        var gifoPath = require('gifsicle').path;
        var args = ['--optimize', '--output', file.path, file.path];
        execFile(gifoPath, args, function () {
          after = fs.statSync(file.path);
          array.push({
            path: file.path,
            original: before.size,
            dest: after.size
          });
          next();
        });

      }
    });

  }, function (error) {

    if (error) {
      callback(error);
    }
    callback(null, array);
  });
}

var dropArea = document.querySelector('#js-drop-area');
var dashedBorder = document.querySelector('.dashed-border');
var dashedBorderText = document.querySelector('.dashed-border__text');
var loading = document.querySelector('.loading');

dropArea.addEventListener('dragenter', function (e) {
  dashedBorder.classList.add('on-dragmove');
  dashedBorderText.classList.add('on-dragmove');
  dashedBorderText.textContent = 'Drag and drop PNG, JPG, SVG here...';
});

dropArea.addEventListener('dragleave', function (e) {
  dashedBorder.classList.remove('on-dragmove');
  dashedBorderText.classList.remove('on-dragmove');
});

dropArea.addEventListener('dragover', function (e) {

  // "default" prevents drop
  e.stopPropagation();
  e.preventDefault();

});

dropArea.addEventListener('drop', function (e) {

  // stop propagation for browser redirecting
  e.stopPropagation();
  e.preventDefault();

  dashedBorderText.classList.add('is-hidden');
  loading.classList.remove('is-hidden');
  
  var files = e.dataTransfer.files || [];

  minify(files, function (error, results) {
    if (error) {
      throw error;
    }

    var beforeTotal = 0;
    var afterTotal = 0;

    results.forEach(function (result) {
      beforeTotal += result.original - 0;
      afterTotal += result.dest - 0;
    });

    dashedBorderText.classList.remove('is-hidden');
    dashedBorderText.textContent = filesize(beforeTotal - afterTotal) + ' is reduced!';
    loading.classList.add('is-hidden');
  });
});