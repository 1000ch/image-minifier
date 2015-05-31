'use strict';

export default class {

  constructor(items = []) {
    this.items = items
  }

  resolve() {
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
  }
}
