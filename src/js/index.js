'use strict';

// node
var fs = node('fs');
var path = node('path');
var mime = node('mime');

// atom-shell
var ipc = require('ipc');

var imageFileList = new ImageFileList();

$(function () {

  ipc.on('asynchronous-reply', function (args) {
    _.each(args, function (arg) {
      var stat = fs.statSync(arg);
      if (stat.isFile()) {
        imageFileList.add(path.resolve(arg), {
          type: mime.lookup(arg),
          path: path.resolve(arg),
          name: path.basename(arg),
          size: stat.size
        });
      } else if (stat.isDirectory()) {
        _.each(fs.readdirSync(arg), function (p) {
          var filepath = path.join(arg, p);
          var stat = fs.statSync(filepath);
          if (stat.isFile()) {
            imageFileList.add(path.resolve(filepath), {
              type: mime.lookup(filepath),
              path: path.resolve(filepath),
              name: path.basename(filepath),
              size: stat.size
            });
          }
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
        minifyImage(imageFileList.getFilePaths(), function (error, results) {

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
      }
    });
  });
  var $descriptionButton = $('#js-description__button'); 
  $descriptionButton.on('click', function () {
    ipc.sendSync('openFileDialog');
  });

  var $body = $(document.body);
  var $dropArea = $('#js-drop-area');
  var $resultList = $('#js-result-list');
  var $resultItemTemplate = $('#tmpl-result');

  $dropArea.on('dragenter', function (e) {
    $body.addClass('on-dragmove');
  });

  $dropArea.on('dragleave', function (e) {
    $body.removeClass('on-dragmove');
  });

  $dropArea.on('dragover', function (e) {
    // "default" prevents drop
    e.stopPropagation();
    e.preventDefault();
  });

  $dropArea.on('drop', function (e) {
    $body.removeClass('on-dragmove');

    // stop propagation for browser redirecting
    e.stopPropagation();
    e.preventDefault();

    var items = e.originalEvent.dataTransfer.items;
    var itemResolver = new DataTransferItemResolver(items);
    itemResolver.resolve().then(function (files) {

      // when complete to fetch files and directories data
      _.each(files, function (file) {
        imageFileList.add(file.path, {
          type: file.type,
          path: file.path,
          name: file.name,
          size: file.size
        });
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
      minifyImage(imageFileList.getFilePaths(), function (error, results) {

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
          $tr.find('.js-saving-percent').html(item.savingPercent);

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
