(function (global) {

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

  global.DataTransferItemResolver = DataTransferItemResolver;

})(this);