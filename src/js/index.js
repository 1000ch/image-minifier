'use strict';

import ImageFileList from './image-file-list';
import TransferItemResolver from './transfer-item-resolver';

// node
const fs   = node('fs');
const path = node('path');
const mime = node('mime');
const ipc  = node('ipc');
const IMGO = node('imgo');
const Mustache = node('mustache');

let imageFileList = new ImageFileList();

document.addEventListener('DOMContentLoaded', e => {

  document.querySelector('#js-open').addEventListener('click', e => {
    ipc.send('asynchronous-message', 'open-file-dialog');
  });

  let table = document.querySelector('.window-content');

  table.addEventListener('dragenter', function (e) {
    table.classList.add('on-dragmove');
  });

  table.addEventListener('dragleave', function (e) {
    table.classList.remove('on-dragmove');
  });

  table.addEventListener('dragover', function (e) {
    // "default" prevents drop
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

      minify(imageFileList.getFilePaths())
        .then(results => updateTable(results))
        .catch(error => console.error(error));
    });
  });

  function minify(fileList) {
    return Promise.all(fileList.map(file => new IMGO(file).optimize()));
  }

  function renderTable() {
    let html = '';
    let result = document.querySelector('#template-result-item');
    let resultList = document.querySelector('#js-result-list');
    imageFileList.each(function (item) {
      html += Mustache.render(result.innerHTML, {
        id: item.id,
        fileName: item.fileName,
        beforeSizeText: item.beforeSizeText,
        afterSizeText: '',
        savingPercent: ''
      });
    });
    resultList.innerHTML = html;
  }

  function updateTable(results) {
    for (let result of results) {
      let item = imageFileList.get(result.file);
      // set optimized file size
      item.afterSize = result.after.size;

      // update row
      let tr = document.querySelector('#' + item.id);
      tr.querySelector('.js-after-size').textContent = item.afterSizeText;
      tr.querySelector('.js-saving-percent').textContent = item.savingPercent;
      let icon = tr.querySelector('.js-icon');
      icon.classList.remove('icon-dot-3');

      if (item.beforeSize > item.afterSize) {
        icon.classList.add('icon-check');
      } else {
        icon.classList.add('icon-cancel');
      }
    }
  }

  ipc.on('asynchronous-reply', args => {
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

    minify(imageFileList.getFilePaths())
      .then(results => updateTable(results))
      .catch(error => console.error(error));
  });
});
