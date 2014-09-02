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

document.addEventListener('DOMContentLoaded', function () {

  var processingMap = {};

  var dropArea = document.querySelector('#js-drop-area');
  var dashedBorder = document.querySelector('.dashed-border');
  var dashedBorderText = document.querySelector('.dashed-border__text');
  var resultList = document.querySelector('#js-result-list');
  var resultItemTemplate = document.querySelector('#tmpl-result');

  dropArea.addEventListener('dragenter', function (e) {
    dashedBorder.classList.add('on-dragmove');
    dashedBorderText.classList.add('on-dragmove');
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

    var files = e.dataTransfer.files || [];

    _.each(files, function (file) {
      processingMap[file.path] = {
        id: 'js-result-item-' + file.path,
        name: file.name,
        path: file.path,
        beforeSize: file.size,
        afterSize: '',
        type: file.type
      };
    });

    // TODO bulk
    var html = '';
    _.each(processingMap, function (processingData) {
      html += Mustache.render(resultItemTemplate.innerHTML, processingData);
    });
    resultList.innerHTML = html;
    
    minify(files, function (error, results) {

      if (error) {
        throw error;
      }
      
      _.each(results, function (result) {
        var processingData = processingMap[result.path];
        
        // set optimized file size
        processingData.afterSize = result.afterSize;
        
        var tr = document.getElementById(processingData.id);

        var after = tr.querySelector('.js-after-size');
        after.textContent = processingData.afterSize;

        var saving = tr.querySelector('.js-saving-percent');
        saving.textContent = ((processingData.beforeSize - processingData.afterSize) / processingData.beforeSize) * 100;

        var icon = tr.querySelector('.fa');
        icon.classList.remove('fa-spinner');
        icon.classList.remove('fa-spin');
        if (processingData.beforeSize === processingData.afterSize) {
          icon.classList.add('fa-times-circle');
        } else {
          icon.classList.add('fa-check');
        }
        console.log(processingData);
      });
    });
  });
});