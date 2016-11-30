import path from 'path';

module.exports = {
    entry: {
        main: './target/main.js'
    },
    output: {
        path: path.join(__dirname, 'resources/js/'),
        publicPath: '../resources/js/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].bundle.js'
    }
};