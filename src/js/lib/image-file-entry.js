(function (global) {

  var filesize = node('filesize');

  function ImageFileEntry(filePath, fileName, beforeSize) {
    this.id = generateId();
    this.filePath = filePath;
    this.fileName = fileName;
    this.beforeSize = beforeSize;
    this.afterSize = 0;
  }

  Object.defineProperty(ImageFileEntry.prototype, 'beforeSizeText', {
    get: function () {
      return String(this.beforeSize).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }
  });

  Object.defineProperty(ImageFileEntry.prototype, 'afterSizeText', {
    get: function () {
      return String(this.afterSize).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    }
  });

  Object.defineProperty(ImageFileEntry.prototype, 'savingPercent', {
    get: function () {
      var diff = this.beforeSize - this.afterSize;
      var percent = diff / this.beforeSize;
      return ((Math.floor(10 * percent) * 100 / 10) || 0.0) + '<span class="unit">%</span>';
    }
  });

  global.ImageFileEntry = ImageFileEntry;

})(this);
