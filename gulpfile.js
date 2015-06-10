var gulp = require('gulp');

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
gulp.task('build', ['css:build', 'js:build:stellar-places-map', 'js:build:geocomplete']);
gulp.task('watch', ['css:watch', 'js:watch:stellar-places-map', 'js:watch:geocomplete']);

gulp.task('default', ['build', 'watch']);