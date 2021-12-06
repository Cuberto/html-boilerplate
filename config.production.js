module.exports = {
    pug: {
        src: ['./src/pug/**/*.pug', '!./src/pug/_includes/**/*'],
        dest: "./dist/",
        locale: "en",
        ext: false,
        pugOptions: {
            basedir: "./src/pug/",
            pretty: false
        }
    },
    sass: {
        src: ['./src/scss/main.scss'],
        dest: "./dist/assets/css/",
        maps: false,
        autoprefixer: true,
        rtl: false,
        cleanCss: true,
        sassOptions: {
            includePaths: "node_modules"
        }
    },
    js: {
        src: ['./src/js/**/*'],
        dest: "./dist/assets/js",
        webpack: true
    },
    svgsprites: {
        src: './src/icons/*.svg',
        dest: "./dist/",
        svgSpriteOptions: {
            mode: {
                symbol: {
                    dest: "assets/img/sprites/",
                    sprite: "svgsprites.svg",
                    render: {
                        scss: {
                            dest: '../../../../src/scss/generated/svgsprites.scss',
                            template: "./src/scss/templates/svgsprites.handlebars"
                        }
                    }
                }
            }
        }
    },
    sprites: {
        src: './src/sprites/**/*.png',
        destImg: "./dist/assets/img/sprites/",
        destCss: './src/scss/generated',
        spriteSmithOptions: {
            imgPath: '../img/sprites/sprites.png',
            imgName: 'sprites.png',
            retinaImgPath: '../img/sprites/sprites@2x.png',
            retinaImgName: 'sprites@2x.png',
            retinaSrcFilter: ['./src/sprites/**/**@2x.png'],
            cssName: 'sprites.scss',
            cssTemplate: "./src/scss/templates/sprites.handlebars",
            padding: 1
        }
    },
    browserSync: {
        dest: "./dist",
        notify: false,
        ui: false,
        online: false,
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        }
    },
    watch: {
        sass: ["./src/scss/**/*.scss"],
        js: ["./src/js/**/*.*"],
        pug: ["./src/pug/**/*.pug", "./src/locales/**/*.json"],
        sprites: ["./src/sprites/**/*"],
        svgsprites: ["./src/icons/**/*.svg"],
        watchConfig: true
    }
};
