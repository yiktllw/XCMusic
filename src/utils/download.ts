import axios from 'axios';
const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');
import flac from 'flac-metadata';

export class Download {
    /**
     * 下载歌曲文件并保存到本地
     * @returns 下载的文件路径
     */
    static async song(songUrl: string, track: { name: string; ar: Array<object>; al: { name: string; picUrl: string; }; }, downloadDir: string): Promise<string> {
        if (!fs.existsSync(downloadDir)) {
            // throw new Error('Invalid download directory');
        }
        const name = sanitizeFileName(track.name);
        const artist = track.ar.map((ar: any) => ar.name).join('; ');
        const album = track.al.name;
        const coverUrl = track.al.picUrl;
        const url = songUrl.replace(/\?.*$/g, '');

        // 从 URL 中提取文件格式
        const fileExtension = path.extname(url).slice(1);  // 获取后缀并去掉前面的"."

        if (!['mp3', 'flac'].includes(fileExtension)) {
            throw new Error(`Unsupported file format: ${fileExtension}`);
        }

        // 创建一个临时文件路径
        let tempFilePath = path.join(downloadDir, `${name}-temp.${fileExtension}`);
        let outputFilePath = path.join(downloadDir, `${name}.${fileExtension}`);

        // 下载歌曲文件
        const writer = fs.createWriteStream(tempFilePath);
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream',
            family: 4, // 使用 IPv4
            timeout: 30000, // 设置超时时间为30秒
            onDownloadProgress(progressEvent) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
                console.log(`Downloading ${name}.${fileExtension}: ${percentCompleted}% completed`);
            },
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', async () => {
                fs.renameSync(tempFilePath, outputFilePath);
                // 如果文件是 mp3 或 flac，嵌入歌曲元数据
                if (fileExtension === 'mp3') {
                    let coverBuffer = null;
                    if (coverUrl) {
                        const coverResponse = await axios({
                            method: 'get',
                            url: coverUrl,
                            responseType: 'arraybuffer',
                            family: 4, // 使用 IPv4
                            timeout: 10000 // 设置超时时间为10秒
                        })
                        coverBuffer = Buffer.from(coverResponse.data);
                    }

                    const tags = {
                        title: name,
                        artist: artist,
                        album: album,
                        APIC: {
                            mime: 'image/jpeg',  // MIME 类型可以是 'image/jpeg' 或 'image/png'
                            type: 3,             // 3 代表封面图像
                            description: 'Cover',
                            imageBuffer: coverBuffer
                        }  // APIC 用于封面图片
                    };

                    NodeID3.write(tags, outputFilePath);
                    resolve(outputFilePath);
                }
                // 如果文件是 flac，嵌入歌曲元数据
                else if (fileExtension === 'flac') {
                    const vendor = "reference libFLAC 1.2.1 20070917"; // 可选的供应商信息
                    const comments = [
                        `ARTIST=${artist}`,
                        `TITLE=${name}`,
                        `ALBUM=${album}`,
                    ];

                    const reader = fs.createReadStream(outputFilePath);
                    const writer = fs.createWriteStream(outputFilePath.replace('.flac', '-updated.flac'));
                    const processor = new flac.Processor();

                    let mdbVorbis: any;

                    processor.on("preprocess", function (mdb) {
                        // 移除现有的 VORBIS_COMMENT 块（如果存在）
                        if (mdb.type === flac.Processor.MDB_TYPE_VORBIS_COMMENT) {
                            mdb.remove();
                        }
                        // 准备将新的 VORBIS_COMMENT 块作为最后一个元数据块添加
                        if (mdb.isLast) {
                            mdb.isLast = false;
                            mdbVorbis = flac.data.MetaDataBlockVorbisComment.create(true, vendor, comments);
                        }
                    });

                    processor.on("postprocess", function (this: flac.Processor, mdb) {
                        if (mdbVorbis) {
                            // 将新的 VORBIS_COMMENT 块作为最后一个元数据块添加
                            this.push(mdbVorbis.publish());
                        }
                    });

                    reader.pipe(processor).pipe(writer);

                    writer.on('finish', () => {
                        // 如果目标文件存在，先删除
                        if (fs.existsSync(outputFilePath)) {
                            fs.unlinkSync(outputFilePath);
                        }
                        // 替换原始文件为更新后的文件
                        fs.renameSync(outputFilePath.replace('.flac', '-updated.flac'), outputFilePath);
                        resolve(outputFilePath);
                    });

                    writer.on('error', (err: any) => {
                        console.error('Error writing FLAC metadata:', err);
                    });
                }

                resolve(outputFilePath);
            });
            writer.on('error', reject);
        });
    }
}

/**
 * 对文件名进行合法化处理，替换掉 Windows 不允许的字符
 * @param fileName 原始文件名
 * @returns 合法的文件名
 */
function sanitizeFileName(fileName: string): string {
    // 替换掉 Windows 系统不允许的字符，如 \ / : * ? " < > |
    return fileName.replace(/[\\/:*?"<>|]/g, '-');
}