// 引入 gulp
var gulp = require('gulp'); 

// 引入组件
// var jshint = require('gulp-jshint');
// var sass = require('gulp-ruby-sass');
// var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
// var rename = require('gulp-rename');
// var livereload = require('gulp-livereload');
var webpack = require('gulp-webpack');
var mcss = require('./lib/gulp-mcss.js');
var minifyCss = require('gulp-minify-css');
var webpackConfig = require('./webpack.config.js');
var browserSync = require('browser-sync').create();

var mode = 'default', //build模式
    opt = {
        distBase: './public', //部署目标目录
        cleanFiles: [ //部署目标目录需要清理的文件夹及文件
            'js/', 'css/', 'image/', 'fonts/', '*.html', '*.json'
        ]
    };

// 合并，压缩js文件
// gulp.task('scripts', function() {
//     gulp.src('./src/js/*.js')
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('./dist'))
//         .pipe(rename('all.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('./dist'));
// });

// gulp.task('watch', function () {
//     var server = livereload();
//     // app/**/*.*的意思是 app文件夹下的 任何文件夹 的 任何文件
//     gulp.watch('./**/*.*', function (file) {
//         server.changed(file.path);
//     });
// });

// 静态服务器
// gulp.task('browser-sync', function() {
//     browserSync.init({
//         server: {
//             baseDir: "./"
//         }
//     });
// });

// 代理
gulp.task("serve", ["webpack", "mcss"], function() {
    browserSync.init({
        proxy: "http://127.0.0.1:3001",
        ui: {
            port: 3011
        }
    });
    gulp.watch(['src/js/**'], ['webpack']);
    gulp.watch(['src/mcss/**'], ['mcss']);
    gulp.watch(['src/**']).on('change',browserSync.reload);
});

// webpack
gulp.task('webpack', function () {
    gulp.src('./src/js/index.js')
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('./public/javascripts'));
});

// MCSS编译
gulp.task('mcss', function () {
    var stream = gulp.src('./src/mcss/index.mcss')
        .pipe(mcss({
            pathes: ['./node_modules'],
            importCSS: true,
        }));
    if (mode === 'online') {
        stream.pipe(minifyCss())
            .pipe(gulp.dest(opt.distBase + '/stylesheets'));
    } else {
        stream.pipe(gulp.dest(opt.distBase + '/stylesheets'));
    }
    return stream;
});

//监视任务，在开发阶段在文件更改时自动运行任务
gulp.task('watch', function () {
    // gulp.watch(['src/assets/**'], ['copy']);
    // gulp.watch(['src/js/**'], ['webpack']);
    // gulp.watch(['src/mcss/**'], ['mcss']);
});

gulp.task('default', ['serve']);