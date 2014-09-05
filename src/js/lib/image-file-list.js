(function (global) {

  var ACCEPT_FILE_TYPE = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml'
  ];

  function ImageFileList() {
    this.list = {};
  }

  ImageFileList.prototype.get = function (key) {
    return this.list[key];
  };

  ImageFileList.prototype.getFilePaths = function () {
    var paths = [];
    this.each(function (item) {
      paths.push(item.filePath);
    });
    return paths;
  };

  ImageFileList.prototype.add = function (key, file) {
    if (ACCEPT_FILE_TYPE.indexOf(file.type) !== -1) {
      this.list[key] = new ImageFileEntry(file.path, file.name, file.size);
    }
  };

  ImageFileList.prototype.remove = function (key) {
    delete this.list[key];
  };

  ImageFileList.prototype.clear = function () {
    var that = this;
    Object.keys(this.list).forEach(function (key) {
      delete that.list[key];
    });
  };

  ImageFileList.prototype.each = function (callback) {
    var that = this;
    Object.keys(this.list).forEach(function (key) {
      callback(that.list[key]);
    });
  };

  global.ImageFileList = ImageFileList;

})(this);