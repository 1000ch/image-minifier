'use strict';

import ImageFileEntry from './image-file-entry';

const ACCEPT_FILE_TYPE = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml'
];

export default class {

  constructor() {
    this.list = {};
  }

  get(key) {
    return this.list[key];
  }

  getFilePaths() {
    let paths = [];
    this.each(function(item) {
      paths.push(item.filePath);
    });
    return paths;
  }

  add(key, file) {
    if (ACCEPT_FILE_TYPE.indexOf(file.type) !== -1) {
      this.list[key] = new ImageFileEntry(file.path, file.name, file.size);
    }
  }

  remove(key) {
    delete this.list[key];
  }

  clear() {
    Object.keys(this.list).forEach((key) => {
      delete this.list[key];
    });
  }

  each(callback = function() {}) {
    Object.keys(this.list).forEach((key) => {
      callback(this.list[key]);
    });
  }
}
