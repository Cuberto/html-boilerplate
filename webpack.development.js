const webpack = require('webpack');

module.exports = {
    entry: "./src/js/app.js",
    output: {
        path: __dirname,
        filename: "bundle.js",
        publicPath: "/assets/js/"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /(node_modules|bower_components)/,
                options: {
                    compact: true
                }
            },
            {
                test: /\.js$/,
                loader: 'imports-loader?define=>false'
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader',
                    'glslify-loader',
                ],
            }
        ]
    },
    resolve: {
        modules: ['./src/js', 'node_modules']
    },
    plugins: [
        new webpack.DefinePlugin({
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ],
    mode: "development",
    devtool: "eval-source-map"
};
