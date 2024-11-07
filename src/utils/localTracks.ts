/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * localTracks.ts 为主进程中，处理本地音乐的工具
 * 封装了以下功能：
 * 1. 扫描指定目录，获取本地歌曲
*-----------------------------------------*/

import fs from 'fs';
import path from 'path';
import musicMetadata from 'music-metadata';

export async function scanMusicDirectory(dirPath: string) {
    const musicFiles: any[] = [];

    // 读取目录中的所有文件
    const files = fs.readdirSync(dirPath);

    // 过滤出常见音频格式的文件
    const audioFiles = files.filter(file =>
        /\.(mp3|flac|wav|ogg|m4a)$/i.test(file)
    );

    for (const file of audioFiles) {
        const filePath = path.join(dirPath, file);

        // 解析文件元数据
        try {
            const metadata = await musicMetadata.parseFile(filePath);
            musicFiles.push({
                name: file,
                path: filePath,  // 添加文件路径
                title: metadata.common.title || 'Unknown Title',
                artist: metadata.common.artist || 'Unknown Artist',
                album: metadata.common.album || 'Unknown Album',
                duration: metadata.format.duration || 0,
            });
        } catch (err) {
            console.error(`Error reading metadata for ${file}:`, err);
        }
    }

    return musicFiles;
}