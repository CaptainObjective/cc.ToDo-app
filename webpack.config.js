const path = require('path');

module.exports = {
    mode: 'development',
    entry: './client/js/main.js',
    output: {
        publicPath: '/public',
        path: path.resolve(__dirname + '/public'),
        filename: 'bundle.js'
    },
    devtool: "#inline-source-map",
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [{
                test: /\.(js)$/,
                loaders: ['babel-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.(scss)$/,
                use: [{
                        loader: 'style-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        publicPath: './images',
                        outputPath: './images',
                        useRelativePaths: true
                    }
                }
            }
        ]
    }
};