'use strict';

import ImageFileList        from './image-file-list';
import TransferItemResolver from './transfer-item-resolver';
import minify               from './minify.js'

// node
const fs   = node('fs');
const path = node('path');
const mime = node('mime');

let imageFileList = new ImageFileList();

$(function () {

  ipc.on('asynchronous-reply', function (args) {

    for (let arg of args) {

      let stat = fs.statSync(arg);

      if (stat.isFile()) {

        imageFileList.add(path.resolve(arg), {
          type: mime.lookup(arg),
          path: path.resolve(arg),
          name: path.basename(arg),
          size: stat.size
        });

      } else if (stat.isDirectory()) {

        for (let p of fs.readdirSync(arg)) {
          let filepath = path.join(arg, p);
          let stat = fs.statSync(filepath);
          if (stat.isFile()) {
            imageFileList.add(path.resolve(filepath), {
              type: mime.lookup(filepath),
              path: path.resolve(filepath),
              name: path.basename(filepath),
              size: stat.size
            });
          }
        }

        // render html
        let html  = '';
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
        minify(imageFileList.getFilePaths(), function (error, results) {

          if (error) {
            throw error;
          }

          for (let result of results) {

            let item = imageFileList.get(result.path);

            // set optimized file size
            item.afterSize = result.afterSize;

            // update row
            let $tr = $('#' + item.id);
            $tr.find('.js-after-size').text(item.afterSizeText);
            $tr.find('.js-saving-percent').text(item.savingPercent);

            let $icon = $tr.find('.fa');
            $icon.removeClass('fa-spinner');
            $icon.removeClass('fa-spin');

            if (item.beforeSize === item.afterSize) {
              $icon.addClass('fa-times-circle');
            } else {
              $icon.addClass('fa-check');
            }
          }

          imageFileList.clear();
        });
      }
    }
  });

  let $descriptionButton = $('#js-description__button');
  $descriptionButton.on('click', function () {
    ipc.sendSync('openFileDialog');
  });

  let $body = $(document.body);
  let $dropArea = $('#js-drop-area');
  let $resultList = $('#js-result-list');
  let $resultItemTemplate = $('#tmpl-result');

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
    var itemResolver = new TransferItemResolver(items);
    itemResolver.resolve().then(function (files) {

      // when complete to fetch files and directories data
      for (let file of files) {
        imageFileList.add(file.path, {
          type: file.type,
          path: file.path,
          name: file.name,
          size: file.size
        });
      }

      // render html
      let html = '';
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
      minify(imageFileList.getFilePaths(), function (error, results) {

        if (error) {
          throw error;
        }

        for (let result of results) {
          let item = imageFileList.get(result.path);

          // set optimized file size
          item.afterSize = result.afterSize;

          // update row
          let $tr = $('#' + item.id);
          $tr.find('.js-after-size').text(item.afterSizeText);
          $tr.find('.js-saving-percent').html(item.savingPercent);

          let $icon = $tr.find('.fa');
          $icon.removeClass('fa-spinner');
          $icon.removeClass('fa-spin');

          if (item.beforeSize === item.afterSize) {
            $icon.addClass('fa-times-circle');
          } else {
            $icon.addClass('fa-check');
          }
        }

        imageFileList.clear();
      });
    });
  });
});
