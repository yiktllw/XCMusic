import { markRaw } from "vue";
import { useApi } from "./api";
import { Subscriber } from "@/tools/subscribe";
import { SongPicker } from "@/tools/damakuSongPicker";

export class Player {
    constructor() {
        // 初始化音频为空
        this._audio = new Audio('');
        this._audio.onerror = async () => {
            await this.reloadUrl();
        };
        // 初始化音频上下文
        this._audioContext = null;
        // 初始化增益节点
        this._gainNode = null;
        // 初始化音量均衡控件
        this.initAudioContext();

        // 初始化播放列表为空
        this._playlist = [];
        // 初始化歌单ID为0
        this._playlistId = 0;
        // 初始化当前播放索引为0
        this._current = 0;

        // 初始化播放模式为顺序播放
        this._mode = 'order';

        // 初始化随机播放历史为空
        this._history = [];
        // 初始化历史索引为0
        this._historyIndex = 0;

        // 初始化播放状态为暂停
        this._playState = 'pause';

        // 初始化音量为1
        this._volume = 1;

        // 初始化播放时间为0
        this._currentTime = 0;
        // 初始化播放进度为0
        this._progress = 0;
        // 初始化总时长为0
        this._duration = 0;

        // 初始化音质为极高
        this._quality = 'exhigh';

        // 点歌功能
        if (window.electron?.isElectron) {
            this.songPicker = markRaw(new SongPicker());
            this.songPicker.subscribe({
                id: 'player.js',
                func: () => {
                    this.playTrack(this.songPicker.track);
                },
                type: 'track',
            });
            this.songPicker.subscribe({
                id: 'player.js',
                func: () => {
                    this.nextPlay(this.songPicker.track);
                },
                type: 'nextTrack',
            });
        }

        // 更新时间的计时器
        this._updateTime = null;

        // 订阅事件
        this.subscriber = markRaw(new Subscriber());
        this.subscribeEvents = markRaw([
            'playState',
            'playlist',
            'track',
            'trackReady',
            'time',
            'allTime',
            'quality',
            'volume',
            'history',
            'mode',
        ]);

        this._mediaSessionInit = false;
        this.initMediaSession();
    }
    // 由于vue的响应式原理，Player类的对象是一个非常大的实例，为了避免vue跟踪此实例时占用大量内存，在store中实例化此对象时声明为一个非响应式的对象(markRaw)
    // 同时，为了在组件中获取此对象的最新属性，需要提供回调函数接口，在使用最新属性的地方订阅属性发生变动的消息。
    // id: 订阅者的唯一标识，例如 YPlaybar.vue
    // func: 订阅者的回调函数，例如 () => { console.log('PlayState changed') }
    // type: 订阅的属性，例如 'playState'
    Subscribe({ id, func, type }) {
        if (!this.subscribeEvents.includes(type)) {
            console.log('Subscribe event not supported: ', type);
            return;
        } else {
            this.subscriber.on({
                id: id,
                func: func,
                type: type,
            });
        }
    }
    UnSubscribe({ id, type }) {
        if (!this.subscribeEvents.includes(type)) {
            console.log('Subscribe event not supported: ', type);
            return;
        } else {
            this.subscriber.off({
                id: id,
                type: type,
            });
        }
    }
    // 执行已经订阅的回调函数
    Execute({ type }) {
        if (!this.subscribeEvents.includes(type)) {
            console.log('Execute event not supported: ', type);
            return;
        } else {
            this.subscriber.exec(type);
        }
    }
    // 初始化MediaSession(系统媒体控制)
    initMediaSession() {
        this.Subscribe({
            id: 'mediaSession',
            type: 'track',
            func: () => {
                let imgSrc = this.currentTrack?.al?.picUrl;
                if (!imgSrc) imgSrc = require('@/assets/song.svg')
                let metaData = {
                    title: this.currentTrackName ?? '未知歌曲',
                    artist: this.currentTrackArtists ? this.currentTrackArtists.map(artist => artist.name).join(' / ') : '未知歌手',
                    album: this.currentTrack?.al?.name ?? '未知专辑',
                    artwork: [
                        { src: imgSrc ? imgSrc + '?param=96y96' : '', sizes: '96x96', type: 'image/png' },
                        { src: imgSrc ? imgSrc + '?param=128y128' : '', sizes: '128x128', type: 'image/png' },
                    ],
                }
                // console.log('MediaSession track changed');
                navigator.mediaSession.metadata = new window.MediaMetadata(metaData);
                navigator.mediaSession.setActionHandler('play', () => {
                    this.playState = 'play';
                })
                navigator.mediaSession.setActionHandler('pause', () => {
                    this.playState = 'pause';
                })
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    this.previous();
                })
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    this.next();
                })
                navigator.mediaSession.setActionHandler('stop', () => {
                    this.playState = 'pause';
                })
                navigator.mediaSession.setActionHandler('seekto', event => {
                    this.currentTime = Math.floor(event.seekTime);
                });
                navigator.mediaSession.setActionHandler('seekbackward', event => {
                    this.currentTime = this.currentTime - event.seekOffset ?? 10;
                });
                navigator.mediaSession.setActionHandler('seekforward', event => {
                    this.currentTime = this.currentTime + event.seekOffset ?? 10;
                });
                // console.log('mediaSession', navigator.mediaSession)
                navigator.mediaSession.playbackState = 'playing';
                this._mediaSessionInit = true;
            }
        })
        this.Subscribe({
            id: 'mediaSession',
            type: 'playState',
            func: () => {
                if (this._mediaSessionInit) {
                    if (this.playState === 'pause') {
                        navigator.mediaSession.playbackState = 'paused';
                    } else {
                        navigator.mediaSession.playbackState = 'playing';
                    }
                }
            },
        })
        this.Subscribe({
            id: 'mediaSession',
            type: 'time',
            func: () => {
                if (this._mediaSessionInit) {
                    navigator.mediaSession.setPositionState({
                        position: this.currentTime,
                        duration: this.duration,
                    })
                    // console.log('state changed', this.currentTime,'\n',navigator.mediaSession)
                }
            }
        })
    }
    // 更新播放时间、播放进度、总时长
    updateTime() {
        if (this._updateTime) {
            clearTimeout(this._updateTime);
        }

        const update = () => {
            // 确保音频已经加载
            if (this._audio.readyState === 0) return;

            // 确保触发time订阅事件时，时间发生了变化
            if (this.playState === 'play' && Math.floor(this._currentTime) !== Math.floor(this._audio.currentTime)) {
                // 如果秒数发生了变化
                this._currentTime = Math.floor(this._audio.currentTime);
                this._progress = (this._currentTime / this._duration).toFixed(3);
                this._duration = this._audio.duration;
                this.Execute({ type: 'time' });
                this.Execute({ type: 'trackReady' });
            } else if (this.playState === 'play' && this._currentTime !== this._audio.currentTime) {
                // 如果毫秒数发生了变化
                this._currentTime = this._audio.currentTime;
                this._progress = (this._currentTime / this._duration).toFixed(3);
                this.Execute({ type: 'allTime'});
            }

            this._updateTime = setTimeout(update, 50);  // 递归调用 setTimeout
        };

        this._updateTime = setTimeout(update, 50);  // 初次调用
    }
    // 由于网易云音乐限制，单个url的有效时间为20分钟，超出时间需要重新获取url
    async reloadUrl() {
        if (!this.currentTrack) return;
        console.log('Reloading url', this.currentTrack);
        let result = await this.getUrl(this.currentTrack.id);
        let url = result.url;
        this._audio.src = url;
        this._audio.currentTime = this._currentTime;
        try {
            if (this.playState === 'play') {
                await this._audio.play();
                this.updateTime();
            }
            console.log('Reloaded url', url);
        } catch (error) {
            console.error(error);
        }
    }
    // 播放指定的歌曲
    async playTrack(track, autoPlay = true) {
        // 查询指定的歌曲是否在播放列表中
        let trackIndex = this._playlist.findIndex(_track => _track.id === track.id);
        if (trackIndex === -1) {
            // 如果不在播放列表中则添加到播放列表
            this.addTrack(track);
            console.log('Track not in playlist, added to playlist and played', track);
            await this.playTrack(track);
        } else {
            // 如果在播放列表中
            // 更新上一首歌曲的播放信息
            if (this.currentTrack?.id) {
                await this.scrobble(this.currentTrack.id)
            }
            // 更新当前播放的歌曲位置
            this._current = trackIndex;
            // 触发 track 的回调函数
            this.Execute({ type: 'track' });
            // 获取歌曲播放信息
            let result = await this.getUrl(track.id);
            let url = result.url;
            this._audio.src = url;
            this._audio.onended = () => this.next();
            // 获取当前歌曲的所有音质的数据(音量均衡数据)
            await this.setAllQuality(this.currentTrack.id);
            let gain = 1;
            let peak = 1;
            // 因为所有音质的文件峰值是相同的，也是就说能够混用音量均衡数据
            // 所以，在所有音质的音量均衡数据中，查找音量最大的数据。
            if (this.currentTrack.l) {
                if (this.currentTrack.l.gain > gain) {
                    gain = this.currentTrack.l.gain;
                }
                if (this.currentTrack.l.peak < peak && this.currentTrack.l.peak !== 0) {
                    peak = this.currentTrack.l.peak;
                }
            }
            if (this.currentTrack.h) {
                if (this.currentTrack.h.gain > gain) {
                    gain = this.currentTrack.h.gain;
                }
                if (this.currentTrack.h.peak < peak && this.currentTrack.h.peak !== 0) {
                    peak = this.currentTrack.h.peak;
                }
            }
            if (this.currentTrack.sq) {
                if (this.currentTrack.sq.gain > gain) {
                    gain = this.currentTrack.sq.gain;
                }
                if (this.currentTrack.sq.peak < peak && this.currentTrack.sq.peak !== 0) {
                    peak = this.currentTrack.sq.peak;
                }
            }
            if (this.currentTrack.hr) {
                if (this.currentTrack.hr.gain > gain) {
                    gain = this.currentTrack.hr.gain;
                }
                if (this.currentTrack.hr.peak < peak && this.currentTrack.hr.peak !== 0) {
                    peak = this.currentTrack.hr.peak;
                }
            }
            if (this.currentTrack.jyeffect) {
                if (this.currentTrack.jyeffect.gain > gain) {
                    gain = this.currentTrack.jyeffect.gain;
                }
                if (this.currentTrack.jyeffect.peak < peak && this.currentTrack.jyeffect.peak !== 0) {
                    peak = this.currentTrack.jyeffect.peak;
                }
            }
            if (this.currentTrack.sky) {
                if (this.currentTrack.sky.gain > gain) {
                    gain = this.currentTrack.sky.gain;
                }
                if (this.currentTrack.sky.peak < peak && this.currentTrack.sky.peak !== 0) {
                    peak = this.currentTrack.sky.peak;
                }
            }
            if (this.currentTrack.jymaster) {
                if (this.currentTrack.jymaster.gain > gain) {
                    gain = this.currentTrack.jymaster.gain;
                }
                if (this.currentTrack.jymaster.peak < peak && this.currentTrack.jymaster.peak !== 0) {
                    peak = this.currentTrack.jymaster.peak;
                }
            }
            // 设置音量均衡
            this.setGain(gain, peak);
            if (autoPlay) {
                try {
                    // 更新播放状态
                    await this._audio.play();
                    this.playState = 'play';
                    console.log('auto play');
                } catch (error) {
                    console.error(error);
                }
            }
            this.updateTime();
            console.log('Playing', track);
            console.log('track url: ', url);
            // 此时，歌曲已经准备就绪，触发 trackReady 的回调函数
            this.Execute({ type: 'trackReady' });
        }
    }
    // 获取所有音质的信息，并添加到 currentTrack
    async setAllQuality(id) {
        // 异步执行这些请求
        let requests = [
            this.getQuality(id, 'standard').then(res => {
                this.currentTrack = {
                    ...this.currentTrack,
                    l: res,
                }
            }),
            this.getQuality(id, 'exhigh').then(res => {
                this.currentTrack = {
                    ...this.currentTrack,
                    h: res,
                }
            }),
            this.getQuality(id, 'lossless').then(res => {
                this.currentTrack = {
                    ...this.currentTrack,
                    sq: res,
                }
            }),
            this.getQuality(id, 'hires').then(res => {
                this.currentTrack = {
                    ...this.currentTrack,
                    hr: res,
                }
            }),
            this.getQuality(id, 'jyeffect').then(res => {
                this.currentTrack = {
                    ...this.currentTrack,
                    jyeffect: res,
                }
            }),
            this.getQuality(id, 'sky').then(res => {
                this.currentTrack = {
                    ...this.currentTrack,
                    sky: res,
                }
            }),
            this.getQuality(id, 'jymaster').then(res => {
                this.currentTrack = {
                    ...this.currentTrack,
                    jymaster: res,
                }
            }),
        ];
        // 执行所有请求
        await Promise.all(requests);
    }
    // 获取音质信息
    async getQuality(id, quality) {
        let response = null;
        if (localStorage.getItem('login_cookie')) {
            response = await useApi('/song/url/v1', {
                id: id,
                level: quality,
                cookie: localStorage.getItem('login_cookie'),
            }).catch(error => {
                console.error(error);
            });
        } else {
            response = await useApi('/song/url/v1', {
                id: id,
                level: quality,
            }).catch(error => {
                console.error(error);
            });
        }
        // 返回对象:
        // {
        //     name: 音质名称，如 'standard'
        //     size: 当前音质的文件大小
        //     gain: 音量均衡的增益
        //     peak: 文件的峰值
        // }
        if (response?.data[0].level === quality) {
            let result = {
                name: quality,
                size: response.data[0].size,
                gain: response.data[0].gain,
                peak: response.data[0].peak,
            };
            return result;
        } else {
            return null;
        }
    }
    // 初始化音量均衡控件
    initAudioContext() {
        if (!this._audioContext) {
            // 创建一个新的 AudioContext
            this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // console.log('audioContext', this.audioContext);

            // 创建一个增益节点
            this._gainNode = this._audioContext.createGain();
            // console.log('gainNode', this.gainNode);

            // 连接增益节点到 AudioContext 的目标
            this._gainNode.connect(this._audioContext.destination);
            var audioElement = this._audio;
            audioElement.crossOrigin = 'anonymous';

            // 创建一个新的音频源
            var source = this._audioContext.createMediaElementSource(audioElement);
            source.connect(this._gainNode);
        }
    }
    // 随机播放
    async randomPlay(direction) {
        if (this._history[this._historyIndex + direction]) {
            // 如果历史记录中有上一首/下一首歌曲
            this._current = this._playlist.findIndex(track => track.id === this._history[this._historyIndex + direction].id);
            this._historyIndex += direction;
            this.Execute({ type: 'history' });
        } else if (direction === 1) {
            // 如果历史记录中没有下一首歌曲
            // 随机播放下一首
            this._current = Math.floor(Math.random() * this.playlistCount)
            this.appendToHistory(this.currentTrack);
        } else if (direction === -1) {
            // 如果历史记录中没有上一首歌曲
            // 随机播放上一首
            this._current = Math.floor(Math.random() * this.playlistCount)
            this.insertToHistory(this.currentTrack);
        }
        await this.playTrack(this.currentTrack);
    }
    // 播放下一首
    async next() {
        // 如果播放列表为空则返回
        if (this.playlistCount === 0) return;
        // 如果播放模式为随机播放
        if (this._mode === 'random') {
            // 随机播放下一首
            await this.randomPlay(1);
        } else if (this._mode === 'loop') {
            // 循环播放
            await this.playTrack(this.currentTrack);
        } else {
            // 顺序播放下一首
            this._current = (this._current + 1) % this.playlistCount;
            await this.playTrack(this.currentTrack);
        }
    }
    // 播放上一首
    async previous() {
        // 如果播放列表为空则返回
        if (this.playlistCount === 0) return;
        // 如果播放模式为随机播放
        if (this._mode === 'random') {
            // 随机播放上一首
            await this.randomPlay(-1);
        } else {
            // 顺序播放上一首
            this._current = (this._current - 1 + this.playlistCount) % this.playlistCount;
            await this.playTrack(this.currentTrack);
        }
    }
    // 获取播放列表
    get playlist() {
        return this._playlist;
    }
    // 获取播放列表长度
    get playlistCount() {
        return this._playlist.length;
    }
    // 设置播放列表
    set playlist(list) {
        // 清空播放历史
        this.clearHistory();
        if (this._mode === 'listrandom') {
            // 如果播放模式为随机播放
            this._playlist = list.sort(() => Math.random() - 0.5);
        } else if (this._playlist !== list) {
            // 如果播放模式为其它模式
            this._playlist = list;
        }
        this.Execute({ type: 'playlist' });
    }
    // 添加播放列表
    addPlaylist(list) {
        // 保存当前歌曲
        let ori_track = this._playlist[this._current] ?? null;
        // 
        let playFirst = false;
        if (this.playlist.length === 0) {
            playFirst = true;
        }
        // 先构建一个 Map 用于快速查找 _playlist 中的 track
        const playlistMap = new Map();
        this._playlist.forEach((track, index) => {
            playlistMap.set(track.id, index);
        });

        // 收集要添加到播放列表的歌曲
        const tracksToAdd = [];

        list.forEach(track => {
            // 使用 Map 进行 O(1) 查找
            if (!playlistMap.has(track.id)) {
                tracksToAdd.push(track);
            }
        });

        // 如果有歌曲要添加
        if (tracksToAdd.length > 0) {
            if (this._mode === 'listrandom') {
                // 随机插入的情况
                tracksToAdd.forEach(track => {
                    this._playlist.splice(Math.floor(Math.random() * this.playlistCount), 0, track);
                });
            } else {
                // 顺序插入到播放列表
                this._playlist.push(...tracksToAdd);
            }
        }
        // 找到当前歌曲的索引
        if (ori_track) {
            this._current = this._playlist.findIndex(track => track.id === ori_track.id);
        }
        if (playFirst) {
            this.playTrack(this.currentTrack, false);
        }
        this.Execute({ type: 'playlist' });
    }
    clearPlaylist() {
        this._playlist = [];
        this._current = 0;
        this._audio.pause();
        this.playState = 'play';
        this._audio.src = '';
        this.clearHistory();
        this.Execute({ type: 'playlist' });
    }
    nextPlay(track) {
        // 查询指定的歌曲是否在播放列表中
        let trackIndex = this._playlist.findIndex(_track => _track.id === track.id);
        if (trackIndex !== -1) {
            // 如果在播放列表中，则将其移动到下一首
            let exchange = this._playlist[this._current + 1];
            this._playlist[this._current + 1] = this._playlist[trackIndex];
            this._playlist[trackIndex] = exchange;
        } else {
            // 如果不在播放列表中，则添加到下一首
            this._playlist.splice(this._current + 1, 0, track);
        }
        this.Execute({ type: 'playlist' });
    }
    // 播放全部
    async playAll(list) {
        // 设置播放列表
        this.playlist = list;
        // 设置当前播放索引为0
        this._current = 0;
        // 清空播放历史
        this.clearHistory();
        if (this._mode === 'random') {
            // 如果播放模式为随机播放
            this.randomPlay(1);
        } else {
            // 如果不为随机播放，则播放第一首
            await this.playTrack(this.currentTrack);
        }
    }
    // 添加单曲到播放列表
    addTrack(value) {
        // 查询指定的歌曲是否在播放列表中
        let trackIndex = this._playlist.findIndex(_track => _track.id === value.id);
        if (trackIndex === -1) {
            // 如果不在播放列表中则添加到下一首
            this._playlist.splice(this._current + 1, 0, value);
        } else {
            // 如果在播放列表中则替换到播放列表
            this._playlist.splice(trackIndex, 1);
        }
        // 如果播放模式为随机播放
        if (this._mode === 'random') {
            // 将历史的下一首替换为当前歌曲
            this._history = this._history.splice(this._historyIndex + 1, 0, value);
            this.Execute({ type: 'history' });
        }
        this.Execute({ type: 'playlist' });
    }
    // 更新歌单播放量
    async updatePlaycount() {
        if (!localStorage.getItem('login_cookie')) return;
        await useApi('/playlist/update/playcount', {
            id: this._playlistId,
            cookie: localStorage.getItem('login_cookie')
        }).then((res) => {
            console.log('update playlist playcount: ', this._playlistId, 'response', res);
        }).catch(err => {
            console.log('update playlist playcount error: ', err)
        });
    }
    // 更新歌曲播放数据
    async scrobble(id) {
        if (!localStorage.getItem('login_cookie')) return;
        if (this._playlistId > 0) {
            await useApi('/scrobble', {
                id: id,
                time: this._currentTime,
                sourceId: this._playlistId,
                cookie: localStorage.getItem('login_cookie'),
            }).then(res => {
                console.log('update song playcount: ', id, 'time', this._currentTime, 'response: ', res);
            }).catch(err => {
                console.log('update song playcount error: ', err);
            })
        } else {
            await useApi('/scrobble', {
                id: id,
                time: this._currentTime,
                cookie: localStorage.getItem('login_cookie'),
            }).then(res => {
                console.log('update song playcount: ', id, 'response: ', res);
            }).catch(err => {
                console.log('update song playcount error: ', err);
            })
        }
    }
    // 获取当前播放索引
    get current() {
        return this._current;
    }
    // 获取当前播放歌曲
    get currentTrack() {
        return this._playlist[this._current];
    }
    set currentTrack(value) {
        if (this._playlist.length > 0 && this._playlist[this._current]) {
            this._playlist[this._current] = value;
            // this.Execute({ type: 'track' });
        }
    }
    // 获取当前播放歌曲封面
    get currentTrackCover() {
        return this._playlist[this._current]?.al.picUrl;
    }
    // 获取当前播放歌曲名称
    get currentTrackName() {
        return this._playlist[this._current]?.name;
    }
    // 获取当前播放歌曲作者
    get currentTrackArtists() {
        return this._playlist[this._current]?.ar;
    }
    // 获取播放歌单ID
    get playlistId() {
        return this._playlistId;
    }
    // 设置播放歌单ID
    set playlistId(value) {
        this._playlistId = value;
        this.updatePlaycount();
    }
    // 获取播放模式
    get mode() {
        return this._mode;
    }
    // 设置播放模式
    set mode(value) {
        if (value === this._mode) return;
        if (value !== 'order' && value !== 'listloop' && value !== 'random' && value !== 'loop' && value !== 'listrandom') {
            console.log('Mode not supported: ', value);
            return;
        }
        // 如果播放模式改变
        if (value !== this._mode) {
            // 清空播放历史
            this.clearHistory();
            // 设置播放模式
            this._mode = value;
            this.Execute({ type: 'mode' });
        }
        // 如果播放模式不为列表随机
        if (value === 'order' || value === 'listloop' || value === 'random' || value === 'loop') {
            // 保存当前歌曲
            let ori_track = this._playlist[this._current];
            // 按照原始索引排序
            this._playlist = this._playlist.sort((a, b) => a.originalIndex - b.originalIndex);
            // 找到当前歌曲的索引
            if (ori_track) {
                this._current = this._playlist.findIndex(track => track.id === ori_track.id);
            }
        } else if (value === 'listrandom') {
            // 保存当前歌曲
            let ori_track = this._playlist[this._current];
            if (!ori_track) return;
            // 否则随机排序
            this._playlist = this._playlist.sort(() => Math.random() - 0.5);
            // 找到当前歌曲的索引
            if (ori_track) {
                this._current = this._playlist.findIndex(track => track.id === ori_track.id);
            }
        }
    }
    // 获取播放历史
    get history() {
        return this._history;
    }
    // 添加到历史
    appendToHistory(track) {
        this._history.push(track)
        this._historyIndex = this._history.length - 1;
        this.Execute({ type: 'history' });
    }
    // 插入到历史开头
    insertToHistory(track) {
        this._history.splice(0, 0, track);
        this._historyIndex = 0;
        this.Execute({ type: 'history' });
    }
    // 清空历史
    clearHistory() {
        this._history = [];
        this._historyIndex = 0;
        this.Execute({ type: 'history' });
    }
    // 向前/向后跳转
    goTo(position) {
        if (position === -1 || position === 1) {
            console.log('Go to', position);
        }
    }
    // 获取播放状态
    get playState() {
        return this._playState;
    }
    // 设置播放状态 'play' : 'pause'
    set playState(value) {
        if ((value === 'play' || value === 'pause')) {
            if (this._audio && this._audio.readyState) {
                this._playState = value;
                this._playState === 'play' ? this._audio?.play() : this._audio?.pause();
                this.Execute({ type: 'playState' });
            } else {
                console.log('Audio not ready');
            }
        } else {
            console.error('PlayState not supported: ', value);
        }
    }
    tooglePlayState() {
        this.playState = this.playState === 'play' ? 'pause' : 'play';
    }
    // 获取歌曲id对应的url及其他信息
    async getUrl(id) {
        let response = null;
        if (localStorage.getItem('login_cookie')) {
            response = await useApi('/song/url/v1', {
                id: id,
                level: this.quality,
                cookie: localStorage.getItem('login_cookie'),
            }).catch(error => {
                console.error(error);
            });
        } else {
            response = await useApi('/song/url/v1', {
                id: id,
                level: this.quality,
            }).catch(error => {
                console.error(error);
            });
        }
        let result = response.data[0];
        return result;
    }
    // 分贝转线性
    dBToGain(dB) {
        return Math.pow(10, (dB) / 20);
    }
    // 获取音量
    get volume() {
        return this._volume;
    }
    // 设置音量
    set volume(value) {
        if (value >= 0 && value <= 1) {
            this._volume = value;
            this._audio.volume = value;
            this.Execute({ type: 'volume' });
        }
    }
    // 设置增益
    setGain(gain, peak) {
        // 将分贝转换为线性
        let gain_linear = this.dBToGain(gain);
        // 如果增益大于1或小于0.9且不为0
        if ((peak * gain_linear > 1 || peak * gain_linear < 0.9) && peak !== 0) {
            // 重新计算增益
            gain_linear = 1 / peak;
        }
        if (gain_linear < 0 || typeof gain_linear !== 'number' || isNaN(gain_linear) || gain_linear === Infinity || peak === Infinity || peak < 0 || peak > 2 || typeof peak !== 'number' || isNaN(peak)) {
            console.log('Gain or not supported, gain: ', gain_linear, 'peak: ', peak);
            return;
        }
        if (gain_linear > 4) {
            gain_linear = 4;
        }
        // 设置增益
        try {
            this._gainNode.gain.value = gain_linear;
        } catch (error) {
            console.error(error);
        }
        console.log('Gain set to', gain_linear, 'Peak', peak * gain_linear);
    }
    // 获取当前播放时间
    get currentTime() {
        return this._currentTime;
    }
    // 设置当前播放时间
    set currentTime(value) {
        if (value >= 0 && value <= this._duration) {
            this._audio.currentTime = value;
            this._currentTime = value;
            this._progress = value / this._duration;
            this.Execute({ type: 'time' })
        }
    }
    // 获取播放进度
    get progress() {
        return this._progress;
    }
    // 设置播放进度
    set progress(value) {
        if (value >= 0 && value <= 1) {
            this._progress = value;
            this._currentTime = this._duration * value;
            this._audio.currentTime = this._currentTime;
        }
    }
    // 获取总时长
    get duration() {
        return this._duration;
    }
    get quality() {
        return this._quality;
    }
    set quality(value) {
        if (value === 'standard' || value === 'higher' || value === 'exhigh' || value === 'lossless' || value === 'hires' || value === 'jyeffect' || value === 'sky' || value === 'jymaster') {
            this._quality = value;
            this.reloadUrl();
            this.Execute({ type: 'quality' });
        } else {
            console.log('Quality not supported: ', value);
        }
    }
    get qualityDisplay() {
        switch (this.quality) {
            case 'standard':
                return '标准';
            case 'higher':
                return '较高';
            case 'exhigh':
                return '极高';
            case 'lossless':
                return '无损';
            case 'hires':
                return 'Hi-Res';
            case 'jyeffect':
                return '高清环绕声';
            case 'sky':
                return '沉浸环绕声';
            case 'jymaster':
                return '超清母带';
            default:
                return '未知';
        }
    }
    // 格式化文件大小
    formatSize(size) {
        if (size < 1024) {
            return size + 'B';
        } else if (size < 1024 * 1024) {
            return (size / 1024).toFixed(1) + 'KB';
        } else if (size < 1024 * 1024 * 1024) {
            return (size / 1024 / 1024).toFixed(1) + 'MB';
        }
    }
    // 获取当前歌曲的可用音质
    get availableQuality() {
        let result = [];
        if (!this.currentTrack) return [];
        if (this.currentTrack.h) {
            result.push({
                name: 'exhigh',
                size: this.formatSize(this.currentTrack.h.size),
            });
        }
        if (this.currentTrack.l) {
            result.push({
                name: 'standard',
                size: this.formatSize(this.currentTrack.l.size),
            });
        }
        if (this.currentTrack.sq) {
            result.push({
                name: 'lossless',
                size: this.formatSize(this.currentTrack.sq.size),
            });
        }
        if (this.currentTrack.hr) {
            result.push({
                name: 'hires',
                size: this.formatSize(this.currentTrack.hr.size),
            });
        }
        if (this.currentTrack.jyeffect) {
            result.push({
                name: 'jyeffect',
                size: this.formatSize(this.currentTrack.jyeffect.size),
            });
        }
        if (this.currentTrack.sky) {
            result.push({
                name: 'sky',
                size: this.formatSize(this.currentTrack.sky.size),
            });
        }
        if (this.currentTrack.jymaster) {
            result.push({
                name: 'jymaster',
                size: this.formatSize(this.currentTrack.jymaster.size),
            });
        }
        return result;
    }
}