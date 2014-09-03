(function (global) {

  var filesize = node('filesize');

  function ImageFileEntry(file) {
    this.id = generateId();
    this.file = file;
    this.beforeSize = this.file.size;
    this.afterSize = 0;
  }

  Object.defineProperty(ImageFileEntry.prototype, 'fileName', {
    get: function () {
      return filesize(this.file.name);
    }
  });

  Object.defineProperty(ImageFileEntry.prototype, 'beforeSizeText', {
    get: function () {
      return filesize(this.beforeSize);
    }
  });

  Object.defineProperty(ImageFileEntry.prototype, 'afterSizeText', {
    get: function () {
      return filesize(this.afterSize);
    }
  });

  Object.defineProperty(ImageFileEntry.prototype, 'savingPercent', {
    get: function () {
      var diff = this.beforeSize - this.afterSize;
      var percent = diff / this.beforeSize;
      return (Math.floor(10 * percent) / 10) || 0.0;
    }
  });

  global.ImageFileEntry = ImageFileEntry;

})(this);