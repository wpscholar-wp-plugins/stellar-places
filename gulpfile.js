var gulp = require('gulp');
var shell = require('gulp-shell');
var plumber = require('gulp-plumber');
var del = require('del');
var sound = require('mac-sounds');
var argv = require('yargs').argv;

var config = {
    css: {
        src: [
            './src/css/stellar-places.css'
        ],
        dest: './assets/css',
        filename: 'stellar-places.css',
        watch: './src/css/*.css',
        clean: './assets/css/*'
    },
    js: {
        stellarPlacesMap: {
            src: './src/js/stellar-places-map.js',
            dest: './assets/js',
            filename: 'stellar-places-map.js',
            watch: './src/js/stellar-places-map.js',
            clean: './assets/js/stellar-places-map*js'
        },
        geoComplete: {
            src: './src/js/jquery.geocomplete.js',
            dest: './assets/js',
            filename: 'jquery.geocomplete.js',
            watch: './src/js/jquery.geocomplete.js',
            clean: './assets/js/jquery.geocomplete*js'
        }
    },
    svn: {
        url: 'https://plugins.svn.wordpress.org/stellar-places/',
        src: [
            './**',
            '!**/src',
            '!**/src/**',
            '!**/svn',
            '!**/svn/**',
            '!**/readme.md',
            '!**/package.json',
            '!**/node_modules',
            '!**/node_modules/**',
            '!**/bower.json',
            '!**/bower_components',
            '!**/bower_components/**',
            '!**/gulpfile.js',
            '!**/gulp',
            '!**/gulp/**',
            '!**/vendor',
            '!**/vendor/**',
            '!**/composer.json',
            '!**/composer.lock'
        ],
        dest: './svn/trunk',
        clean: './svn/trunk/**/*'
    }
};

// CSS
gulp.task('css:clean', require('./gulp/clean')(config.css.clean));
gulp.task('css:build', ['css:clean'], require('./gulp/vendor-css')(config.css));
gulp.task('css:watch', function () {
    gulp.watch(config.css.watch, ['css:build']);
});

// JS - stellar-places-map.js
gulp.task('js:clean:stellar-places-map', require('./gulp/clean')(config.js.stellarPlacesMap.clean));
gulp.task('js:build:stellar-places-map', ['js:clean:stellar-places-map'], require('./gulp/vendor-js')(config.js.stellarPlacesMap));
gulp.task('js:watch:stellar-places-map', function () {
    gulp.watch(config.js.stellarPlacesMap.watch, ['js:build:stellar-places-map']);
});

// JS - jquery.geocomplete.js
gulp.task('js:clean:geocomplete', require('./gulp/clean')(config.js.geoComplete.clean));
gulp.task('js:build:geocomplete', ['js:clean:geocomplete'], require('./gulp/vendor-js')(config.js.geoComplete));
gulp.task('js:watch:geocomplete', function () {
    gulp.watch(config.js.geoComplete.watch, ['js:build:geocomplete']);
});

gulp.task('clean', ['css:clean', 'js:clean:stellar-places-map', 'js:clean:geocomplete']);
gulp.task('build', ['css:build', 'js:build:stellar-places-map', 'js:build:geocomplete', 'freemius:copy']);
gulp.task('watch', ['css:watch', 'js:watch:stellar-places-map', 'js:watch:geocomplete']);

gulp.task('default', ['build', 'watch']);

// Freemius
gulp.task('freemius:update', function () {
    return gulp.src('*.js', {read: false}).pipe(shell(["composer update freemius/wordpress-sdk"]));
});

gulp.task('freemius:clean', ['freemius:update'], function () {
    return del('./includes/freemius/**/*');
});

gulp.task('freemius:copy', ['freemius:clean'], function () {
    return gulp.src('./vendor/freemius/wordpress-sdk/**/*').pipe(gulp.dest('./includes/freemius'));
});

// SVN
gulp.task('svn:checkout', shell.task('svn co ' + config.svn.url + ' svn'));

gulp.task('svn:clean', function () {
    return del(config.svn.clean);
});

gulp.task('svn:copy', ['svn:clean'], function () {
    return gulp.src(config.svn.src)
        .pipe(plumber({
            errorHandler: function (err) {
                sound('blow');
                console.log(err);
            }
        }))
        .pipe(gulp.dest(config.svn.dest));
});

gulp.task('svn:addremove', function () {
    return gulp.src('*.js', {read: false})
        .pipe(shell([
            "svn st | grep ^? | sed '\''s/?    //'\'' | xargs svn add",
            "'svn st | grep ^! | sed '\''s/!    //'\'' | xargs svn rm"
        ], {
            cwd: './svn'
        }))
});

gulp.task('svn:tag', function () {
    return gulp.src('*.js', {read: false})
        .pipe(shell([
            'svn cp trunk tags/' + argv.v
        ], {
            cwd: './svn'
        }))
});

gulp.task('project:build', ['svn:copy']);
