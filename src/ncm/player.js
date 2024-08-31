import { Howl, Howler } from "howler";

export class Player {
    constructor() {
        // 初始化音频为空
        this._audio = null;
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
    }
    // 获取播放列表
    get playlist() {
        return this._playlist;
    }
    // 设置播放列表
    set playlist(value) {
        this._playlist = value;
    }
    // 添加播放列表
    addPlaylist(value) {
        this._playlist.concat(value);
    }
    // 添加单曲到播放列表
    addTrack(value) {
        this._playlist.splice(this._current + 1, 0, value);
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
        if (value === 'order' || value === 'listloop' || value === 'random' || value === 'listrandom' || value === 'loop' && value !== this._mode) {
            this._history = [];
            this._mode = value;
        }
    }
    // 获取播放历史
    get history() {
        return this._history;
    }
}