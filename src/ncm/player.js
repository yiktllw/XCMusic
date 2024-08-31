import { useApi } from "./api";

export class Player {
    constructor() {
        // 初始化音频为空
        this._audio = new Audio('');
        // 初始化音频上下文
        this._audioContext = null;
        // 初始化增益节点
        this._gainNode = null;
        // 初始化音量均衡控件
        this.initAudioContext();
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
        // 初始化播放时间为0
        this._currentTime = 0;
        // 初始化播放进度为0
        this._progress = 0;
        // 初始化总时长为0
        this._duration = 0;
    }
    // 播放指定的歌曲
    async playTrack(track) {
        // 查询指定的歌曲是否在播放列表中
        let trackIndex = this._playlist.findIndex(_track => _track.id === track.id);
        if (trackIndex === -1) {
            // 如果不在播放列表中则添加到播放列表
            this.addTrack(track);
            console.log('Track not in playlist, added to playlist and played', track);
            await this.playTrack(track);
        } else {
            // 如果在播放列表中
            // 获取歌曲播放信息
            let result = await this.getUrl(track.id);
            let url = result.url;
            let gain = result.gain;
            let peak = result.peak;
            // 更新当前播放的歌曲位置
            this._current = trackIndex;
            // 更新播放状态
            this._playState = 'play';
            this._audio.src = url;
            this._audio.ontimeupdate = () => this.updateTime();
            this._audio.onended = () => this.next();
            this.setGain(gain, peak);
            this._audio.play();
            console.log('Playing', track);
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
    updateTime() {
        if (!this._audio.readyState) return;
        this._currentTime = this._audio.currentTime;
        this._duration = this._audio.duration;
        this._progress = this._currentTime / this._duration;
    }
    next() {
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
        this._playlist.concat(list);
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
    get currentTrackCover() {
        return this._playlist[this._current]?.al.picUrl;
    }
    get currentTrackName() {
        return this._playlist[this._current]?.name;
    }
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
            console.log('Go to', position);
        }
    }
    // 获取播放状态
    get playState() {
        return this._playState;
    }
    // 设置播放状态 'play' : 'pause'
    set playState(value) {
        if (value === 'play' || value === 'pause' && this._audio) {
            this._playState = value;
            this._playState === 'play' ? this._audio?.play() : this._audio?.pause();
        }
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
            this._audio.volume = value;
        }
    }
    setGain(gain, peak) {
        let gain_linear = this.dBToGain(gain);
        if (peak * gain_linear > 1 || peak * gain_linear < 0.9 && peak !== 0) {
            gain_linear = 1 / peak;
        }
        this._gainNode.gain.value = gain_linear;
        console.log('Gain set to', gain_linear, 'Peak', peak * gain_linear);
    }
    addTimeUpdateListener(fn) {
        this._onTimeUpdate.push(fn);
    }
    clearTimeUpdateListener() {
        this._onTimeUpdate = [];
    }
    deleteTimeUpdateListener(fn) {
        let index = this._onTimeUpdate.indexOf(fn);
        if (index !== -1) {
            this._onTimeUpdate.splice(index, 1);
        }
    }
    get currentTime() {
        return this._currentTime;
    }
    set currentTime(value) {
        if (value >= 0 && value <= this._duration) {
            this._audio.currentTime = value;
            this._currentTime = value;
            this._progress = value / this._duration;
        }
    }
    get progress() {
        return this._progress;
    }
    set progress(value) {
        if (value >= 0 && value <= 1) {
            this._progress = value;
            this._currentTime = this._duration * value;
            this._audio.currentTime = this._currentTime;
        }
    }
    get duration() {
        return this._duration;
    }
}