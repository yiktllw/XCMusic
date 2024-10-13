const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack'); // 引入 webpack 以使用 DefinePlugin 插件

module.exports = defineConfig({
    transpileDependencies: true,
    outputDir: 'dist_electron',
    pluginOptions: {
        electronBuilder: {
            preload: 'preload.js',
            builderOptions: {
                win: {
                    icon: 'src/assets/icons/icon.ico'
                },
                mac: {
                    icon: 'src/assets/icons/icon.png'
                },
                linux: {
                    icon: 'src/assets/icons/icon.png'
                }
            },
        },
    },
    configureWebpack: {
        // 添加 DefinePlugin 插件来定义 Vue 的特性标志
        plugins: [
            new webpack.DefinePlugin({
                __VUE_OPTIONS_API__: JSON.stringify(true), // 启用 Options API
                __VUE_PROD_DEVTOOLS__: JSON.stringify(false), // 禁用生产环境中的 Vue DevTools
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false), // 禁用生产环境的 hydration mismatch 错误详细信息
            }),
        ],
        resolve: {
            alias: {
                '@': require('path').resolve(__dirname, 'src'), // 将 @ 指向 src 目录
            },
            extensions: ['.js', '.vue', '.json'] // 确保 .js 扩展名会被解析
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/\.vue$/],  // 为 vue 文件增加 .ts 处理
                            happyPackMode: true,
                        },
                    },
                },
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-typescript'],
                            plugins: ['@babel/plugin-proposal-nullish-coalescing-operator'],
                        },
                    },
                },
                {
                    test: /\.m?js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: ['@babel/plugin-proposal-nullish-coalescing-operator'],
                        },
                    },
                },
            ],
        },
        devServer: {
            port: 4321,
            host: 'localhost',
            proxy: {
                '/search': {
                    target: 'http://localhost:10754',
                    changeOrigin: true,
                    pathRewrite: {
                        '^/search': '/search'
                    }
                },
            },
        }
    },
});