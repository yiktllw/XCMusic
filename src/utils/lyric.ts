/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * lyric.ts 为渲染进程中，处理歌词的工具
 * 封装了以下功能：
 * 1. 解析YRC歌词(逐字歌词)
 * 2. 解析LRC歌词(逐行歌词)
*-----------------------------------------*/

interface YrcItem {
    startTime: number;
    duration?: number;
    words: Array<any>;
}

export class Lyrics {
    #allowTypes = [
        'yrc',
        'lrc',
    ]
    lyrics: any[] | undefined;
    /**
     * 从api返回的歌词数据中解析歌词
     * @param {Object} params
     * @param {string} params.type 歌词类型
     * @param {string} params.data 歌词内容
     */
    constructor({
        type,
        data,
    }: { type: string; data: string; }) {
        if (!this.#allowTypes.includes(type)) {
            console.error('Unsupported lyric type:', type, 'Supported types:', this.#allowTypes);
        } else {
            if (type === 'yrc') {
                this.lyrics = Lyrics.parseYRC(data);
            } else if (type === 'lrc') {
                this.lyrics = Lyrics.parseLRC(data);
            }
        }
    }
    /**
     * 解析YRC歌词
     * @param {string} yrc 
     * @returns {Array} 返回解析后的歌词数组
     */
    static parseYRC(yrc: string): Array<any> {
        const lines = yrc.split('\n');  // 将yrc内容按行分割
        const lyrics: YrcItem[] = [{
            startTime: 0,
            duration: 0,
            words: [
                { startTime: 0, duration: 0, text: '' },
            ],
        }];

        for (const line of lines) {
            // 解析时间轴和逐字歌词
            const timestampMatch = line.match(/^\[([0-9]+),([0-9]+)\]/);
            const textMatch = line.match(/\((\d+),(\d+),\d+\)([^(]+)/g);

            if (timestampMatch) {
                // 提取起始时间和持续时间
                const startTime = parseInt(timestampMatch[1]);
                const duration = parseInt(timestampMatch[2]);

                // 解析逐字歌词
                const wordEntries = [];
                if (textMatch) {
                    for (const text of textMatch) {
                        const match = text.match(/\((\d+),(\d+),\d+\)(.+)/);
                        if (!match) {
                            return [];
                        }
                        let [, start, length, char] = match;
                        wordEntries.push({
                            startTime: parseInt(start),
                            duration: parseInt(length),
                            text: char
                        });
                    }
                }

                lyrics.push({
                    startTime,
                    duration,
                    words: wordEntries,
                });
            } else {
                try {
                    const obj = JSON.parse(line);
                    lyrics.push({
                        startTime: obj.t,
                        words: obj.c.map((item: any) => ({ text: item.tx })),
                    });
                } catch (e) {
                    // 忽略解析错误行
                    console.log('Error parsing line of yrc:', line);
                }
            }
        }

        return lyrics;
    }
    /**
     * 解析LRC歌词
     * @param {string} lrc LRC歌词
     * @returns {Array} 返回解析后的歌词数组
     */
    static parseLRC(lrc: string): Array<any> {
        // 将LRC文件按行分割
        const lines = lrc.split('\n');
        // 存储解析结果的数组
        const lyrics = [
            {
                startTime: 0,
                content: '',
            }
        ];

        // 遍历每一行LRC文件内容
        lines.forEach(line => {
            // 尝试将当前行解析为 JSON 格式
            try {
                const jsonData = JSON.parse(line);
                // 如果成功解析为 JSON 格式，则将其添加到结果数组
                if (jsonData && typeof jsonData === 'object') {
                    lyrics.push({
                        startTime: jsonData.t,
                        content: jsonData.c
                    });
                    return; // 继续处理下一行
                }
            } catch (e) {
                // 解析失败则继续按 LRC 格式处理
            }

            // 匹配 LRC 时间戳（例如 [00:24.000]）
            const timestampRegex = /\[(\d+):(\d+)\.(\d+)\]/;
            const match = line.match(timestampRegex);

            if (match) {
                // 提取时间戳的分钟、秒钟和毫秒
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]);

                // 将时间戳转换为毫秒
                const timeInMillis = minutes * 60 * 1000 + seconds * 1000 + milliseconds;

                // 提取歌词文本
                const lyricText = line.replace(timestampRegex, '').trim();

                // 将歌词文本转化为歌词片段对象
                const lyricItem = {
                    startTime: timeInMillis,
                    content: lyricText,
                };

                // 将解析后的歌词片段添加到歌词数组中
                lyrics.push(lyricItem);
            }
        });

        return lyrics;
    }
}
