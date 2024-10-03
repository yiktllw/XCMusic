module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset',
        '@babel/preset-typescript',
    ],
    plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-nullish-coalescing-operator',  
        '@babel/plugin-proposal-optional-chaining',
    ],
}
