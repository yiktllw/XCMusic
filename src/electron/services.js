// From YesPlayMusic

import clc from 'cli-color';
import server from 'NeteaseCloudMusicApi/server';
import net from 'net';

async function isPortInUse(port) {
    return new Promise((resolve, reject) => {
        const tester = net.createServer()
            .once('error', (err) => (err.code === 'EADDRINUSE' ? resolve(true) : reject(err)))
            .once('listening', () => tester.once('close', () => resolve(false)).close())
            .listen(port);
    });
}

export async function startNeteaseMusicApi() {
    // Let user know that the service is starting
    console.log(`${clc.redBright('[NetEase API]')} initiating NCM API`);

    let portInUse = await isPortInUse(10754);

    // 保存原始的 console.log
    const originalConsoleLog = console.log;

    // 重写 console.log 方法
    console.log = function (...args) {
        // 将所有参数转换为字符串，并连接成一个完整的消息字符串
        let message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');

        // 如果字符串中包含 "cookie="，则将其后面的内容替换为 "INVISIBLECOOKIE"
        message = message.replace(/cookie=[^&]+/g, 'cookie=INVISIBLECOOKIE');

        // 调用原始的 console.log 方法输出处理后的消息
        originalConsoleLog(message);
    };

    // Load the NCM API.
    if (!portInUse) {
        await server.serveNcmApi({
            port: 10754,
            moduleDefs: require('../ncmModDef'),
        });
    }
}