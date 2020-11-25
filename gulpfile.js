const {
	src,
	dest,
	parallel,
	series,
	watch
} = require('gulp')

const uglify = require('gulp-uglify-es').default
const browserify = require('browserify')
const vinylSource = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const log = require('gulplog')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const cssnano = require('gulp-cssnano')
const clean = require('gulp-clean')
const svgSprite = require('gulp-svg-sprite')
const imagemin = require('gulp-imagemin')
const changed = require('gulp-changed')
const fs = require('fs')
const twig = require('gulp-twig')
const data = require('gulp-data')
const htmlBeautify = require('gulp-html-beautify')
const browserSync = require('browser-sync').create()

const BASIC_PATHS = {
	public: './public',
	src: './src',
	maps: './maps'
}

const SRC_PATHS = {
	html: `${BASIC_PATHS.src}/html/`,
	components: `${BASIC_PATHS.src}/html/components/*.html`,
	img: `${BASIC_PATHS.src}/img/**/*.*`,
	scss: `${BASIC_PATHS.src}/scss/`,
	js: `${BASIC_PATHS.src}/js/`,
	svgSprite: `${BASIC_PATHS.src}/img/svg-sprite-icons/*.*`,
	font: `${BASIC_PATHS.src}/font/**/*`,
	files: `${BASIC_PATHS.src}/files/**/*`
}

const PUBLIC_PATHS = {
	html: `${BASIC_PATHS.public}/`,
	img: `${BASIC_PATHS.public}/img/`,
	css: `${BASIC_PATHS.public}/css/`,
	js: `${BASIC_PATHS.public}/js/`,
	font: `${BASIC_PATHS.public}/font/`,
	files: `${BASIC_PATHS.public}/files/`
}

const JSON_PATHS = {
	menu: `${SRC_PATHS.html}/data/menu.json`
}

const htmlOptions = {
	indent_size: 2,
	indent_char: " ",
	end_with_newline: true,
	max_preserve_newlines: 1
}

function clear() {
	return src(`${BASIC_PATHS.public}/*`, {
		read: false
	})
		.pipe(clean())
}

function html() {
	const source = `${SRC_PATHS.html}pages/**/*.html`
	
	return src([source])
		.pipe(data((file) => {
			return {
				'menu': JSON.parse(fs.readFileSync(JSON_PATHS.menu))
			}
		}))
		.pipe(twig())
		.pipe(htmlBeautify(htmlOptions))
		.pipe(dest(PUBLIC_PATHS.html))
}

function js() {
	const source = `${SRC_PATHS.js}main.js`
	const b = browserify({
		entries: source,
		debug: true
	})
		.transform('babelify', {
			presets: ['babel-preset-env'],
			plugins: ['babel-plugin-transform-runtime']
		})
	
	return b.bundle()
		.pipe(vinylSource('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.on('error', log.error)
		.pipe(sourcemaps.write('.'))
		.pipe(dest(PUBLIC_PATHS.js))
		.pipe(browserSync.stream())
}

function minJs() {
	const source = `${PUBLIC_PATHS.js}bundle.js`
	
	return src(source)
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(uglify())
		.pipe(dest(PUBLIC_PATHS.js))
}

function css() {
	const source = `${SRC_PATHS.scss}main.scss`
	
	return src(source)
		.pipe(changed(PUBLIC_PATHS.css))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 versions'],
			cascade: false
		}))
		.pipe(sourcemaps.write(BASIC_PATHS.maps))
		.pipe(dest(PUBLIC_PATHS.css))
		.pipe(browserSync.stream())
}

function minCss() {
	const source = `${PUBLIC_PATHS.css}main.css`
	
	return src(source)
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(cssnano())
		.pipe(dest(PUBLIC_PATHS.css))
}

function svg() {
	return src(SRC_PATHS.svgSprite)
		.pipe(
			svgSprite({
				shape: {
					spacing: {
						padding: 0
					}
				},
				mode: {
					view: {
						bust: false,
						sprite: 'sprite.view.svg',
						dest: 'svg-sprite/'
					},
					symbol: {
						sprite: 'sprite.svg',
						dest: 'svg-sprite/'
					},
				},
			})
		)
		.pipe(dest(PUBLIC_PATHS.img))
}

function img() {
	return src(SRC_PATHS.img)
		.pipe(changed(PUBLIC_PATHS.img))
		.pipe(imagemin())
		.pipe(dest(PUBLIC_PATHS.img))
}

function copyFonts() {
	return src([SRC_PATHS.font])
		.pipe(dest(PUBLIC_PATHS.font))
}

function copyFiles() {
	return src([SRC_PATHS.files])
		.pipe(dest(PUBLIC_PATHS.files))
}


function watchFiles() {
	watch(SRC_PATHS.html, series(html, browserSyncReload))
	watch(SRC_PATHS.scss, series(css, browserSyncReload))
	watch(SRC_PATHS.js, series(js, browserSyncReload))
	watch(SRC_PATHS.svgSprite, series(svg, browserSyncReload))
	watch(SRC_PATHS.img, series(img, browserSyncReload))
	watch(SRC_PATHS.font, series(copyFonts, browserSyncReload))
	watch(SRC_PATHS.files, series(copyFiles, browserSyncReload))
}

function browserSyncInit(doneCallback) {
	browserSync.init({
		server: {
			baseDir: BASIC_PATHS.public
		},
		host: 'localhost',
		port: 3000
	})
	
	doneCallback()
}

function browserSyncReload(doneCallback) {
	browserSync.reload()
	doneCallback()
}

const build = series(clear, parallel(html, js, css, svg, img, copyFonts, copyFiles))
const watching = parallel(build, watchFiles, browserSyncInit)
const publish = series(parallel(minCss, minJs))

exports.build = build
exports.watch = watching
exports.publish = publish
