'use strict';

import generateId from './generate-id';

export default class ImageFileEntry {

  constructor(filePath, fileName, beforeSize) {
    this.id = generateId();
    this.filePath = filePath;
    this.fileName = fileName;
    this.beforeSize = beforeSize;
    this.afterSize = 0;
  }

  get beforeSizeText() {
    return String(this.beforeSize).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }

  get afterSizeText() {
    return String(this.afterSize).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }

  get savingPercent() {
    var diff = this.beforeSize - this.afterSize;
    var percent = diff / this.beforeSize;
    return ((Math.floor(10 * percent) * 100 / 10) || 0.0) + '<span class="unit">%</span>';
  }
}
