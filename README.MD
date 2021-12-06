## Quick start

### Setup

Make sure you have Node v.11 or above installed.

```
npm install
```

Copy `.env.default` to `.env` if it exists.


### Production

To build an optimized version of the application in `/dist/` use command:

```
gulp build:production
```

or just use shortcut:

```
gulp
```

### Development

Deploy the app and start the middleware server with live reload:

```
gulp serve
```

### Basic configuration

Build settings located in `config.development.js` and `config.production.js`.

Webpack configuration located in `webpack.development.js` and `webpack.production.js`.

The locale can be switched using the `pug.locale` parameter in build config and can override with `FORCE_LOCALE` environment variable.

The configuration files can be switched using the `NODE_ENV` environment variable.

### File structure

```bash
├── /dist/                      # Production directory (minified, optimized and compiled files)
└── /src/                       # The source code of the application
    ├── /icons/                 # SVG icons
    ├── /js/                    # JavaScript source
    ├── /locales/               # JSON localizations strings
    ├── /pug/                   # Pug templates
        └── /_includes/         # Pug partials
    ├── /scss/                  # SCSS styles
        └── /templates/         # SCSS templates for generator tasks (icons, sprites, etc..)
        └── /generates/         # Generated styles
    ├── /sprites/               # Sprite raster images
    ├── /static/                # Root of static files (fonts, images, videos, etc..)
├── /tmp/                       # Temporary served files
├── .env                        # Environment variables
├── .editorconfig               # IDE style configuration
├── babel.config                # Babel config
├── config.development.js       # Development build configuration
├── config.production.js        # Production build configuration
├── webpack.development.js      # Webpack development configuration
├── webpack.production.js       # Webpack production configuration
├── package.json                # Project meta and dependencies
```

### Gulp tasks

`gulp serve` deploy the app and start middleware server with live reload

`gulp build` build the app in `/dist/` with current environment

`gulp build:production` build the app to `/dist/` with force production environment

`gulp pug` compile Pug files

`gulp sass` compile Sass files

`gulp js` build JS with Webpack + Babel

`gulp sprites` make spritesheet based on sprites in `/src/sprites/`

`gulp svgsprite` make svg spritesheet based on icons in `/src/icons/`

`gulp copy:static` copy static files from `/src/static/` to `/dist/`

`gulp browsersync` start browser sync server

`gulp watch` start watching stream

`gulp clean` remove temporary files

`gulp clean:dist` clean directory `/dist/`

## Advanced configuration

### HTML

Boilerplate use [Pug](https://pugjs.org/) as an HTML Preprocessor.

The following options are available in the build configuration:

| parameter | type | description |
| :--- | :---: | :--- |
| `locale` | `string` | default locale |
| `ext` | `string` | extension of `.html` files  |
| `pugOptions` | `object` | [compiler options](https://pugjs.org/api/reference.html) |
| `fetch` | `function` | callable to fetch external data |
| `templates` | `array` | templates map |

The following constants are available in each template:

| variable | type | description |
| :--- | :---: | :--- |
| `__` | `object` | current locale data |
| `$$` | `object` | fetched data (only if use fetch) |
| `ENV` | `object` | environment variables |
| `NODE_ENV` | `string` | current `NODE_ENV` |
| `PACKAGE` | `object` | `package.json` contents |
| `LOCALE` | `string` | current locale |
| `$` | `string` | current page key (only in templates) |

#### Locales

All locales should be stored in `./src/locales/{LANG}/*.json`.

Builder merges all `.json` files from current locale directory into one object, and you can access it from `__` constant in each template.

The locale can be switched using `locale` parameter in build config and can override with `FORCE_LOCALE` environment variable.

#### Fetch

Builder can receive additional dynamic data to generate pages using `fetch`. This implements a simple Jamstack architecture and "Static Site Generation".

Callable function can be async.

The received data will be available in `$$` constant in each pug template.

**Example**:

```javascript
const axios = require('axios');

const fetchBackendData = async(locals, config) => {
    return new Promise((resolve, reject) => {
        axios.get(`https://api.example.com/posts/`).then((response) => {
            resolve(response.data);
        });
    })
};

