const configs = [];
configs.push(
    Object.assign({}, require('./webpack.common.config.js'), {
        mode: 'production',
        output: {
            filename: 'index.js',
            path: __dirname + '/dist/',
            libraryTarget: 'umd', // TODO: Maybe Problematic place
        },
    }),
);
configs.push(
    Object.assign({}, require('./webpack.common.config.js'), {
        mode: 'production',
        output: {
            filename: 'main.browser.js',
            path: __dirname + '/dist/',
            libraryTarget: 'var',
            library: 'Everstorage',
        },
    }),
);

module.exports = configs;
