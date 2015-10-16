'use strict';

const ImageFileList = require('./js/image-file-list');
const TransferItemResolver = require('./js/transfer-item-resolver');
const minifyImage = require('./js/minify-image');

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const ipc  = require('ipc');
const Mustache = require('mustache');

let imageFileList = new ImageFileList();

document.addEventListener('DOMContentLoaded', e => {

  const resultTemplate = document.querySelector('#template-result-item');
  const resultList = document.querySelector('#js-result-list');

  document.querySelector('#js-open').addEventListener('click', e => ipc.send('select-path'));
  document.querySelector('#js-again').addEventListener('click', e => minifySelectedImages());

  let table = document.querySelector('.window-content');

  table.addEventListener('dragenter', e => table.classList.add('on-dragmove'));
  table.addEventListener('dragleave', e => table.classList.remove('on-dragmove'));

  table.addEventListener('dragover', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });

  table.addEventListener('drop', function (e) {

    // stop propagation for browser redirecting
    e.stopPropagation();
    e.preventDefault();

    table.classList.remove('on-dragmove');

    let items = e.dataTransfer.items;
    let itemResolver = new TransferItemResolver(items);
    itemResolver.resolve().then(files => {

      // when complete to fetch files and directories data
      for (let file of files) {
        imageFileList.add(file.path, {
          type: file.type,
          path: file.path,
          name: file.name,
          size: fs.statSync(file.path).size
        });
      }

      renderTable();
      minifySelectedImages();
    });
  });

  function renderTable() {
    let html = '';
    imageFileList.each(item => {
      html += Mustache.render(resultTemplate.innerHTML, {
        id: item.id,
        fileName: item.fileName,
        beforeSizeText: item.beforeSizeText,
        afterSizeText: '',
        savingPercent: ''
      });
    });
    resultList.innerHTML = html;
  }

  function minifySelectedImages() {

    imageFileList.each(item => {

      let tr = resultList.querySelector('#' + item.id);
      let icon = tr.querySelector('.js-icon');
      icon.classList.remove('icon-check');
      icon.classList.remove('icon-cancel');
      icon.classList.add('icon-dot-3');

      minifyImage(item.filePath)
        .then(files => {
          let file = files.shift();
          let item = imageFileList.get(file.path);
          item.afterSize = file.stat.size;

          let tr = resultList.querySelector('#' + item.id);
          tr.querySelector('.js-after-size').textContent = item.afterSizeText;
          tr.querySelector('.js-saving-percent').textContent = item.savingPercent;
          let icon = tr.querySelector('.js-icon');
          icon.classList.remove('icon-dot-3');

          if (item.beforeSize > item.afterSize) {
            icon.classList.add('icon-check');
          } else {
            icon.classList.add('icon-cancel');
          }
        })
        .catch(error => console.error(error));
    });
  }

  function onPathSelected(args) {

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
      }
    }

    renderTable();
    minifySelectedImages();
  }

  ipc.on('path-selected', onPathSelected);
});
