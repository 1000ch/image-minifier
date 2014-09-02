(function () {

  var object = {};
  var array = [];

  // native aliases
  var toString = object.toString;
  var forEach = array.forEach;
  var filter = array.filter;
  var push = array.push;

  // selector filter
  var CONCISE_SELECTOR_FIILTER = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/;

  function Coral(arg) {
    var elements = [];
    if (toString.call(arg) === '[object String]') {
      var m = CONCISE_SELECTOR_FIILTER.exec(arg);
      if (m) {
        if (m[1]) {
          //if selector is "#id"
          elements.push(document.getElementById(m[1]));
        } else if (m[2]) {
          //if selector is "tagName"
          elements = document.getElementsByTagName(m[2]);
        } else if (m[3]) {
          //if selector is ".className"
          elements = document.getElementsByClassName(m[3]);
        }
      } else {
        elements = document.querySelectorAll(arg);
      }
    } else if (arg.length !== undefined) {
      elements = filter.call(arg, function (element) {
        return (element.nodeType === Node.ELEMENT_NODE || element.nodeType === Node.DOCUMENT_NODE);
      });
    } else if (arg.nodeType === Node.ELEMENT_NODE || arg.nodeType === Node.DOCUMENT_NODE) {
      elements.push(arg);
    }

    this.length = elements.length;
    for (var i = 0;i < this.length;i++) {
      this[i] = elements[i];
    }
  }

  Coral.prototype.each = Coral.prototype.forEach = forEach;

  Coral.prototype.find = function (selector) {

    var method = 'querySelectorAll';
    var m = CONCISE_SELECTOR_FIILTER.exec(selector);
    if (m) {
      if (m[1]) {
        //if selector is "#id"
        method = 'querySelector';
      } else if (m[2]) {
        //if selector is "tagName"
        method = 'getElementsByTagName';
      } else if (m[3]) {
        //if selector is ".className"
        method = 'getElementsByClassName';
      }
    }

    var found = [];
    this.each(function () {
      var elements = this[method](selector);
      if (elements.length !== undefined) {
        push.apply(found, elements);
      } else {
        found.push(elements);
      }
    });

    return new $(found);
  };

  Coral.prototype.addClass = function (className) {
    forEach.call(this, function (element) {
      element.classList.add(className);
    });

    return this;
  };

  Coral.prototype.removeClass = function (className) {
    forEach.call(this, function (element) {
      element.classList.remove(className);
    });

    return this;
  };

  window.Coral = Coral;
  window.$ = function (arg) {
    return new Coral(arg);
  };

})();