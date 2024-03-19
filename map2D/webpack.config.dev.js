let path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './src/main'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
    },
    mode: "development",
    devtool: "source-map", // 开启调试
    module: {
        rules: [
            {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/}
        ]
    },
    devServer: {
        //输出的端口
        port: '80',

        //dev-server引用的静态文件的路径,在此我们使用output打包编译过的文件
        contentBase: path.join(__dirname, "./public"),

        //所有url都指向index.html
        historyApiFallback: true,

        // 在编译过程中有错误，给予窗口提示
        overlay: {
            errors: true
        }
    },
    performance: {},
    resolve: {
        extensions: [".js"]
    },
    plugins: [new HtmlWebpackPlugin({                              // 构建html文件
        filename: './index.html',
        template: './public/index.html',
        inject: false
    })]
}
