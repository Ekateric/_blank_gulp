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
const replace = require('gulp-replace')
const browserSync = require('browser-sync').create()

const BASIC_PATHS = {
	public: './public',
	backend: './backend',
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
	files: `${BASIC_PATHS.src}/files/**/*`,
	rootFiles: `${BASIC_PATHS.src}/root/**/*`
}

const PUBLIC_PATHS = {
	html: `${BASIC_PATHS.public}/`,
	img: `${BASIC_PATHS.public}/img/`,
	css: `${BASIC_PATHS.public}/css/`,
	js: `${BASIC_PATHS.public}/js/`,
	font: `${BASIC_PATHS.public}/font/`,
	files: `${BASIC_PATHS.public}/files/`
}

const BACKEND_PATHS = {
	html: `${BASIC_PATHS.backend}/`,
	img: `${BASIC_PATHS.backend}/img/`,
	css: `${BASIC_PATHS.backend}/css/`,
	js: `${BASIC_PATHS.backend}/js/`,
	font: `${BASIC_PATHS.backend}/font/`,
	files: `${BASIC_PATHS.backend}/files/`
}

const JSON_PATHS = {
	menu: `${SRC_PATHS.html}/data/menu.json`
}

const htmlOptions = {
	indent_size: 2,
	indent_char: ' ',
	end_with_newline: true,
	max_preserve_newlines: 1
}

//TASKS

//CLEAR
function clear(path) {
	return src(path, {
		read: false
	})
		.pipe(clean())
}

function clearPublic() {
	return clear(`${BASIC_PATHS.public}/*`)
}

function clearBackend() {
	return clear(`${BASIC_PATHS.backend}/*`)
}

//HTML
function html(destPath) {
	const source = `${SRC_PATHS.html}pages/**/*.html`
	
	return src([source])
		.pipe(data((file) => {
			return {
				'menu': JSON.parse(fs.readFileSync(JSON_PATHS.menu))
			}
		}))
		.pipe(twig())
		.pipe(htmlBeautify(htmlOptions))
		.pipe(dest(destPath))
}

function htmlPublic() {
	return html(PUBLIC_PATHS.html)
}

function htmlBackend(){
	return html(BACKEND_PATHS.html)
}

//JS
function js() {
	const source = `${SRC_PATHS.js}main.js`
	const b = browserify({
		entries: source,
		debug: true
	})
		.transform('babelify', {
			presets: [
				['@babel/preset-env', {
					'useBuiltIns': false,
				}],
			],
			plugins: ['@babel/plugin-transform-runtime']
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

function minJsPublic() {
	const source = `${PUBLIC_PATHS.js}bundle.js`
	
	return src(source)
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(uglify())
		.pipe(dest(PUBLIC_PATHS.js))
}

function minJsBackend() {
	const source = `${PUBLIC_PATHS.js}bundle.js`
	
	return src(source)
		.pipe(replace( 'img/', '/local/templates/whitelineRacketa/img/'))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(uglify())
		.pipe(dest(BACKEND_PATHS.js))
}


//CSS
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

function minCssPublic() {
	const source = `${PUBLIC_PATHS.css}main.css`
	
	return src(source)
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(cssnano())
		.pipe(dest(PUBLIC_PATHS.css))
}

function minCssBackend() {
	const source = `${PUBLIC_PATHS.css}main.css`
	
	return src(source)
		.pipe(replace( '../', ''))
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(cssnano())
		.pipe(dest(BACKEND_PATHS.css))
}


//IMAGES
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


//COPIES
function copyFonts() {
	return src([SRC_PATHS.font])
		.pipe(dest(PUBLIC_PATHS.font))
}

function copyFiles() {
	return src([SRC_PATHS.files])
		.pipe(dest(PUBLIC_PATHS.files))
}

function copyRootFiles() {
	return src([SRC_PATHS.rootFiles])
		.pipe(dest(PUBLIC_PATHS.html))
}

function copyFilesBackend() {
	return src([SRC_PATHS.font])
		.pipe(dest(BACKEND_PATHS.font))
		
		.pipe(src([SRC_PATHS.files]))
		.pipe(dest(BACKEND_PATHS.files))
		
		.pipe(src([SRC_PATHS.rootFiles]))
		.pipe(dest(BACKEND_PATHS.html))
		
		.pipe(src([`${PUBLIC_PATHS.img}**/*.*`]))
		.pipe(dest(BACKEND_PATHS.img))
}

function watchFiles() {
	watch(SRC_PATHS.html, series(htmlPublic, browserSyncReload))
	watch(SRC_PATHS.scss, series(css, browserSyncReload))
	watch(SRC_PATHS.js, series(js, browserSyncReload))
	watch(SRC_PATHS.svgSprite, series(svg, browserSyncReload))
	watch(SRC_PATHS.img, series(img, browserSyncReload))
	watch(SRC_PATHS.font, series(copyFonts, browserSyncReload))
	watch(SRC_PATHS.files, series(copyFiles, browserSyncReload))
	watch(SRC_PATHS.rootFiles, series(copyRootFiles, browserSyncReload))
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

const build = series(clearPublic, parallel(htmlPublic, js, css, svg, img, copyFonts, copyFiles, copyRootFiles))
const watching = parallel(build, watchFiles, browserSyncInit)
const publish = series(parallel(minCssPublic, minJsPublic))
const backend = series(clearBackend, parallel(htmlBackend, minJsBackend, minCssBackend, copyFilesBackend))

exports.build = build
exports.watch = watching
exports.publish = publish
exports.backend = backend
