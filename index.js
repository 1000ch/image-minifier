'use strict';

var fs = node('fs');
var async = node('async');
var filesize = node('filesize');
var IMGO = node('imgo');

function minify(files, callback) {

  var array = [];

  async.each(files, function (file, next) {

    fs.readFile(file.path, function (error, buffer) {

      if (error) {
        return next(error);
      }
      
      new IMGO(file.path).optimize(function (e, data) {
        
        if (e) {
          next(e);
        }

        array.push({
          path: file.path,
          beforeSize: data.beforeSize,
          afterSize: data.afterSize
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
      beforeTotal += result.beforeSize - 0;
      afterTotal += result.afterSize - 0;
    });

    dashedBorderText.classList.remove('is-hidden');
    dashedBorderText.textContent = filesize(beforeTotal - afterTotal) + ' is reduced!';
    loading.classList.add('is-hidden');
  });
});