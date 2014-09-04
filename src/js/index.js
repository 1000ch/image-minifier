//@depend lib/generate-id.js
//@depend lib/minify-image.js

'use strict';

var imageFileList = new ImageFileList();
var ipc = require('ipc');

/**
 * Data Transfer Item Resolver
 * @param {DataTransferItemList} items 
 * @constructor
 */
function DataTransferItemResolver(items) {
  this.items = items || [];
}

DataTransferItemResolver.prototype.resolve = function () {

  var promises = [];
  var forEach = Array.prototype.forEach;

  forEach.call(this.items, function (item) {
    var entry = item.webkitGetAsEntry();
    if (entry.isFile) {
      promises.push(new Promise(function (resolve, reject) {
        entry.file(function (file) {
          resolve(file);
        });
      }));
    } else if (entry.isDirectory) {
      entry.createReader().readEntries(function (fileEntries) {
        forEach.call(fileEntries, function (fileEntry) {
          promises.push(new Promise(function (resolve, reject) {
            fileEntry.file(function (file) {
              resolve(file);
            });
          }));
        });
      });
    }
  });

  return Promise.all(promises);
};

function PathResolver(paths) {
  this.paths = paths || [];
}

PathResolver.prototype.getFileSystem = function () {
  return new Promise(function (resolve, reject) {
    webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 5, function (fileSystem) {
      resolve(fileSystem);
    }, function (fileError) {
      reject(fileError);
    });
  });
};

PathResolver.prototype.resolve = function () {

  var that = this;
  var forEach = Array.prototype.forEach;
  var endsWith = function (value, position) {
    return (this.lastIndexOf(value, position) === (position >= 0 ? position | 0 : this.length - 1));
  };

  return new Promise(function (resolve, reject) {

    that.getFileSystem().then(function (fileSystem) {
      var promises = [];
      forEach.call(that.paths, function (path) {
        if (endsWith.call(path, '.png') || endsWith.call(path, '.jpg') ||
          endsWith.call(path, '.gif') || endsWith.call(path, '.svg')) {
          promises.push(new Promise(function (res, rej) {
            fileSystem.root.getFile(path, {}, function (fileEntry) {
              fileEntry.file(function (file) {
                res(file);
              });
            });
          }));
        } else {
          fileSystem.root.getDirectory(path, {}, function (directoryEntry) {
            directoryEntry.createReader().readEntries(function (fileEntries) {
              forEach.call(fileEntries, function (fileEntry) {
                promises.push(new Promise(function (res, rej) {
                  fileEntry.file(function (file) {
                    res(file);
                  });
                }));
              });
            });
          });
        }
      });

      Promise.all(promises).then(function (files) {
        resolve(files);
      });
    });

  });
};

$(function () {

  ipc.on('asynchronous-reply', function (args) {
    var pathResolver = new PathResolver(args);
    pathResolver.resolve().then(function (files) {
      console.log(files);
    });
  });
  var $descriptionButton = $('#js-description__button'); 
  $descriptionButton.on('click', function () {
    ipc.sendSync('openFileDialog');
  });

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

    var items = e.originalEvent.dataTransfer.items;
    var itemResolver = new DataTransferItemResolver(items);
    itemResolver.resolve().then(function (files) {

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