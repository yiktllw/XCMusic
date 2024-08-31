import { Howl, Howler } from "howler";
import { useApi } from "./api";

export class Player {
    constructor() {
        // 初始化音频为空
        this._audio = null;
        // 初始化音频上下文
        this._audioContext = Howler.ctx;
        // 初始化增益节点
        this._gainNode = this._audioContext.createGain();
        // 初始化播放列表为空
        this._playlist = [];
        // 初始化当前播放索引为0
        this._current = 0;
        // 初始化歌单ID为0
        this._playlistId = 0;
        // 初始化播放状态为顺序播放
        this._mode = 'order';
        // 初始化随机播放历史为空
        this._history = [];
        // 初始化播放状态为暂停
        this._playState = 'pause';
        // 初始化音量为1
        this._volume = 1;
        // 初始化 接收播放时间更新的函数 为空
        this._onTimeUpdate = () => { };
    }
    // 播放指定的歌曲
    async playTrack(track) {
        // 查询指定的歌曲是否在播放列表中
        let trackIndex = this._playlist.findIndex(_track => _track.id === track.id);
        if (trackIndex === -1) {
            // 如果不在播放列表中则添加到播放列表
            this.addTrack(track);
        } else {
            // 如果在播放列表中
            // 获取歌曲播放信息
            let result = await this.getUrl(track.id);
            let url = result.url;
            let gain = result.gain;
            let peak = result.peak;
            this.setGain(gain, peak);
            // 更新当前播放的歌曲位置
            this._current = trackIndex;
            // 更新播放状态
            this._playState = 'play';
            // 停止播放上一首音乐
            this._audio?.unload();
            // 创建Howl实例
            this._audio = new Howl({
                src: url,
                html5: true,
                volume: this._volume,
                format: ['mp3', 'flac'],
                onend: this.next(),
            });
            this._audio._sounds[0]._node.connect(this._gainNode);
        }
    }
    next() {
        this._audio?.unload();
        if (this.playlistCount === 0) return;
        if (this._mode === 'random') {
            this._current = Math.floor(Math.random * this.playlistCount)
            this.appendToHistory(this.currentTrack);
        } else {
            this._current = (this._current + 1) % this.playlistCount;
        }
        this.playTrack(this.currentTrack);
    }
    // 获取播放列表
    get playlist() {
        return this._playlist;
    }
    get playlistCount() {
        return this._playlist.length;
    }
    // 设置播放列表
    set playlist(value) {
        this._playlist = value;
    }
    // 添加播放列表
    addPlaylist(list) {
        list.forEach(track => {
            let trackIndex = this._playlist.findIndex(_track => _track.id === track.id);
            if (trackIndex === -1) {
                if (this._mode === 'listrandom') {
                    this._playlist.splice(Math.floor(Math.random() * this.playlistCount), 0, track);
                } else {
                    this._playlist.push(track);
                }
            }
        })
        this._playlist.concat(value);
        this.fetchSortedPlaylist();
    }
    // 添加单曲到播放列表
    addTrack(value) {
        let trackIndex = this._playlist.findIndex(_track => _track.id === value.id);
        if (trackIndex === -1) {
            this._playlist.splice(this._current + 1, 0, value);
        } else {
            this._playlist.splice(trackIndex, 1);
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
    // 获取播放歌单ID
    get playlistId() {
        return this._playlistId;
    }
    // 设置播放歌单ID
    set playlistId(value) {
        this._playlistId = value;
    }
    // 获取播放模式
    get mode() {
        return this._mode;
    }
    // 设置播放模式
    set mode(value) {
        if (value !== this._mode) {
            this._history = [];
            this._mode = value;
        }
        if (value === 'order' || value === 'listloop' || value === 'random' || value === 'loop') {
            this._playlist = this._playlist.sort((a, b) => a.originalIndex - b.originalIndex);
        } else if (value === 'listrandom') {
            this._playlist = this._playlist.sort(() => Math.random() - 0.5);
        }
    }
    // 获取播放历史
    get history() {
        return this._history;
    }
    // 添加到历史
    appendToHistory(track) {
        this._history.push(track)
    }
    // 插入到历史开头
    insertToHistory(track) {
        this._history.splice(0, 0, track);
    }
    // 向前/向后跳转
    goTo(position) {
        if (position === -1 || position === 1) {

        }
    }
    // 获取播放状态
    get playState() {
        return this._playState;
    }
    // 设置播放状态 'play' : 'pause'
    set playState(value) {
        if (value === 'play' || value === 'pause') {
            this._playState = value;
        }
    }
    // 切换播放状态
    tooglePlayState() {
        this._playState === 'play' ? 'pause' : 'play';
    }
    // 获取歌曲id对应的url及其他信息
    async getUrl(id) {
        let response = await useApi('/song/url/v1', {
            id: id,
            level: 'higher',
            cookie: localStorage.getItem('login_cookie'),
        });
        return response.data[0];
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
        }
    }
    setGain(gain, peak) {
        let gain_linear = this.dBToGain(gain);
        if (peak * gain_linear > 1 || peak * gain_linear < 0.9 && peak !== 0) {
            gain_linear = 1 / peak;
        }
        this._gainNode.gain.value = gain_linear;
    }
    // 初始化播放列表和历史
    initPlaylistAndHistory() {
        if (this._mode === 'order') {

        } else if (this._mode === 'loop' || this._mode === 'random' || this._mode === 'listloop') {
            if (this._mode === 'random') {
                this._history = [];
            }
        } else if (this._mode === 'listrandom') {
        }
    }
}