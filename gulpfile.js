"use strict";
/*
 Запустите: `  npm install `

Внимание! Эта сборка для gulp v4 и выше, для v3.9 возьмите другую

 Для начала работы и написания кода, нужно дать команду   ` gulp `


*Все, автообновление работает.
При редактировании любых файлов, браузер будет автоматически обновляться.*


 На JavaScript можно писать используя синтаксис ES6


 Команды для запуска:
- gulp dev     - осуществит сборку проекта для РАБОТЫ, с MAP-файлами
- gulp build   - осуществит сборку проекта для продакшена, появится папка "dist" уровнем выше (ее размещаем на хостинге)


 в папке `app` - находятся файлы для работы. Именно там их нужно РЕДАКТИРОВАТЬ !


*/
var path = {
    dist: {
        html:  'dist/',
        js:    'dist/js',
        css:   'dist/css',
        img:   'dist/img',
		imgwork: 'dist/images',
        fonts: 'dist/fonts',
		libs: 'dist/libs'
    },
    src: {
		html:  'app/*.html',
        js:    'app/js/*.js',
        scss: 'app/sass/**/*.scss',
		css:   'app/css/',
        img:   'app/img/**/*.*',
        imgwork:   'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    watch: {
        html:  'app/*.html',
        js:    'app/js/*.js',
        css:   'app/css/',
        img:   'app/img/**/*.*',
		imgwork:   'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean:     'dist'
};

/* подключаем gulp и плагины */
var gulp = require('gulp'), // подключаем Gulp
	sass = require('gulp-sass'), // модуль для компиляции SASS (SCSS) в CSS
	autoprefixer = require('autoprefixer'), // модуль для автоматической установки автопрефиксов
	postcss = require('gulp-postcss'),
	browserSync = require('browser-sync').create(), // сервер для работы и автоматического обновления страниц
	useref = require('gulp-useref'), //парсит специфичные блоки и конкатенирует описанные в них стили и скрипты.
	cache = require('gulp-cache'), // модуль для кэширования
	plumber = require('gulp-plumber'), // модуль для отслеживания ошибок
	uglify = require('gulp-uglify'), // модуль для минимизации JavaScript
	sourcemaps = require('gulp-sourcemaps'), // модуль для генерации карты исходных файлов
	cleanCSS = require('gulp-clean-css'), // плагин для минимизации CSS
	minifyCss = require('gulp-minify-css'),
	gulpif = require('gulp-if'),
	imagemin = require('gulp-imagemin'), // плагин для сжатия PNG, JPEG, GIF и SVG изображений
	jpegrecompress = require('imagemin-jpeg-recompress'), // плагин для сжатия jpeg
	pngquant = require('imagemin-pngquant'), // плагин для сжатия png
	del = require('del'),
	replace = require('gulp-string-replace'), //автозамена строк
	rigger = require('gulp-rigger'), // модуль для импорта содержимого одного файла в другой
	runSequence = require('run-sequence'),
	babel = require('gulp-babel'), //преобразование скриптов с поддержкой ES6
	removeHtmlComments = require('gulp-remove-html-comments'); //удаление комментариев в html-файлах


gulp.task('sass', function (cb) {
  return gulp.src(path.src.scss)
  .pipe(plumber()) // для отслеживания ошибок
   .pipe(sourcemaps.init()) // инициализируем sourcemap
   .pipe(sass()) // scss -> css
	.pipe(sourcemaps.write('./')) // записываем sourcemap
    .pipe(gulp.dest(path.src.css))  // выкладывание готовых файлов
	.pipe(browserSync.stream());
	cb();
});

gulp.task('sass:build', function (cb) {  
  return gulp.src(path.src.scss)
  .pipe(plumber()) // для отслеживания ошибок
   .pipe(sass()) // scss -> css
   .pipe(postcss([ autoprefixer() ]))
    .pipe(cleanCSS()) // минимизируем CSS
    .pipe(gulp.dest(path.src.css))  // выкладывание готовых файлов
	.pipe(browserSync.stream());
	cb();
});

gulp.task('build:delhtmlcomm', function (cb) { //удаляем комментрари в html 
  return gulp.src('dist/**/*.html')
    .pipe(removeHtmlComments())
    .pipe(gulp.dest('dist'));
	cb();
});

gulp.task('watch', function(cb) {
    browserSync.init({
        server: './app'  
    });
    gulp.watch('app/*.html').on('change',browserSync.reload);
    gulp.watch('app/sass/*.scss', gulp.series('sass')); //.on('change',browserSync.reload);
	gulp.watch('app/css/*.css', browserSync.reload);
    gulp.watch('app/js/**/*.js').on('change', browserSync.reload);
	cb();
});

gulp.task('useref', function (cb) { //сжатие всего остального
     gulp.src(path.src.html)
        .pipe(useref())  //парсит специфичные блоки и конкатенирует описанные в них стили и скрипты.
        .pipe(gulpif('*.css', minifyCss({processImport: false})))
        .pipe(gulp.dest('dist'));
	cb();
});


gulp.task('script', (cb) => {  //сжатие скриптов с поддержкой ES6
    return gulp.src('app/js/**/*')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.js))
		cb();
});

gulp.task('images', function (cb) {
    gulp.src(path.src.img) // путь с исходниками картинок
        .pipe(cache(imagemin([ // сжатие изображений
		    imagemin.gifsicle({interlaced: true}),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({plugins: [{removeViewBox: false}]})
		])))
        .pipe(gulp.dest(path.dist.img)); // выгрузка готовых файлов
		cb();
});


gulp.task('fonts', function () {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest(path.dist.fonts))
});

gulp.task('clean', function (cb) {
	del('dist');
	cb();
});

//gulp.task('default', gulp.series('sass','watch'));
gulp.task('dev', gulp.series('watch'));

gulp.task('build', gulp.series('clean', 'sass:build', 'useref', 'images', 'fonts', 'script', 'build:delhtmlcomm', function (done) {
    done();
}));