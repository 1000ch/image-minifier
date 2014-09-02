(function (global) {

  var PREFIX = 'imgo';
  var number = 0;
  
  function generateId() {
    return PREFIX + number++;
  }

  global.generateId = generateId;

})(this);