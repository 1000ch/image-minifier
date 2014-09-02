//@depend lib/generate-id.js
//@depend lib/minify-image.js

'use strict';

var filesize = node('filesize');
var itemMap = {};  

$(function () {

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
        id: generateId(),
        name: file.name,
        path: file.path,
        beforeSize: file.size,
        afterSize: 0,
        before: filesize(file.size),
        after: '',
        type: file.type
      };
    });

    var html = '';
    _.each(itemMap, function (item) {
      html += Mustache.render($resultItemTemplate.html(), item);
    });
    $resultList.html(html);
    
    minifyImage(files, function (error, results) {

      if (error) {
        throw error;
      }
      
      _.each(results, function (result) {
        var item = itemMap[result.path];
        
        // set optimized file size
        item.afterSize = result.afterSize;

        // update row
        var $tr = $('#' + item.id);
        var afterFileSize = filesize(item.afterSize);
        var savingPercent = (item.beforeSize - item.afterSize) / item.beforeSize;
        savingPercent = Math.floor(100 * savingPercent) / 100;
        savingPercent = savingPercent || 0.0;
        $tr.find('.js-after-size').text(afterFileSize);
        $tr.find('.js-saving-percent').text(savingPercent);

        var $icon = $tr.find('.fa');
        $icon.removeClass('fa-spinner');
        $icon.removeClass('fa-spin');

        if (item.beforeSize === item.afterSize) {
          $icon.addClass('fa-times-circle');
        } else {
          $icon.addClass('fa-check');
        }
      });

      itemMap = {};
    });
  });
});