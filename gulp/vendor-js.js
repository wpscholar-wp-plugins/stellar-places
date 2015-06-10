'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var size = require('gulp-size');
var sound = require('mac-sounds');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

module.exports = function (config) {

    return function () {

        return gulp.src(config.src)
            .pipe(plumber({
                errorHandler: function (err) {
                    sound('blow');
                    console.log(err);
                }
            }))
            .pipe(concat(config.filename || 'vendor.js'))
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(config.dest))
            .pipe(size({showFiles: true}))
            .pipe(uglify())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(config.dest))
            .pipe(notify(function () {
                sound('glass');
            }))
            .pipe(size({showFiles: true}));

    };

};