module.exports = {
    // ..... //
    pug: {
        src: ['./src/pug/**/*.pug', '!./src/pug/_includes/**/*'],
        dest: "./tmp/",
        locale: "en",
        ext: false,
        fetch: fetchBackendData
    }
    // .... //
}
```

#### Templates

The builder can dynamically generate pages based on any object (locales, fetched data, array, etc..).

| variable | type | description |
| :--- | :---: | :--- |
| `src` | `string` | template path |
| `target` | `any` | iterable target |
| `key` | `string` | iterable target key (optional) |
| `dirname` | `string` | destination directory (`$` - replaced with a current key) |
| `basename` | `string` | destination filename (`$` - replaced with a current key) |

**Examples**:

```javascript
// Generate posts from array
templates: [
    {
        src: "./src/pug/_includes/templates/post.pug",
        target: [
            {
                "id": 1,
                "title": "Post #1"
            },
            {
                "id": 2,
                "title": "Post #2"
            }
        ],
        key: "id",
        dirname: "posts/$",
        basename: "index"
    }
]
```

```javascript
// Generate posts from locales
templates: [
    {
        src: "./src/pug/_includes/templates/post.pug",
        target: "__.posts",
        key: "id",
        dirname: "posts/$",
        basename: "index"
    }
]
```

```javascript
// Generate posts from fetched data
fetch: fetchBackendData,
templates: [
    {
        src: "./src/pug/_includes/templates/post.pug",
        target: "$$.posts",
        key: "id",
        dirname: "posts/$",
        basename: "index"
    }
]
```

```javascript
// Generate posts from array
templates: [
    {
        src: "./src/pug/_includes/templates/post.pug",
        target: [1,3,4,5],
        dirname: "tutorials",
        basename: "$"
    }
]
```

### Styles

Boilerplate use [Sass](https://sass-lang.com/) as an CSS Preprocessor.

[Autoprefixer](https://github.com/postcss/autoprefixer), [clean-css](https://github.com/jakubpawlowicz/clean-css) and [RTLCSS](https://github.com/MohammadYounes/rtlcss) (disabled by default in config) is also included. Clean-css disabled by default in the development environment to increase assembly speed.

Entrypoint by default: `./src/scss/main.scss`.

The following options are available in the build configuration:

| parameter | type | description |
| :--- | :---: | :--- |
| `maps` | `boolean` | use [Sourcemap](https://www.npmjs.com/package/gulp-sourcemaps) |
| `autoprefixer` | `boolean` | use [Autoprefixer](https://github.com/postcss/autoprefixer)  |
| `rtl` | `boolean` | use [RTLCSS](https://github.com/MohammadYounes/rtlcss) |
| `cleanCss` | `boolean` | use [clean-css](https://github.com/jakubpawlowicz/clean-css) |
| `sassOptions` | `object` | [node-sass options](https://github.com/sass/node-sass#options) |
| `cleanCssOptions` | `object` | [clean-css options](https://github.com/jakubpawlowicz/clean-css#constructor-options) |
| `autoprefixerOptions` | `object` | [Autoprefixer options](https://github.com/postcss/autoprefixer#options) |

### SVG Sprites

All svg icons should be stored in `./src/icons/`.

Make sure the shapes do not use a `fill` property, so that you can dynamically change the color in css.

To directly compile svg spritesheet use command:

```
gulp svgsprite
```

Spritesheet stored in:

`{WORKDIR}/assets/img/sprites/svgsprites.svg`.

Svg sprites also generated scss:

`./src/scss/generated/svgsprites.scss`

Make sure to include it in `./src/scss/main.scss`.

To use icon in Pug use mixin:

```jade
+svgicon("ICON_NAME", insertinline = true | false)
```

### Sprites

All sprites should be stored in `./src/sprites/`. `@2x (retina)` icons also supported.

To directly compile png spritesheet use command:

```
gulp sprites
```

Spritesheet stored in:

`{WORKDIR}/assets/img/sprites/sprites.png`.

`{WORKDIR}/assets/img/sprites/sprites@2x.png`.

Sprites also generated scss:

`./src/scss/generated/svgsprites.scss`

Make sure to include it in `./src/scss/main.scss`.

To use sprites in pug:

```jade
.my-sprite.-NAME
```

### JS

All javascript proceeds with [webpack](https://webpack.js.org/) + [Babel](https://babeljs.io/).

Webpack config localed in `./webpack.{NODE_ENV}.js`.

Babel config located in `./babel.config.js`.

Entrypoint, by default: `./src/js/app.js`.

To directly compile js use command:

```
gulp js
```

[Read webpack docs](https://webpack.js.org/concepts/).

[Read Babel docs](https://babeljs.io/docs/en/).

### Browsersync

Browsersync creates a small server for local development with live reloading. If Browsersync detects changes in code, it makes a local rebuild and reloads the page (complete or partial).

To start a project on a local web server with enabled livereload services use command:

```
gulp serve
```

To start the server without building the project, use the command:

```
gulp browsersync
```

In build configuration you can configure browsersync options.

[See Browsersync options](https://browsersync.io/docs).
