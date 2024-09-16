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

    // Load the NCM API.
    if (!portInUse){
        await server.serveNcmApi({
            port: 10754,
            moduleDefs: require('../ncmModDef'),
        });
    }
}