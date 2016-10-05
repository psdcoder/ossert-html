const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const del = require('del');
const path = require('path');
const fs = require('fs');
const bs = require('browser-sync').create();
const webpackStream = require('webpack-stream');

const ENVS = {
    PROD: 'production',
    DEV: 'development'
};
const EXTS_TO_FREEZE = 'jpg|jpeg|png|svg|css|js';
const SRC_DIR = path.join(__dirname, 'src');
const BUILD_DIR = 'build';
const BLOCKS_DIR = path.join(SRC_DIR, 'blocks');
const POSTCSS_DIR = path.join(SRC_DIR, 'postcss');
const JS_MAIN = path.join(SRC_DIR, 'main.js');
const PATHS = {
    VENDORS: path.join(SRC_DIR, 'vendors', '*.*'),
    COMMON: path.join(SRC_DIR, 'common', '**', '*.pcss'),
    MIXINS: path.join(SRC_DIR, 'mixins', '**', '*.pcss'),
    BLOCKS: path.join(SRC_DIR, '**', '*.pcss'),
    BLOCKS_ASSETS: path.join(BLOCKS_DIR, '**', '*.*(svg|jpeg|jpeg|png|gif)'),
    BLOCKS_JS: path.join(BLOCKS_DIR, '**', '*.js'),
    ROOT_HTML: path.join(SRC_DIR, '*.html'),
    POSTCSS: path.join(POSTCSS_DIR, '*.js'),
    SVG_SPRITE: path.join(BLOCKS_DIR, 'icon', 'icons-sprite.svg')
};
let svgSprite = loadSvgSprite(PATHS.SVG_SPRITE);

gulp.task('env:set-prod', function (fn) {
    process.env.NODE_ENV = ENVS.PROD;
    fn();
});

gulp.task('env:set-dev', function (fn) {
    process.env.NODE_ENV = ENVS.DEV;
    fn();
});

gulp.task('clean', function () {
    return del(BUILD_DIR);
});

gulp.task('blocks:styles', function () {
    return gulp.src([PATHS.VENDORS, PATHS.COMMON, PATHS.MIXINS, PATHS.BLOCKS])
        .pipe($.plumber({ errorHandler: notifyOnErrorFactory('CSS')}))
        .pipe($.sourcemaps.init())
        .pipe($.postcss([
            require('postcss-mixins'),
            require('postcss-simple-vars')({
                variables: require(path.join(POSTCSS_DIR, 'css-vars'))
            }),
            require('postcss-nested'),
            require('postcss-custom-media')({
                extensions: require(path.join(POSTCSS_DIR, 'css-media'))
            }),
            require('postcss-media-minmax'),
            require('postcss-utilities'),
            require('postcss-color-function'),
            require('postcss-easings'),
            require('postcss-calc'),
            require('autoprefixer')
        ]))
        .pipe($.remember('css-remember'))
        .pipe($.rewriteCss({ destination: SRC_DIR }))
        .pipe($.concat('styles.css'))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('blocks:assets', function () {
    return gulp.src([PATHS.BLOCKS_ASSETS, `!${PATHS.SVG_SPRITE}`], { base: SRC_DIR })
        .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Blocks assets')}))
        .pipe($.newer(BUILD_DIR))
        .pipe(gulp.dest(BUILD_DIR))
});

gulp.task('blocks:js', function () {
    return gulp.src(JS_MAIN)
        .pipe(webpackStream({
            output: {
                filename: '[name].js',
            },
            resolve: { extensions: ['', '.js', '.jsx', '.json']},
            module: {
                loaders: [
                    { test: /\.js$/, loader: 'babel' }
                ]
            },
            devtool: 'source-map'
        }))
        .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('html', function () {
    return gulp.src(PATHS.ROOT_HTML)
        .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Html')}))
        .pipe($.replace('<!-- svgSprite -->', svgSprite))
        .pipe(gulp.dest(BUILD_DIR))
});

gulp.task('revision:hash', function () {
    return gulp.src(path.join(BUILD_DIR, '**', '*.*(' + EXTS_TO_FREEZE + ')'))
        .pipe($.rev())
        .pipe($.revDeleteOriginal())
        .pipe(gulp.dest(BUILD_DIR))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('revision:replace', function () {
    return gulp.src(path.join(BUILD_DIR, '**', '*.*(html|css)'))
        .pipe($.revReplace({ manifest: gulp.src(path.join(BUILD_DIR, 'rev-manifest.json')) }))
        .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('watch', function () {
    gulp.watch([PATHS.VENDORS, PATHS.COMMON, PATHS.MIXINS, PATHS.BLOCKS], gulp.parallel('blocks:styles', 'lint:styles')).on('unlink', function (filePath) {
        const resolvedFilePath = path.resolve(filePath);
        $.remember.forget('css-remember', resolvedFilePath);

        if ($.cached && $.cached.caches && $.caches['css-cached']) {
            delete $.cached.caches['css-cached'][resolvedFilePath];
        }
    });
    gulp.watch([JS_MAIN, PATHS.BLOCKS_JS], gulp.series('blocks:js'));
    gulp.watch([PATHS.BLOCKS_ASSETS, `!${PATHS.SVG_SPRITE}`], gulp.series('blocks:assets'));
    gulp.watch(PATHS.ROOT_HTML, gulp.series('html'));
    gulp.watch(PATHS.POSTCSS).on('change', function (path) {
        delete require.cache[path];
        gulp.series('blocks:styles', 'lint:styles')();
    });
    gulp.watch(PATHS.SVG_SPRITE).on('change', function (path) {
        loadSvgSprite(path, function (data) {
            svgSprite = data;
            gulp.series('html')();
        });
    })
});

gulp.task('serve', function () {
    bs.init({ server: BUILD_DIR });
});

gulp.task('serve:watch', function () {
    bs.init({
        server: BUILD_DIR
    });
    bs.watch(BUILD_DIR).on('change', bs.reload);
});

gulp.task('lint:styles', function () {
    return gulp
        .src(PATHS.BLOCKS)
        .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Lint:styles')}))
        .pipe($.stylelint({ reporters: [{ formatter: 'string', console: true }]}));
});

function notifyOnErrorFactory(title) {
    return $.notify.onError(err => ({ title: title, message: err.message }));
}

function loadSvgSprite(path, cb) {
    if (cb) {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            cb(data);
        });
    } else {
        return fs.readFileSync(path, 'utf8');
    }
}

function isEnv(env) {
    return process.env.NODE_ENV === env;
}


gulp.task('default', gulp.series('clean', gulp.parallel('blocks:styles', 'lint:styles', 'blocks:assets', 'blocks:js'), 'html'));
gulp.task('prod', gulp.series('env:set-prod', 'default', 'revision:hash', 'revision:replace'));
gulp.task('prod:serve', gulp.series('env:set-prod', 'default', 'revision:hash', 'revision:replace', 'serve'));
gulp.task('dev', gulp.series('env:set-dev', 'default', gulp.parallel('watch', 'serve:watch')));
gulp.task('dev:serve', gulp.series('env:set-dev', 'default', 'serve'));
