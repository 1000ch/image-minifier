const Imagemin  = require('imagemin');
const jpegoptim = require('imagemin-jpegoptim');
const mozjpeg   = require('imagemin-mozjpeg');
const pngquant  = require('imagemin-pngquant');
const pngcrush  = require('imagemin-pngcrush');
const zopfli    = require('imagemin-zopfli');

module.exports = (fileList) => {

  let imagemin = new Imagemin();
  imagemin.use(jpegoptim({ progressive: true }));
  imagemin.use(mozjpeg({ quality: 80 }));
  imagemin.use(pngquant({ quality: '65-80', speed: 4 }));
  imagemin.use(pngcrush({ reduce: true }));
  imagemin.use(Imagemin.gifsicle({ interlaced: true }));
  imagemin.use(Imagemin.svgo());

  return new Promise((resolve, reject) => {
    imagemin.src(fileList).run((error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
};
