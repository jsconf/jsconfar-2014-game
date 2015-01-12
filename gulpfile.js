var gulp = require('gulp')
, fs = require('fs')
, uglify = require("gulp-uglify")
, concat = require("gulp-concat");

gulp.task('build', function () {
    gulp.src([
            './game/libs/underscore-min.js',
            './game/libs/phaser.min.js',
            './game/js/globals.js',
            './game/js/utilities.js',
            './game/js/player.management.js',
            './game/js/player.controls.js',
            './game/js/player.collisions.js',
            './game/js/teammates.js',
            './game/js/enemy.types.js',
            './game/js/enemies.js',
            './game/js/scene.js',
            './game/js/preload.js',
            './game/js/create.js',
            './game/js/game.js',
            './game/js/connection.js'])
    .pipe(concat('attack_of_the_drones.js'))
    .pipe(gulp.dest('./game/dist/'));
    .pipe(uglify({preserveComments:'some'}))
    .pipe(concat('attack_of_the_drones.min.js'))
    .pipe(gulp.dest('./game/dist/'));
});

gulp.task('default', ['build']);
