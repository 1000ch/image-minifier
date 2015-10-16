'use strict';

const PREFIX = 'imgo';
let number = 0;

module.exports = () => `${PREFIX}${number++}`;
