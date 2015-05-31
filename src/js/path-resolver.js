'use strict';

export default class PathResolver {

  constructor(paths = []) {
    this.paths = paths;
  }

  getFileSystem() {
    return new Promise(function (resolve, reject) {
      window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 5, function (fileSystem) {
        resolve(fileSystem);
      }, function (fileError) {console.log(fileError);
        reject(fileError);
      });
    });
  }

  resolve() {
    var that = this;
    var forEach = Array.prototype.forEach;
    var endsWith = function (value, position) {
      return (this.lastIndexOf(value, position) === (position >= 0 ? position | 0 : this.length - 1));
    };

    return new Promise(function (resolve, reject) {

      that.getFileSystem().then(function (fileSystem) {
        var promises = [];
        forEach.call(that.paths, function (path) {
          if (endsWith.call(path, '.png') || endsWith.call(path, '.jpg') ||
            endsWith.call(path, '.gif') || endsWith.call(path, '.svg')) {
            promises.push(new Promise(function (res, rej) {
              fileSystem.root.getFile(path, {}, function (fileEntry) {console.log(fileEntry);
                fileEntry.file(function (file) {console.log(file);
                  res(file);
                });
              });
            }));
          } else {
            fileSystem.root.getDirectory(path, {}, function (directoryEntry) {
              directoryEntry.createReader().readEntries(function (fileEntries) {
                forEach.call(fileEntries, function (fileEntry) {
                  promises.push(new Promise(function (res, rej) {
                    fileEntry.file(function (file) {
                      res(file);
                    });
                  }));
                });
              });
            });
          }
        });

        Promise.all(promises).then(function (files) {
          resolve(files);
        });
      });
    });
  }
}
