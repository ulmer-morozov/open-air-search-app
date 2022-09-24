const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

module.exports = [new ForkTsCheckerWebpackPlugin()
    // , new CspHtmlWebpackPlugin({
    //     'frame-src': ' https://www.github.com/'
    // })

];
