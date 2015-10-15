'use strict';

export default class PathResolver {

  constructor(paths = []) {
    this.paths = paths;
  }

  getFileSystem() {
    return new Promise((resolve, reject) => {
      window.webkitRequestFileSystem(
        window.TEMPORARY,
        1024 * 1024 * 5,
        fileSystem => resolve(fileSystem),
        fileError => reject(fileError)
      );
    });
  }

  resolve() {
    const forEach = Array.prototype.forEach;
    const endsWith = (value, position) => {
      return (this.lastIndexOf(value, position) === (position >= 0 ? position | 0 : this.length - 1));
    };

    return new Promise((resolve, reject) => {

      this.getFileSystem().then(fileSystem => {
        let promises = [];
        forEach.call(this.paths, path => {
          if (endsWith.call(path, '.png') || endsWith.call(path, '.jpg') ||
            endsWith.call(path, '.gif') || endsWith.call(path, '.svg')) {
            promises.push(new Promise((res, rej) => {
              fileSystem.root.getFile(path, {}, fileEntry => {
                fileEntry.file(file => res(file));
              });
            }));
          } else {
            fileSystem.root.getDirectory(path, {}, directoryEntry => {
              directoryEntry.createReader().readEntries(fileEntries => {
                forEach.call(fileEntries, fileEntry => {
                  promises.push(new Promise((res, rej) => {
                    fileEntry.file(file => res(file));
                  }));
                });
              });
            });
          }
        });

        Promise.all(promises).then(files => resolve(files));
      });
    });
  }
}
