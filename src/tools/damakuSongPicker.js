import { YTrackC } from './YTrackC'; //eslint-disable-line
import { useApi } from '@/ncm/api';
import { Subscriber } from './subscribe';
import { markRaw } from 'vue';

export class SongPicker {
    constructor() {
        this.homeDir = window.api.homeDir();
        this.damakuPath = window.api.pathJoin(this.homeDir, 'Documents', '弹幕姬', 'Plugins', 'xcmusic');
        this.filePath = window.api.pathJoin(this.damakuPath, 'songPicker.txt');
        this.clearFile();

        this.subscriber = new Subscriber();
        this.subscribeEvents = [
            'track',
            'nextTrack',
        ];

        this.song = null;
        this._track = null;

        this.timer = setInterval(() => {
            this.getContent();
        }, 2000);
        // setTimeout(() => {
        //     clearInterval(this.timer);
        // }, 1000 * 100);
    }
    subscribe({ id, func, type, }) {
        if (!this.subscribeEvents.includes(type)) {
            console.log('type is not in subscribeEvents: ', type);
            return;
        }
        this.subscriber.on({ id, func, type });
    }
    unSubscribe({ id, type, }) {
        if (!this.subscribeEvents.includes(type)) {
            console.log('type is not in subscribeEvents: ', type);
            return;
        }
        this.subscriber.off({ id, type });
    }
    async clearFile() {
        try {
            await window.api.writeFile(this.filePath, '');
            console.log('文件已清空');
        } catch (err) {
            console.error('清空文件失败', err);
        }
    }
    async readFile() {
        let result = await window.api.readFile(this.filePath);
        let lines = result.split('\n').map(line => line.trim()).filter(Boolean);
        return lines;
    }
    async deleteLine(line) {
        try {
            // 读取文件内容
            const data = await window.api.readFile(this.filePath);
            const lines = data.split('\n'); // 按行分割

            // 删除指定行
            const updatedLines = lines.filter(l => !l.includes(line));

            // 将更新后的内容写回文件
            await window.api.writeFile(this.filePath, updatedLines.join('\n'));
            console.log('行已删除: ', line);
        } catch (err) {
            console.error('删除行失败:', err);
        }
    }
    async getContent() {
        let lines = await this.readFile()
        lines.forEach((line) => {
            // 检查是否包含 "点歌" 和 "status:tbd"
            const startIndex = line.indexOf('点歌');
            const startIndex2 = line.indexOf('下一首');
            const endIndex = line.indexOf('status:tbd');

            // 确保 "点歌" 或 "下一首" 在 "status:tbd" 之前并且都存在
            if ((startIndex !== -1 || startIndex2 !== -1) && endIndex !== -1 && (startIndex < endIndex || startIndex2 < endIndex)) {
                // 截取 "点歌" 和 "status:tbd" 之间的部分
                let contentBetween = ''
                if (startIndex !== -1) {
                    contentBetween = line.slice(startIndex + 2, endIndex);
                } else if (startIndex2 !== -1) {
                    contentBetween = line.slice(startIndex2 + 3, endIndex);
                }
                console.log(`提取的内容: ${contentBetween}`);

                // 去除首尾空格
                let trimmedContent = contentBetween.trim();

                if (!trimmedContent) return;

                // 判断 trimmedContent 是否是纯数字
                const isPureNumber = /^\d+$/.test(trimmedContent);

                if (isPureNumber) {
                    trimmedContent = parseInt(trimmedContent);
                    if (startIndex !== -1) {
                        this.song = ({
                            type: 'id',
                            data: trimmedContent,
                        })
                        let track = markRaw(new YTrackC(this.song.data));
                        track.onTrackLoaded = () => {
                            this._track = track.track;
                            this.subscriber.exec('track');
                        }
                    } else if (startIndex2 !== -1) {
                        this.song = ({
                            type: 'id',
                            data: trimmedContent,
                        })
                        let track = markRaw(new YTrackC(this.song.data));
                        track.onTrackLoaded = () => {
                            this._track = track.track;
                            this.subscriber.exec('nextTrack');
                        }
                    }
                } else {
                    this.song = ({
                        type: 'keyword',
                        data: trimmedContent,
                    })
                    this.getSearchedSong(startIndex !== -1);
                }
                this.deleteLine(line);
            }
        });
    }
    async getSearchedSong(playNow) {
        if (this.song && this.song.type === 'keyword') {
            await useApi('/cloudsearch', {
                keywords: this.song.data,
            }).then(res => {
                this._track = res.result.songs[0];
                if (playNow) {
                    this.subscriber.exec('track');
                } else {
                    this.subscriber.exec('nextTrack');
                }
            }).catch(err => {
                console.error(err);
            });
        }
    }
    get track() {
        return this._track;
    }
}