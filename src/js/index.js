//@depend lib/generate-id.js
//@depend lib/minify-image.js

'use strict';

var imageFileList = new ImageFileList();

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
    var promises = [];

    _.each(e.originalEvent.dataTransfer.items || [], function (item) {
      var entry = item.webkitGetAsEntry();
      if (entry.isFile) {
        promises.push(new Promise(function (resolve, reject) {
          entry.file(function (file) {
            resolve(file);
          });
        }));
      } else if (entry.isDirectory) {
        entry.createReader().readEntries(function (fileEntries) {
          _.each(fileEntries, function (fileEntry) {
            promises.push(new Promise(function (resolve, reject) {
              fileEntry.file(function (file) {
                resolve(file);
              });
            }));
          });
        });
      }
    });

    Promise.all(promises).then(function (files) {

      // when complete to fetch files and directories data
      _.each(files, function (file) {
        imageFileList.add(file.path, file);
      });

      // render html
      var html = '';
      imageFileList.each(function (item) {
        html += Mustache.render($resultItemTemplate.html(), {
          id: item.id,
          fileName: item.fileName,
          beforeSizeText: item.beforeSizeText,
          afterSizeText: '',
          savingPercent: ''
        });
      });
      $resultList.html(html);

      // minify images
      minifyImage(imageFileList.getAllFiles(), function (error, results) {

        if (error) {
          throw error;
        }

        _.each(results, function (result) {
          var item = imageFileList.get(result.path);

          // set optimized file size
          item.afterSize = result.afterSize;

          // update row
          var $tr = $('#' + item.id);
          $tr.find('.js-after-size').text(item.afterSizeText);
          $tr.find('.js-saving-percent').text(item.savingPercent);

          var $icon = $tr.find('.fa');
          $icon.removeClass('fa-spinner');
          $icon.removeClass('fa-spin');

          if (item.beforeSize === item.afterSize) {
            $icon.addClass('fa-times-circle');
          } else {
            $icon.addClass('fa-check');
          }
        });

        imageFileList.clear();
      });
    });
  });
});