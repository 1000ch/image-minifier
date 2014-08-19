'use strict';

var async = require('async');
var fs = node('fs');
var path = node('path');
var PNGO = node('pngo');

module.exports = function (files, callback) {

  var array = [];

  async.each(files, function (file, i, next) {

    fs.readFile(file.path, function (error, buffer) {
      if (error) {
        return next(error);
      }
      var pngo = new PNGO(file.path);
      pngo.optimize(function (e, data) {
        if (e) {
          next(e);
        }
        array.push({
          path: file.path,
          original: buffer.length,
          dest: data.contents.length
        });
        next();
      });
    });

  }, function (error) {

    if (error) {
      return callback(error);
    }
    callback(null, array)

  });
};