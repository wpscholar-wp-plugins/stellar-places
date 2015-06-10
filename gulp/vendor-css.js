'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var size = require('gulp-size');
var sound = require('mac-sounds');

module.exports = function (config) {

    return function () {

        return gulp.src(config.src)
            .pipe(plumber({
                errorHandler: function (err) {
                    sound('blow');
                    console.log(err);
                }
            }))
            .pipe(concat(config.filename || 'vendor.css'))
            .pipe(gulp.dest(config.dest))
            .pipe(size({showFiles: true}))
            .pipe(minify())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(config.dest))
            .pipe(notify(function () {
                sound('purr');
            }))
            .pipe(size({showFiles: true}));

    };

};