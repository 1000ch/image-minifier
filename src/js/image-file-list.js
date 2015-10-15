'use strict';

import ImageFileEntry from './image-file-entry';
const EventEmitter = require('events').EventEmitter;

const ACCEPT_FILE_TYPE = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml'
];

export default class ImageFileList extends EventEmitter {

  constructor() {
    super();
    this.map = new Map();
  }

  get(key) {
    return this.map.get(key);
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
      this.map.set(key, new ImageFileEntry(file.path, file.name, file.size));
      this.emit('add');
    }
  }

  remove(key) {
    this.map.delete(key);
    this.emit('remove');
  }

  clear() {
    this.map.clear();
  }

  each(callback = function() {}) {
    this.map.forEach((value, key) => callback(value));
  }
}
