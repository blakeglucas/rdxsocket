const path = require('path')

module.exports = {
    context: __dirname,
    entry: ['babel-polyfill', './src/index.js'],
    output : {
        path: path.resolve(__dirname, './build'),
        filename: 'index.js',
        library: '',
        libraryTarget: 'commonjs'
    },
    module: {
        loaders : [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
            {test: /\.(scss|css)$/, loader: 'style-loader!css-loader'},
            {test: /\.(eot|gif|jpg|jpeg|png|svg|ttf|woff|woff2)$/, loader: 'file-loader'},
        ]
    }
}