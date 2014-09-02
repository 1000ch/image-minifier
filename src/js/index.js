'use strict';

var fs = node('fs');
var async = node('async');
var filesize = node('filesize');
var uuid = node('uuid');
var IMGO = node('imgo');

var itemMap = {};

document.addEventListener('DOMContentLoaded', function () {

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

    // get dropping files
    var files = e.dataTransfer.files || [];

    _.each(files, function (file) {
      itemMap[file.path] = {
        id: uuid.v1(),
        name: file.name,
        path: file.path,
        beforeSize: file.size,
        afterSize: '',
        type: file.type
      };
    });

    var html = '';
    _.each(itemMap, function (item) {
      html += Mustache.render(resultItemTemplate.innerHTML, item);
    });
    resultList.innerHTML = html;
    
    minify(files, function (error, results) {

      if (error) {
        throw error;
      }
      
      _.each(results, function (result) {
        var item = itemMap[result.path];
        
        // set optimized file size
        item.afterSize = result.afterSize;

        // update row
        {
          var tr = document.getElementById(item.id);
          tr.querySelector('.js-after-size').textContent = item.afterSize;
          tr.querySelector('.js-saving-percent').textContent = ((item.beforeSize - item.afterSize) / item.beforeSize) * 100;
          var icon = tr.querySelector('.fa');
          icon.classList.remove('fa-spinner');
          icon.classList.remove('fa-spin');
          if (item.beforeSize === item.afterSize) {
            icon.classList.add('fa-times-circle');
          } else {
            icon.classList.add('fa-check');
          }
        }
      });
    });
  });
});

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