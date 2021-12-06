module.exports = {
	pug: {
        src: ['./src/pug/**/*.pug', '!./src/pug/_includes/**/*'],
		dest: "./tmp/",
		locale: "en",
		ext: false,
		pugOptions: {
            basedir: "./src/pug/",
			pretty: false
		}
	},
    sass: {
        src: ['./src/scss/main.scss'],
        dest: "./tmp/assets/css/",
        maps: true,
        autoprefixer: true,
        rtl: false,
        cleanCss: false,
        sassOptions: {
            includePaths: "node_modules"
        }
    },
    js: {
        src: ['./src/js/**/*'],
        dest: "./tmp/assets/js",
        webpack: true
    },
    svgsprites: {
        src: './src/icons/*.svg',
        dest: "./tmp/",
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
        destImg: "./tmp/assets/img/sprites/",
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
        dest: ["./tmp", "./src/static"],
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
