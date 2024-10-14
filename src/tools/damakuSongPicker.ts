import { YTrackC } from './YTrackC'; 
import { useApi } from '@/ncm/api';
import { Subscriber } from './subscribe';
import { markRaw } from 'vue';

export class SongPicker {
    homeDir: string;
    damakuPath: string;
    filePath: string;
    subscriber: Subscriber;
    song: null | { type: string; data: number | string; };
    _track: null | Object;
    timer: NodeJS.Timeout;
    constructor() {
        this.homeDir = window.api.homeDir();
        this.damakuPath = window.api.pathJoin(this.homeDir, 'Documents', '弹幕姬', 'Plugins', 'xcmusic');
        this.filePath = window.api.pathJoin(this.damakuPath, 'songPicker.txt');
        if (!window.api.existsSync(this.damakuPath)) {
            window.api.makeDirSync(this.damakuPath);
        }
        if (!window.api.existsSync(this.filePath)) {
            window.api.writeFile(this.filePath, '');
        }
        this.#clearFile();

        this.subscriber = new Subscriber([
            'track',
            'nextTrack',
        ]);

        this.song = null;
        this._track = null;

        this.timer = setInterval(() => {
            this.#getContent();
        }, 2000);
    }

    /**
     * 订阅事件
     * @param {Object} options - 事件处理的参数对象
     * @param {string} [options.id=''] - 用来标识订阅者的唯一id
     * @param {string} [options.type=''] - 订阅的事件类型
     * @param {Function} [options.func=()=>{}] - 事件处理函数
     */
    subscribe({ id, func, type, }: { id?: string; type?: string; func?: Function; }) {
        this.subscriber.on({ id, func, type });
    }
    /**
     * 取消订阅事件
     * @param {Object} options - 事件处理的参数对象
     * @param {string} [options.id=''] - 用来标识订阅者的唯一id
     * @param {string} [options.type=''] - 订阅的事件类型
     */
    unSubscribe({ id, type, }: { id?: string; type?: string; }) {
        this.subscriber.off({ id, type });
    }
    /**
     * 清空文件，程序启动时调用
     */
    async #clearFile() {
        try {
            window.api.writeFile(this.filePath, '');
            // console.log('文件已清空');
        } catch (err) {
            console.error('清空文件失败', err);
        }
    }
    /**
     * 读取文件内容
     * @returns {Promise<string[]>} 返回每一行的内容
     */
    async #readFile(): Promise<string[]> {
        let result = window.api.readFile(this.filePath);
        let lines = result.toString().split('\n').map(line => line.trim()).filter(Boolean);
        return lines;
    }
    /**
     * 删除文件中的指定行
     * @param {string} line - 要删除的行
     */
    async #deleteLine(line: string) {
        try {
            // 读取文件内容
            const data = await window.api.readFile(this.filePath);
            const lines = data.toString().split('\n'); // 按行分割

            // 删除指定行
            const updatedLines = lines.filter(l => !l.includes(line));

            // 将更新后的内容写回文件
            await window.api.writeFile(this.filePath, updatedLines.join('\n'));
            console.log('行已删除: ', line);
        } catch (err) {
            console.error('删除行失败:', err);
        }
    }
    /**
     * 从文件中获取内容
     */
    async #getContent() {
        let lines = await this.#readFile()
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
                let trimmedContent: number | string = contentBetween.trim();

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
                        let track = markRaw(new YTrackC(trimmedContent));
                        track.onTrackLoaded = () => {
                            this._track = track.track;
                            this.subscriber.exec('track');
                        }
                    } else if (startIndex2 !== -1) {
                        this.song = ({
                            type: 'id',
                            data: trimmedContent,
                        })
                        let track = markRaw(new YTrackC(trimmedContent));
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
                this.#deleteLine(line);
            }
        });
    }
    /**
     * 获取搜索到的歌曲
     * @param {boolean} playNow - 是否立即播放
     */
    async getSearchedSong(playNow: boolean) {
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
    /**
     * 获取当前歌曲
     * @returns {Object} 返回当前歌曲
     */
    get track(): object | null {
        return this._track;
    }
}