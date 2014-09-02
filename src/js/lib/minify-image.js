(function (global) {

  var fs = node('fs');
  var async = node('async');
  var IMGO = node('imgo');
  
  function minifyImage(files, callback) {
    var array = [];
    async.each(files, function (file, next) {
      fs.readFile(file.path, function (error, buffer) {
        if (error) {
          return next(error);
        }
        new IMGO(file.path).optimize(function (e, data) {
          if (e) {
            next(e);
          }
          array.push({
            path: file.path,
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