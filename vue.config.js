const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    transpileDependencies: true,
    outputDir: 'dist_electron',
    pluginOptions: {
        electronBuilder: {
            preload: 'preload.js',
        },
    },
    configureWebpack: {
        module: {
            rules: [
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
                }
            },
        }
    },
});