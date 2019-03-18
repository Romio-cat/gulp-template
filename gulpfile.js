const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const del = require('del');
const gulpIf = require('gulp-if');
const debug = require('gulp-debug');
const changed = require('gulp-changed');
const autoprefixer = require('gulp-autoprefixer');
const remember = require('gulp-remember');
const path = require('path');
const browserSync = require('browser-sync').create();

const paths = {
    styles: 'src/styles/style.scss',
    scripts: ['src/scripts/*.ts'],
    pages: 'src/*.html',
    images: 'src/assets/**/*',
    asserts: 'src/assets/**/*'
};

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function serve() {
    browserSync.init({
        server: './public'
    });

    browserSync.watch('*.html')
        .on('change', browserSync.reload);

    browserSync.watch('public/**/*.*')
        .on('change', browserSync.reload);
}

function clean() {
    return del('public');
}

function assets() {
    return gulp.src(paths.asserts, { since: gulp.lastRun('assets') })
        .pipe(changed('public/assets'))
        // .pipe(debug({ title: 'assets' }))
        .pipe(gulp.dest('public/assets'));
}

function html() {
    return gulp.src(paths.pages, { since: gulp.lastRun('html') })
        .pipe(changed('public'))
        .pipe(gulp.dest('public'));
}

function styles() {
    return gulp.src(paths.styles, { since: gulp.lastRun('styles') })
        // .pipe(debug({title: 'scss'}))
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(sass())
        // .pipe(debug({title: 'css'}))
        .pipe(autoprefixer())
        .pipe(debug({title: 'autoprefixer'}))
        .pipe(remember('styles'))
        // .pipe(debug({title: 'remember'}))
        .on('error', sass.logError)
        // .pipe(concat('style.css'))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('public/styles'));
}

function scripts() {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/scripts/main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .transform('babelify', {
            presets: ['es2015'],
            extensions: ['.ts']
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(uglify())
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('public/scripts'));
}

gulp.task('clean', clean);

gulp.task('assets', assets);

gulp.task('html', html);

gulp.task('styles', styles);

gulp.task('scripts', scripts);

gulp.task('serve', serve);

gulp.task('watch', function() {
    gulp.watch('src/assets/**/*.*', gulp.series('assets'));
    gulp.watch('src/*.html', gulp.series('html'));
    gulp.watch('src/styles/**/*.*', gulp.series('styles'))
        .on('unlink', function(filepath) {
            remember.forget('styles', path.resolve(filepath));
        });
    gulp.watch('src/scripts/**/*.*', gulp.series('scripts'));
});

gulp.task('build',
    gulp.series('clean',
        gulp.parallel('assets', 'html', 'styles', 'scripts')
    )
);

gulp.task('dev',
    gulp.series('build',
        gulp.parallel('watch', 'serve')
    )
);


