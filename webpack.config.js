var webpack = require('webpack');

module.exports = {
    entry: {
        SwipeBase: './src/SwipeBase.js'
    },

    output: {
        path: __dirname + '/dist',
        filename: '[name].js'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'stage-0']
                }
            }
        ]
    },

    plugins: [ new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }) ]
};
