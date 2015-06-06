'use strict';

const fs = node('fs');
const async = node('async');
const IMGO = node('imgo');

export default function(filePaths, callback) {
  let array = [];
  async.each(filePaths, function (filePath, next) {
    fs.readFile(filePath, function (error, buffer) {
      if (error) {
        return next(error);
      }
      new IMGO(filePath).optimize(function (e, data) {
        if (e) {
          next(e);
        }
        array.push({
          path: filePath,
          beforeSize: data.beforeSize,
          afterSize: data.afterSize
        });
        next();
      });
    });
  }, function (error) {
    if (error) {
      callback(error);
    }
    callback(null, array);
  });
}
