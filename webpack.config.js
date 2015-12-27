module.exports = {
    entry: "./src/js/index.js",
    output: {
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.html$/, loader: 'html-loader' }
        ]
    }
};