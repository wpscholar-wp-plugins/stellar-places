'use strict';

var gulp = require('gulp');
var del = require('del');

module.exports = function (clean) {

    return function () {

        return del(clean);

    };

};