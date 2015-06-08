var gulp = require('gulp'),
	less = require('gulp-less'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	imageop = require('gulp-image-optimization'),
	sprite = require('gulp-sprite-generator'),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	newer = require('gulp-newer'),
	watch = require('gulp-watch'),
	autoprefixer = require('gulp-autoprefixer');

var src = {
	css: 'src/css/style.less',
	js: ['src/js/main.js'],
	img: 'src/img/**/*'
};

//Compile Less
gulp.task('css', function () {
	return gulp.src(src.css)
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['> 5%'],
			cascade: false
		}))
		.pipe(gulp.dest('css'));
});

//Minify Css
gulp.task('minCss', function () {
	return gulp.src('css/style.css')
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('css'));
});

//Concat js
gulp.task('js', function() {
	return gulp.src(src.js)
		.pipe(newer('js/main.js'))
		.pipe(concat('main.js'))
		.pipe(gulp.dest('js'))
});

//Minify & uglify Js
gulp.task('minJs', function() {
	return gulp.src('js/main.js')
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('js'));
});

//Compress images
gulp.task('img', function(cb) {
	gulp.src(src.img)
		.pipe(newer('img'))
		.pipe(imageop({
			optimizationLevel: 5,
			progressive: true,
			interlaced: true
		})).pipe(gulp.dest('img')).on('end', cb).on('error', cb);
});

//Generate sprite
gulp.task('sprite', function() {
	var spriteOutput;
	spriteOutput = gulp.src('src/css/**/*.less')
		.pipe(sprite({
			baseUrl:         './',
			spriteSheetName: "sprite.png",
			spriteSheetPath: "../img/icons/sprite",
			styleSheetName:  "sprite.less",
			padding: 5
		}));
	spriteOutput.css.pipe(gulp.dest("src/css/less"));
	spriteOutput.img.pipe(gulp.dest("src/img/icons/sprite"));
});

// Clean destination folders
gulp.task('clean', function() {
	return gulp.src(['css', 'js', 'img'], {read: false})
		.pipe(clean());
});

//Watch
gulp.task('watch', function() {
	gulp.watch('src/css/**/*.less', ['css']);
	gulp.watch('src/js/**/*.js', ['js']);
	gulp.watch('src/css/sprite.less', ['sprite']);
});

// Default task
gulp.task('default', ['clean'], function() {
	gulp.start('css', 'js', 'img');
});