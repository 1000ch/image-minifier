'use strict';

export default class TransferItemResolver {

  constructor(items = []) {
    this.items = items
  }

  resolve() {
    let promises = [];
    const forEach = Array.prototype.forEach;

    forEach.call(this.items, item => {
      let entry = item.webkitGetAsEntry();
      if (entry.isFile) {
        promises.push(new Promise((resolve, reject) => {
          entry.file(file => resolve(file));
        }));
      } else if (entry.isDirectory) {
        entry.createReader().readEntries(fileEntries => {
          forEach.call(fileEntries, fileEntry => {
            promises.push(new Promise((resolve, reject) => {
              fileEntry.file(file => resolve(file));
            }));
          });
        });
      }
    });

    return Promise.all(promises);
  }
}
