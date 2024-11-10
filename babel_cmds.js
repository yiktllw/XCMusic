/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * 此脚本用于将 node_modules 中的 js 文件转换为 es6 语法
*-----------------------------------------*/

const { exec } = require('child_process');

const commands = [
    'npx babel ./node_modules/socks-proxy-agent/dist/index.js --out-file ./node_modules/socks-proxy-agent/dist/index.js',
    'npx babel ./node_modules/get-uri/dist/ftp.js --out-file ./node_modules/get-uri/dist/ftp.js',
    'npx babel ./node_modules/degenerator/dist/compile.js --out-file ./node_modules/degenerator/dist/compile.js',
    'npx babel ./node_modules/@tootallnate/quickjs-emscripten/dist/index.js --out-file ./node_modules/@tootallnate/quickjs-emscripten/dist/index.js',
    'npx babel ./node_modules/pac-proxy-agent/node_modules/https-proxy-agent/dist/index.js --out-file ./node_modules/pac-proxy-agent/node_modules/https-proxy-agent/dist/index.js',
    'npx babel ./node_modules/@tootallnate/quickjs-emscripten/dist/variants.js --out-file ./node_modules/@tootallnate/quickjs-emscripten/dist/variants.js',
    'npx babel ./node_modules/pac-proxy-agent/node_modules/http-proxy-agent/dist/index.js --out-file ./node_modules/pac-proxy-agent/node_modules/http-proxy-agent/dist/index.js',
    'npx babel ./node_modules/get-uri/dist/data.js --out-file ./node_modules/get-uri/dist/data.js',
    'npx babel ./node_modules/@tootallnate/quickjs-emscripten/dist/module-test.js --out-file ./node_modules/@tootallnate/quickjs-emscripten/dist/module-test.js',
    'npx babel ./node_modules/@tootallnate/quickjs-emscripten/dist/runtime.js --out-file ./node_modules/@tootallnate/quickjs-emscripten/dist/runtime.js',
    'npx babel ./node_modules/@tootallnate/quickjs-emscripten/dist/context.js --out-file ./node_modules/@tootallnate/quickjs-emscripten/dist/context.js',
    'npx babel ./node_modules/socks-proxy-agent/node_modules/agent-base/dist/index.js --out-file ./node_modules/socks-proxy-agent/node_modules/agent-base/dist/index.js',
    'npx babel ./node_modules/pac-proxy-agent/node_modules/agent-base/dist/index.js --out-file ./node_modules/pac-proxy-agent/node_modules/agent-base/dist/index.js',
    'npx babel ./node_modules/@tootallnate/quickjs-emscripten/dist/esmHelpers.js --out-file ./node_modules/@tootallnate/quickjs-emscripten/dist/esmHelpers.js',
]

// 逐条执行命令
commands.forEach((command, index) => {
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(`执行命令 "${command}" 失败: ${stderr}`);
            return;
        }
        console.log(`执行成功: ${index + 1} / ${commands.length}`);
    });
});