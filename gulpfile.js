/*!
 * Gulp SMPL Layout Builder
 *
 * @version 8.3.3
 * @author Artem Dordzhiev (Draft)
 * @type Module gulp
 * @license The MIT License (MIT)
 */

/* Get plugins */
const fs = require('fs');
const gulp = require('gulp');
const browserSync = require('browser-sync');
const glob = require('glob');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const gif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const rtlcss = require('gulp-rtlcss');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const del = require('del');
const mergeStream = require('merge-stream');
const spriteSmith = require('gulp.spritesmith');
const svgSprite = require('gulp-svg-sprite');
const webpack = require('webpack-stream');
const dotenv = require('dotenv');
const pkg = JSON.parse(fs.readFileSync('./package.json'));
const ENV = process.env;

/* Init environment */
dotenv.config();
if (!ENV.NODE_ENV) ENV.NODE_ENV = "development";

function getConfig(section) {
    const config = require(`./config.${ENV.NODE_ENV}.js`);
    return section ? config[section] ? config[section] : {} : config;
}

function getLocale(locale) {
    let json = {};
    if (locale) {
        const files = glob.sync(`./src/locales/${locale}/*.json`);
        if (files.length) files.forEach((file) => Object.assign(json, JSON.parse(fs.readFileSync(file))));
    }
    return json;
}

function flushModule(path, callback) {
    delete require.cache[require.resolve(path)];
    callback();
}

/* Primary tasks */
gulp.task('default', (done) => {
    gulp.series('build:production')(done)
});

gulp.task('serve', (done) => {
    gulp.series('clean', gulp.parallel('sprites', 'svgsprites'), gulp.parallel('sass', 'js'), 'pug', 'browsersync', 'watch')(done)
});

gulp.task('build', (done) => {
    gulp.series('clean:dist', gulp.parallel('sprites', 'svgsprites'), gulp.parallel('sass', 'js', 'copy:static'), 'pug')(done)
});

gulp.task('build:production', (done) => {
    ENV.NODE_ENV = "production";
    gulp.series('clean:dist', gulp.parallel('sprites', 'svgsprites'), gulp.parallel('sass', 'js', 'copy:static'), 'pug')(done)
});

/* Pug task */
gulp.task('pug', async () => {
    const streams = [];
    const config = getConfig('pug');
    const locale = ENV.FORCE_LOCALE || config.locale;
    const localeData = getLocale(locale);
    const pugOptions = Object.assign({}, {
        locals: {
            fs,
            "ENV": ENV,
            "NODE_ENV": ENV.NODE_ENV,
            "PACKAGE": pkg,
            "LOCALE": locale,
            "__": localeData,
            ...config.locals
        }
    }, config.pugOptions);

    if (config.fetch) pugOptions.locals.$$ = await config.fetch(pugOptions.locals, config);

    streams.push(new Promise((resolve) => {
        gulp.src(config.src)
            .pipe(plumber())
            .pipe(pug(pugOptions))
            .pipe(gif(!!config.ext, rename({extname: config.ext})))
            .pipe(gulp.dest(config.dest))
            .on('end', resolve);
    }));

    if (config.templates) {
        config.templates.forEach((template) => {
            const target = template.target;
            const inheritPugOptions = Object.assign({}, pugOptions, template.pugOptions);

            let arr = target.split('.').reduce((p, i) => p[i], inheritPugOptions.locals);
            if (!Array.isArray(arr)) arr = Object.keys(arr);

            arr.map((item) => {
                const key = template.key ? item[template.key] : item;
                const basename = template.basename ? template.basename.replace('$', key) : 'index';
                const dirname = template.dirname.replace('$', key);

                inheritPugOptions.locals.$ = key;

                streams.push(new Promise((resolve) => {
                    gulp.src(template.src)
                        .pipe(plumber())
                        .pipe(pug(inheritPugOptions))
                        .pipe(rename({basename, dirname}))
                        .pipe(gif(!!config.ext, rename({extname: config.ext})))
                        .pipe(gulp.dest(config.dest)).on('end', resolve);
                }));
            });
        });
    }

    await Promise.all(streams).then(() => browserSync.reload());
});

/* Sass task */
gulp.task('sass', () => {
    const config = getConfig('sass');

    return gulp.src(config.src)
        .pipe(gif(config.maps, sourcemaps.init()))
        .pipe(sass(config.sassOptions))
        .pipe(gif(config.autoprefixer, autoprefixer(config.autoprefixerOptions)))
        .pipe(gif(config.rtl, rtlcss()))
        .pipe(gif(config.cleanCss, cleanCss(config.cleanCssOptions)))
        .pipe(gif(config.maps, sourcemaps.write('.')))
        .pipe(gulp.dest(config.dest))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

/* JS (webpack) task */
gulp.task('js', () => {
    const config = getConfig('js');

    return gulp.src(config.src)
        .pipe(webpack(require(`./webpack.${ENV.NODE_ENV}.js`)))
        .pipe(gulp.dest(config.dest));
});

/* Icon tasks */
gulp.task('svgsprites', (done) => {
    const config = getConfig('svgsprites');

    return gulp.src(config.src)
        .pipe(svgSprite(config.svgSpriteOptions))
        .pipe(gulp.dest(config.dest));
});

gulp.task('sprites', async () => {
    const config = getConfig('sprites');
    const spriteData = gulp.src(config.src).pipe(spriteSmith(config.spriteSmithOptions));

    const imgStream = spriteData.img
        .pipe(gulp.dest(config.destImg));

    const cssStream = spriteData.css
        .pipe(gulp.dest(config.destCss));

    return mergeStream(imgStream, cssStream);
});

/* Browsersync Server */
gulp.task('browsersync', (done) => {
    const config = getConfig('browserSync');
    const options = Object.assign({}, {
        server: config.dest
    }, config);

    browserSync.init(options);
    done();
});

/* Watcher */
gulp.task('watch', () => {
    const config = getConfig('watch');

    gulp.watch(config.sass, gulp.series('sass'));
    gulp.watch(config.js, gulp.series('js'));
    gulp.watch(config.pug, gulp.series('pug'));
    gulp.watch(config.sprites, gulp.series('sprites'));
    gulp.watch(config.svgsprites, gulp.series('svgsprites'));

    if (config.watchConfig) {
        gulp.watch(`./config.${ENV.NODE_ENV}.js`,
            gulp.series((cb) => flushModule(`./config.${ENV.NODE_ENV}.js`, cb), 'js', 'pug')
        );
        gulp.watch(`./webpack.${ENV.NODE_ENV}.js`,
            gulp.series((cb) => flushModule(`./webpack.${ENV.NODE_ENV}.js`, cb), 'js')
        );
    }
});

/* FS tasks */
gulp.task('clean', () => {
    return del(['./tmp/**/*'], {dot: true});
});

gulp.task('clean:dist', () => {
    return del(['./dist/**/*'], {dot: true});
});

gulp.task('copy:static', () => {
    return gulp.src(['./src/static/**/*'], {dot: true})
        .pipe(gulp.dest('./dist/'));
});
