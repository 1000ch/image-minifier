(function (global) {

  var fs = node('fs');
  var async = node('async');
  var IMGO = node('imgo');
  
  function minifyImage(filePaths, callback) {
    var array = [];
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

  global.minifyImage = minifyImage;

})(this);