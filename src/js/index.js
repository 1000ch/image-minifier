'use strict';

var fs = node('fs');
var async = node('async');
var filesize = node('filesize');
var IMGO = node('imgo');

var itemMap = {};  

document.addEventListener('DOMContentLoaded', function () {

  var $dropArea = $('#js-drop-area');
  var $dashedBorder = $('.dashed-border');
  var $dashedBorderText = $('.dashed-border__text');
  var $resultList = $('#js-result-list');
  var $resultItemTemplate = $('#tmpl-result');

  $dropArea.on('dragenter', function (e) {
    $dashedBorder.addClass('on-dragmove');
    $dashedBorderText.addClass('on-dragmove');
  });

  $dropArea.on('dragleave', function (e) {
    $dashedBorder.removeClass('on-dragmove');
    $dashedBorderText.removeClass('on-dragmove');
  });

  $dropArea.on('dragover', function (e) {
    // "default" prevents drop
    e.stopPropagation();
    e.preventDefault();
  });

  $dropArea.on('drop', function (e) {

    // stop propagation for browser redirecting
    e.stopPropagation();
    e.preventDefault();

    // get dropping files
    var files = e.originalEvent.dataTransfer.files || [];

    _.each(files, function (file) {
      itemMap[file.path] = {
        id: itemId(),
        name: file.name,
        path: file.path,
        beforeSize: file.size,
        afterSize: '',
        type: file.type
      };
    });

    var html = '';
    _.each(itemMap, function (item) {
      html += Mustache.render($resultItemTemplate.html(), item);
    });
    $resultList.html(html);
    
    minify(files, function (error, results) {

      if (error) {
        throw error;
      }
      
      _.each(results, function (result) {
        var item = itemMap[result.path];
        
        // set optimized file size
        item.afterSize = result.afterSize;

        // update row
        var $tr = $(document.getElementById(item.id));
        $tr.find('.js-after-size').text(item.afterSize);
        $tr.find('.js-saving-percent').text(((item.beforeSize - item.afterSize) / item.beforeSize) * 100);

        var $icon = $tr.find('.fa');
        $icon.removeClass('fa-spinner');
        $icon.removeClass('fa-spin');

        if (item.beforeSize === item.afterSize) {
          $icon.addClass('fa-times-circle');
        } else {
          $icon.addClass('fa-check');
        }
      });
    });
  });
});

var uniqueSelectorCount = 0;
function itemId() {
  return 'imgo' + uniqueSelectorCount++;
}

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