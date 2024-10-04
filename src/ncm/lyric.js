
export class Lyrics {
    #allowTypes = [
        'yrc',
        'lrc',
    ]
    constructor({
        type,
        data,
    }) {
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
    static parseYRC(yrc) {
        const lines = yrc.split('\n');  // 将yrc内容按行分割
        const lyrics = [];

        for (const line of lines) {
            // 解析时间轴和逐字歌词
            const timestampMatch = line.match(/^\[([0-9]+),([0-9]+)\]/);
            const textMatch = line.match(/\((\d+),(\d+),\d+\)(.+?)/g);

            if (timestampMatch) {
                // 提取起始时间和持续时间
                const startTime = parseInt(timestampMatch[1]);
                const duration = parseInt(timestampMatch[2]);

                // 解析逐字歌词
                const wordEntries = [];
                if (textMatch) {
                    for (const text of textMatch) {
                        const [, start, length, char] = text.match(/\((\d+),(\d+),\d+\)(.+)/);
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
                        words: obj.c.map(item => ({ text: item.tx })),
                    });
                } catch (e) {
                    // 忽略解析错误行
                    console.log('Error parsing line of yrc:', line);
                }
            }
        }

        return lyrics;
    }
    static parseLRC(lrc) {
        // 将LRC文件按行分割
        const lines = lrc.split('\n');
        // 存储解析结果的数组
        const lyrics = [];

        // 遍历每一行LRC文件内容
        lines.forEach(line => {
            if (line.startsWith('{') && line.endsWith('}')) {
                const jsonData = JSON.parse(line);
                // 将自定义标签解析为相同结构
                lyrics.push({
                    startTime: jsonData.t,
                    content: jsonData.c
                });
                return;
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
