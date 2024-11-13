/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * player.ts 为渲染进程中，处理音乐播放的工具
 * 在vuex store中，会实例化Player类
 *---------------------------------------------------------------*/

type QualityInfo = {
  name: string;
  size: number;
  gain: number;
  peak: number;
};

import { markRaw } from "vue";
import { useApi } from "./api";
import { Subscriber } from "@/utils/subscribe";
import { SongPicker } from "@/utils/damakuSongPicker";
import { Message } from "@/dual/YMessageC";
import store from "@/store";
import indexDB from "@/utils/indexDB";
import i18n from "@/i18n";
import { isLocal } from "./localTracks_renderer";
import { qualities } from "./setting";
import { ITrack } from "./tracks";
import { getStorage, setStorage } from "./render_storage";
var fs: any, path: any;
if (window.electron?.isElectron) {
  fs = window.api.fs;
  path = window.api.path;
}

export class Player {
  /** 音频对象 */
  _audio: HTMLAudioElement;
  /** 因为_audio连接到了_audioContext，无法直接设置_audio的输出设备，所以需要一个新的音频对象来设置输出设备 */
  _outputAudio: HTMLAudioElement;
  /** 音频上下文，用于设置增益 */
  _audioContext: AudioContext | null;
  /** 增益节点，用于设置音量均衡 */
  _gainNode: GainNode | null;
  /** 播放列表 */
  _playlist: ITrack[];
  /** 歌单ID */
  _playlistId: number | string;
  /** 当前播放的歌曲索引 */
  _current: number;
  /** 播放模式 */
  _mode: "order" | "listloop" | "random" | "loop" | "listrandom";
  /** 播放历史 */
  _history: ITrack[];
  /** 播放历史索引 */
  _historyIndex: number;
  /** 播放状态 */
  _playState: "play" | "pause";
  /** 音量 */
  _volume: number;
  /** 当前播放时间 */
  _currentTime: number | string;
  /** 播放进度 */
  _progress: number | string;
  /** 歌曲总时长 */
  _duration: number | string;
  /** 音质 */
  _quality:
    | "standard"
    | "higher"
    | "exhigh"
    | "lossless"
    | "hires"
    | "jyeffect"
    | "sky"
    | "jymaster";
  _volume_leveling: boolean;
  /** 点歌功能 */
  songPicker: SongPicker | undefined;
  /** 更新时间的定时器 */
  _updateTime: null | NodeJS.Timeout;
  /** 订阅事件 */
  subscriber: Subscriber;
  /** IndexDB, 用于存储播放列表 */
  db: indexDB;
  reloadInterval: null | NodeJS.Timeout = null;
  _mediaSessionInit: boolean;
  /** 是否初始化设备 */
  deviceInit: boolean = false;
  _sourceNode: MediaElementAudioSourceNode | undefined;
  _destination: MediaStreamAudioDestinationNode | undefined;
  _analyserNode: AnalyserNode | undefined;
  noUrlCount: number = 0;
  constructor() {
    this._audio = new Audio("");
    this._outputAudio = new Audio("");
    this._audio.onerror = () => this.handleAudioError(this._audio.error);
    let localVolumeLeveling =
      getStorage("setting.play.volume_leveling") ?? "true";
    this._volume_leveling = localVolumeLeveling === "true" ? true : false;
    this._audioContext = null;
    this._gainNode = null;
    // 初始化音量均衡控件
    this.initAudioContext();

    this._playlist = [];
    this._playlistId = 0;
    this._current = 0;

    this._mode = "order";

    this._history = [];
    this._historyIndex = 0;

    this._playState = "pause";

    this._volume = 1;

    this._currentTime = 0;
    this._progress = 0;
    this._duration = 0;

    this._quality = "exhigh";

    // 点歌功能
    if (window.electron?.isElectron) {
      this.songPicker = markRaw(new SongPicker());
      this.songPicker.subscriber.on({
        id: "player.js",
        func: () => {
          if (!this.songPicker?.track) return;
          this.playTrack(this.songPicker?.track);
        },
        type: "track",
      });
      this.songPicker.subscriber.on({
        id: "player.js",
        func: () => {
          if (!this.songPicker?.track) return;
          this.nextPlay(this.songPicker?.track);
        },
        type: "nextTrack",
      });
    }

    this._updateTime = null;

    this.subscriber = markRaw(
      new Subscriber([
        "playState",
        "playlist",
        "track",
        "trackReady",
        "time",
        "allTime",
        "quality",
        "volume",
        "history",
        "mode",
        "playerReady",
        "gain",
      ]),
    );

    this.db = new indexDB("ncm", "playlist");
    this.db.openDatabase().then(() => {
      // console.log('Database opened');
      this.subscriber.on({
        id: "indexDB",
        type: "playlist",
        func: () => {
          try {
            this.db.storePlaylist(this.playlist);
          } catch (error) {
            console.error(error);
          }
        },
      });
      try {
        this.db.fetchPlaylist().then((res) => {
          this._playlist = res;
          if (this._mode === "listrandom") {
            this._playlist = this._playlist.sort(() => Math.random() - 0.5);
          }
          const lastTrack = getStorage("currentTrack");
          if (lastTrack) {
            this.subscriber.on({
              id: "indexDB",
              type: "playerReady",
              func: () => {
                const autoPlay =
                  getStorage("setting.play.autoPlay") === "true";
                this.playTrack(JSON.parse(lastTrack), autoPlay);
                console.log("Last track played", JSON.parse(lastTrack));
              },
            });
          }
          this.subscriber.exec("playlist");
        });
      } catch (error) {
        console.error(error);
      }
    });

    this.subscriber.on({
      id: "currentTrackStorage",
      type: "track",
      func: () => {
        setStorage("currentTrack", JSON.stringify(this.currentTrack));
      },
    });

    this._mediaSessionInit = false;
    this.initMediaSession();

    setTimeout(() => {
      this.subscriber.exec("playerReady");
    }, 500);
  }
  /**
   * 初始化媒体会话
   */
  initMediaSession() {
    this.subscriber.on({
      id: "mediaSession",
      type: "track",
      func: () => {
        let imgSrc = this.currentTrack?.al?.picUrl;
        if (!imgSrc) imgSrc = require("@/assets/song.svg");
        let metaData = {
          title: this.currentTrackName ?? "未知歌曲",
          artist: this.currentTrackArtists
            ? this.currentTrackArtists.map((artist) => artist.name).join(" / ")
            : "未知歌手",
          album: this.currentTrack?.al?.name ?? "未知专辑",
          artwork: [
            {
              src: imgSrc ? imgSrc + "?param=96y96" : "",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: imgSrc ? imgSrc + "?param=128y128" : "",
              sizes: "128x128",
              type: "image/png",
            },
          ],
        };
        navigator.mediaSession.metadata = new window.MediaMetadata(metaData);
        navigator.mediaSession.setActionHandler("play", () => {
          this.playState = "play";
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          this.playState = "pause";
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => {
          this.previous();
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
          this.next();
        });
        navigator.mediaSession.setActionHandler("stop", () => {
          this.playState = "pause";
        });
        navigator.mediaSession.setActionHandler("seekto", (event) => {
          this.currentTime = Math.floor(event.seekTime ?? 0);
        });
        navigator.mediaSession.setActionHandler("seekbackward", (event) => {
          this.currentTime = this.currentTime - (event.seekOffset ?? 10);
        });
        navigator.mediaSession.setActionHandler("seekforward", (event) => {
          this.currentTime = this.currentTime + (event.seekOffset ?? 10);
        });
        navigator.mediaSession.playbackState = "playing";
        this._mediaSessionInit = true;
      },
    });
    this.subscriber.on({
      id: "mediaSession",
      type: "playState",
      func: () => {
        if (this._mediaSessionInit) {
          if (this.playState === "pause") {
            navigator.mediaSession.playbackState = "paused";
          } else {
            navigator.mediaSession.playbackState = "playing";
          }
        }
      },
    });
    this.subscriber.on({
      id: "mediaSession",
      type: "time",
      func: () => {
        if (this._mediaSessionInit) {
          navigator.mediaSession.setPositionState({
            position: this.currentTime,
            duration: (this.duration as number) ?? 0,
          });
        }
      },
    });
  }
  async handleAudioError(error: MediaError | null) {
    console.log("Audio Error", error);
    if (!this.currentTrack) return;
    if (navigator.onLine) {
      await this.reloadUrl();
    }
  }
  /**
   * 更新歌曲总时长、当前播放时间、播放进度
   */
  updateTime() {
    if (this._updateTime) {
      clearTimeout(this._updateTime);
    }

    const update = () => {
      // 确保音频已经加载
      if (this._audio.readyState === 0) return;

      // 确保触发time订阅事件时，时间发生了变化
      if (
        this.playState === "play" &&
        Math.floor(this._currentTime as number) !==
          Math.floor(this._audio.currentTime)
      ) {
        // 如果秒数发生了变化
        this._currentTime = Math.floor(this._audio.currentTime);
        this._duration = this._audio.duration;
        this._progress = Math.max(
          0,
          Math.min(
            1,
            parseFloat((this._currentTime / this._duration).toFixed(3)),
          ),
        );
        this.subscriber.exec("time");
        this.subscriber.exec("trackReady");
      } else if (
        this.playState === "play" &&
        this._currentTime !== this._audio.currentTime
      ) {
        // 如果毫秒数发生了变化
        this._currentTime = this._audio.currentTime;
        this._progress = (
          this._currentTime / (this._duration as number)
        ).toFixed(3);
        this.subscriber.exec("allTime");
      }

      this._updateTime = setTimeout(update, 50); // 递归调用 setTimeout
    };

    this._updateTime = setTimeout(update, 50); // 初次调用
  }
  /**
   * 由于网易云音乐限制，单个url的有效时间为20分钟，超出时间需要重新获取url
   */
  async reloadUrl() {
    if (!this.currentTrack || isLocal(this.currentTrack.id)) return;
    let result = await this.getUrl(this.currentTrack.id);
    let url = result.url;
    this._audio.src = url;
    this._audio.currentTime = this._currentTime as number;
    try {
      if (this.playState === "play") {
        await this._audio.play();
      }
      this.updateTime();
      console.log(
        "Reload url",
        {
          id: this.currentTrack.id,
          name: this.currentTrack.name,
        },
        "\nurl:",
        url,
      );
    } catch (error) {
      console.error(
        "failed to reload url of track: ",
        {
          id: this.currentTrack.id,
          name: this.currentTrack.name,
        },
        "\n",
        error,
      );
    }
  }
  /**
   * 播放指定歌曲
   * @param {Object} track 歌曲对象
   * @param {Boolean} autoPlay 是否自动播放
   */
  async playTrack(track: ITrack, autoPlay: boolean = true) {
    // 查询指定的歌曲是否在播放列表中
    let trackIndex = this._playlist.findIndex(
      (_track) => _track.id === track.id,
    );
    if (trackIndex === -1) {
      // 如果不在播放列表中则添加到播放列表
      this.addTrack(track);
      console.log("Track not in playlist, added to playlist and played", {
        id: track.id,
        name: track.name,
      });
      await this.playTrack(track);
    } else {
      // 如果在播放列表中
      // 更新上一首歌曲的播放信息
      if (this.currentTrack?.id) {
        await this.scrobble(this.currentTrack.id);
      }

      // 更新当前播放的歌曲位置
      this._current = trackIndex;
      // 触发 track 的回调函数
      this.subscriber.exec("track");

      // 获取歌曲播放信息
      let nourl = false;
      let result = null;
      if (!isLocal(track.id)) {
        result = await this.getUrl(track.id).catch((error) => {
          if (navigator.onLine && this.noUrlCount < 10) {
            this.next();
            nourl = true;
            this.noUrlCount++;
          }
        });
      } else {
        const fileUrl = `file://${track.localPath.replace(/\\/g, "/")}`;
        result = { url: fileUrl };
      }

      if (nourl) return;
      let url = result.url;
      this._audio.src = url;
      this._audio.onended = () => this.next();

      let autoPlayMsg = "Not autoplay";
      const gainMsg = await this.gainTrack(track.id);

      if (autoPlay) {
        try {
          // 更新播放状态
          await this._audio.play();
          this.playState = "play";
          autoPlayMsg = "Autoplay";
        } catch (error) {
          console.error(error);
        }
      }
      this.updateTime();
      console.log(
        "Playing",
        { id: track.id, name: track.name },
        "\n",
        "track url:",
        url,
        "\n",
        "gain message: \n",
        gainMsg,
        "\n",
        autoPlayMsg,
      );
      // 此时，歌曲已经准备就绪，触发 trackReady 的回调函数
      this.noUrlCount = 0;
      this.subscriber.exec("trackReady");
    }
  }
  async gainTrack(id: number | string): Promise<string> {
    // 获取当前歌曲的所有音质的数据(音量均衡数据)
    if (isLocal(id)) return "Local track";
    await this.setAllQuality(id);
    let gain: any = null;
    let peak: any = null;
    let gainData = [],
      peakData = [];
    // 因为所有音质的文件峰值是相同的，也是就说能够混用音量均衡数据
    // 所以，在所有音质的音量均衡数据中，查找音量最大的数据。
    const prop: Array<keyof ITrack> = [
      "l",
      "h",
      "sq",
      "hr",
      "jyeffect",
      "sky",
      "jymaster",
    ];
    for (let i = 0; i < prop.length; i++) {
      gainData.push(this.currentTrack[prop[i]]?.gain);
      peakData.push(this.currentTrack[prop[i]]?.peak);
    }
    gainData.forEach((value) => {
      if (gain === null || (value && value > gain) || gain === undefined) {
        gain = value;
      }
    });
    peakData.forEach((value) => {
      if (
        peak === null ||
        (value && value < peak && value !== 0) ||
        peak === undefined
      ) {
        peak = value;
      }
    });
    // 设置音量均衡
    let gainMsg = this.setGain(gain, peak);
    return (
      "track gain:" +
      gainData.toString() +
      "\n" +
      " track peak:" +
      peakData.toString() +
      "\n" +
      gainMsg
    );
  }

  /**
   * 获取所有音质的信息，并添加到 currentTrack
   * @param {Number} id 歌曲ID
   */
  async setAllQuality(id: number | string) {
    // 异步执行这些请求
    let requests = [];
    const abbrQualities = ["l", "h", "sq", "hr", "jyeffect", "sky", "jymaster"];
    requests = [
      this.getQuality(id, "standard").then((res: QualityInfo | null) => {
        this.currentTrack = {
          ...this.currentTrack,
          l: res,
        };
      }),
    ];
    if (this.quality !== "standard") {
      requests.push(
        this.getQuality(id, this.quality).then((res: QualityInfo | null) => {
          const index = qualities.indexOf(this.quality);
          const abbr = abbrQualities[index];
          this.currentTrack = {
            ...this.currentTrack,
            [abbr]: res,
          };
        }),
      );
    }
    // 执行所有请求
    await Promise.all(requests);
  }

  /**
   * 获取音质信息
   * @param {Number} id - 歌曲ID
   * @param {String} quality - 音质
   * @returns {QualityInfo} 返回一个包含音质信息的对象
   */
  async getQuality(
    id: number | string,
    quality: string,
  ): Promise<QualityInfo | null> {
    if (isLocal(id)) return null;
    let response = null;
    if (getStorage("login_cookie")) {
      response = await useApi("/song/url/v1", {
        id: id,
        level: quality,
        cookie: getStorage("login_cookie"),
      }).catch((error) => {
        console.error(error);
      });
    } else {
      response = await useApi("/song/url/v1", {
        id: id,
        level: quality,
      }).catch((error) => {
        console.error(error);
      });
    }
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
  /**
   * 初始化音频增益
   */
  initAudioContext() {
    if (!this._audioContext) {
      // 创建一个新的 AudioContext
      this._audioContext = new window.AudioContext();

      // 创建一个新的音频源
      this._sourceNode = this._audioContext.createMediaElementSource(
        this._audio,
      );

      // 创建一个增益节点
      this._gainNode = this._audioContext.createGain();

      // 创建一个新的音频目标，用来输出音频
      this._destination = this._audioContext.createMediaStreamDestination();

      this._sourceNode.connect(this._gainNode);
      this._gainNode.connect(this._destination);

      if (getStorage("setting.playui.spectrum") === "true") {
        // 创建 AnalyserNode
        this._analyserNode = this._audioContext.createAnalyser();
        this._analyserNode.fftSize = 1024; // 设置 FFT 大小

        // 创建高通和低通滤波器
        const highpassFilter = this._audioContext.createBiquadFilter();
        highpassFilter.type = "highpass";
        highpassFilter.frequency.value = 20;

        const lowpassFilter = this._audioContext.createBiquadFilter();
        lowpassFilter.type = "lowpass";
        lowpassFilter.frequency.value = 4400;

        this._gainNode.connect(highpassFilter);
        highpassFilter.connect(lowpassFilter);
        lowpassFilter.connect(this._analyserNode);
      }

      this._outputAudio.srcObject = this._destination.stream;
      this._outputAudio.play();

      this.setDevice(getStorage("setting.play.device") ?? "default");
    }
  }
  /**
   * 随机播放
   * @param {-1|1} direction 方向 1: 下一首 -1: 上一首
   */
  async randomPlay(direction: -1 | 1) {
    if (this._history[this._historyIndex + direction]) {
      // 如果历史记录中有上一首/下一首歌曲
      this._current = this._playlist.findIndex(
        (track) =>
          track.id === this._history[this._historyIndex + direction].id,
      );
      this._historyIndex += direction;
      this.subscriber.exec("history");
    } else if (direction === 1) {
      // 如果历史记录中没有下一首歌曲
      // 随机播放下一首
      this._current = Math.floor(Math.random() * this.playlistCount);
      this.appendToHistory(this.currentTrack);
    } else if (direction === -1) {
      // 如果历史记录中没有上一首歌曲
      // 随机播放上一首
      this._current = Math.floor(Math.random() * this.playlistCount);
      this.insertToHistory(this.currentTrack);
    }
    await this.playTrack(this.currentTrack);
  }
  /**
   * 下一首
   */
  async next() {
    // 如果播放列表为空则返回
    if (this.playlistCount === 0) return;
    // 如果播放模式为随机播放
    if (this._mode === "random") {
      // 随机播放下一首
      await this.randomPlay(1);
    } else if (this._mode === "loop") {
      // 循环播放
      await this.playTrack(this.currentTrack);
    } else {
      // 顺序播放下一首
      this._current = (this._current + 1) % this.playlistCount;
      await this.playTrack(this.currentTrack);
    }
  }
  /**
   * 上一首
   */
  async previous() {
    // 如果播放列表为空则返回
    if (this.playlistCount === 0) return;
    // 如果播放模式为随机播放
    if (this._mode === "random") {
      // 随机播放上一首
      await this.randomPlay(-1);
    } else {
      // 顺序播放上一首
      this._current =
        (this._current - 1 + this.playlistCount) % this.playlistCount;
      await this.playTrack(this.currentTrack);
    }
  }
  /**
   * 获取播放列表
   */
  get playlist() {
    return this._playlist;
  }
  /**
   * 获取播放列表长度
   */
  get playlistCount() {
    return this._playlist.length;
  }
  /**
   * 设置播放列表
   */
  set playlist(list) {
    // 清空播放历史
    this.clearHistory();
    if (this._mode === "listrandom") {
      // 如果播放模式为随机播放
      this._playlist = list.sort(() => Math.random() - 0.5);
    } else if (this._playlist !== list) {
      // 如果播放模式为其它模式
      this._playlist = list;
    }
    this.subscriber.exec("playlist");
  }
  deleteTrack(id: string | number) {
    let index = this._playlist.findIndex((track) => track.id === id);
    if (index === -1) return;
    this._playlist.splice(index, 1);
    if (index === this._current) {
      this.playTrack(this.currentTrack);
    }
    this.subscriber.exec("playlist");
  }
  /**
   * 添加列表到播放列表
   */
  addPlaylist(list: ITrack[]) {
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
    const tracksToAdd: ITrack[] = [];

    list.forEach((track) => {
      // 使用 Map 进行 O(1) 查找
      if (!playlistMap.has(track.id)) {
        tracksToAdd.push(track);
      }
    });

    // 如果有歌曲要添加
    if (tracksToAdd.length > 0) {
      if (this._mode === "listrandom") {
        // 随机插入的情况
        tracksToAdd.forEach((track) => {
          this._playlist.splice(
            Math.floor(Math.random() * this.playlistCount),
            0,
            track,
          );
        });
      } else {
        // 顺序插入到播放列表
        this._playlist.push(...tracksToAdd);
      }
    }
    // 找到当前歌曲的索引
    if (ori_track) {
      this._current = this._playlist.findIndex(
        (track) => track.id === ori_track.id,
      );
    }
    if (playFirst) {
      this.playTrack(this.currentTrack, false);
    }
    this.subscriber.exec("playlist");
  }
  /**
   * 清空播放列表
   */
  clearPlaylist() {
    this._playlist = [];
    this._current = 0;
    this._audio.pause();
    this.playState = "play";
    this._audio.src = "";
    this.clearHistory();
    this.subscriber.exec("playlist");
  }
  /**
   * 下一首播放指定歌曲
   * @param {Object} track 歌曲对象
   */
  nextPlay(track: ITrack) {
    // 查询指定的歌曲是否在播放列表中
    let trackIndex = this._playlist.findIndex(
      (_track) => _track.id === track.id,
    );
    if (trackIndex !== -1) {
      // 如果在播放列表中，则将其移动到下一首
      let exchange = this._playlist[this._current + 1];
      this._playlist[this._current + 1] = this._playlist[trackIndex];
      this._playlist[trackIndex] = exchange;
    } else {
      // 如果不在播放列表中，则添加到下一首
      this._playlist.splice(this._current + 1, 0, track);
    }
    this.subscriber.exec("playlist");
  }
  /**
   * 播放全部
   * @param {Array} list 歌曲列表
   */
  async playAll(list: Array<ITrack>) {
    // 设置播放列表
    this.playlist = list;
    // 设置当前播放索引为0
    this._current = 0;
    // 清空播放历史
    this.clearHistory();
    if (this._mode === "random") {
      // 如果播放模式为随机播放
      this.randomPlay(1);
    } else {
      // 如果不为随机播放，则播放第一首
      await this.playTrack(this.currentTrack);
    }
  }
  /**
   * 添加歌曲到播放列表
   * @param {Object} value 歌曲对象
   */
  addTrack(value: ITrack) {
    // 查询指定的歌曲是否在播放列表中
    let trackIndex = this._playlist.findIndex(
      (_track) => _track.id === value.id,
    );
    if (trackIndex === -1) {
      // 如果不在播放列表中则添加到下一首
      this._playlist.splice(this._current + 1, 0, value);
    } else {
      // 如果在播放列表中则替换到播放列表
      this._playlist.splice(trackIndex, 1);
    }
    // 如果播放模式为随机播放
    if (this._mode === "random") {
      // 将历史的下一首替换为当前歌曲
      this._history = this._history.splice(this._historyIndex + 1, 0, value);
      this.subscriber.exec("history");
    }
    this.subscriber.exec("playlist");
  }
  /**
   * 更新歌单播放数据
   */
  async updatePlaycount() {
    if (!getStorage("login_cookie")) return;
    await useApi("/playlist/update/playcount", {
      id: this._playlistId,
      cookie: getStorage("login_cookie"),
    })
      .then((res) => {
        console.log(
          "update playlist playcount: ",
          this._playlistId,
          "response",
          res,
        );
      })
      .catch((err) => {
        console.log("update playlist playcount error: ", err);
      });
  }
  /**
   * 更新歌曲播放数据(此网易云音乐接口可能已弃用)
   * @param {Number} id 歌曲ID
   */
  async scrobble(id: number) {
    return;
    // 此接口已弃用
    if (!getStorage("login_cookie")) return;
    if ((this._playlistId as number) > 0) {
      await useApi("/scrobble", {
        id: id,
        time: this._currentTime,
        sourceId: this._playlistId,
        cookie: getStorage("login_cookie"),
      })
        .then(() => {
          // console.log('update song playcount: ', id, 'time', this._currentTime, 'response: ', res);
        })
        .catch((err) => {
          console.log("update song playcount error: ", err);
        });
    } else {
      await useApi("/scrobble", {
        id: id,
        time: this._currentTime,
        cookie: getStorage("login_cookie"),
      })
        .then(() => {
          // console.log('update song playcount: ', id, 'response: ', res);
        })
        .catch((err) => {
          console.log("update song playcount error: ", err);
        });
    }
  }
  /**
   * 获取当前歌曲的位置
   */
  get current() {
    return this._current;
  }
  /**
   * 获取当前歌曲
   */
  get currentTrack() {
    return this._playlist[this._current];
  }
  /**
   * 设置当前歌曲
   */
  set currentTrack(value) {
    if (this._playlist.length > 0 && this._playlist[this._current]) {
      this._playlist[this._current] = value;
      // this.Execute({ type: 'track' });
    }
  }
  /**
   * 获取当前歌曲封面
   */
  get currentTrackCover() {
    return this._playlist[this._current]?.al.picUrl;
  }
  /**
   * 获取当前播放歌曲名称
   */
  get currentTrackName() {
    return this._playlist[this._current]?.name;
  }
  /**
   * 获取当前播放歌曲作者
   */
  get currentTrackArtists() {
    return this._playlist[this._current]?.ar;
  }
  /**
   * 获取播放歌单ID
   */
  get playlistId() {
    return this._playlistId as number;
  }
  /**
   * 设置播放歌单ID
   * @param {Number} value 歌单ID
   */
  set playlistId(value: number) {
    this._playlistId = value;
    this.updatePlaycount();
  }
  /**
   * 获取播放模式
   */
  get mode() {
    return this._mode;
  }
  /**
   * 设置播放模式
   * @param {'order'|'listloop'|'random'|'loop'|'listrandom'} value 播放模式
   */
  set mode(value: "order" | "listloop" | "random" | "loop" | "listrandom") {
    if (value === this._mode) return;
    if (
      value !== "order" &&
      value !== "listloop" &&
      value !== "random" &&
      value !== "loop" &&
      value !== "listrandom"
    ) {
      console.log("Mode not supported: ", value);
      return;
    }
    // 如果播放模式改变
    if (value === this._mode) return;

    // 清空播放历史
    this.clearHistory();
    // 设置播放模式
    this._mode = value;
    this.subscriber.exec("mode");
    // 如果播放模式不为列表随机
    if (
      value === "order" ||
      value === "listloop" ||
      value === "random" ||
      value === "loop"
    ) {
      // 保存当前歌曲
      let ori_track = this._playlist[this._current];
      // 按照原始索引排序
      this._playlist = this._playlist.sort(
        (a, b) => a.originalIndex - b.originalIndex,
      );
      // 找到当前歌曲的索引
      if (ori_track) {
        this._current = this._playlist.findIndex(
          (track) => track.id === ori_track.id,
        );
      }
    } else if (value === "listrandom") {
      // 保存当前歌曲
      let ori_track = this._playlist[this._current];
      if (!ori_track) return;
      // 否则随机排序
      this._playlist = this._playlist.sort(() => Math.random() - 0.5);
      // 找到当前歌曲的索引
      if (ori_track) {
        this._current = this._playlist.findIndex(
          (track) => track.id === ori_track.id,
        );
      }
    }
  }
  /**
   * 获取播放历史
   */
  get history() {
    return this._history;
  }
  /**
   * 添加到历史
   * @param {Object} track 歌曲对象
   */
  appendToHistory(track: ITrack) {
    this._history.push(track);
    this._historyIndex = this._history.length - 1;
    this.subscriber.exec("history");
  }
  /**
   * 插入到历史开头
   * @param {Object} track 歌曲对象
   */
  insertToHistory(track: ITrack) {
    this._history.splice(0, 0, track);
    this._historyIndex = 0;
    this.subscriber.exec("history");
  }
  /**
   * 清空历史
   */
  clearHistory() {
    this._history = [];
    this._historyIndex = 0;
    this.subscriber.exec("history");
  }
  /**
   * 获取播放状态
   */
  get playState() {
    return this._playState;
  }
  /**
   * 设置播放状态
   * @param {'play'|'pause'} value 播放状态
   */
  set playState(value: "play" | "pause") {
    if (value === "play" || value === "pause") {
      if (this._audio && this._audio.readyState) {
        this._playState = value;
        this._playState === "play" ? this._audio?.play() : this._audio?.pause();
        if (this._playState === "pause") {
          if (this.reloadInterval) {
            clearInterval(this.reloadInterval);
          }
          this.reloadInterval = setInterval(
            () => {
              this.reloadUrl();
            },
            1000 * 60 * 20,
          );
        } else {
          if (this.reloadInterval) {
            clearInterval(this.reloadInterval);
          }
        }
        this.subscriber.exec("playState");
      } else {
        console.log("Audio not ready");
      }
    } else {
      console.error("PlayState not supported: ", value);
    }
  }
  /**
   * 切换播放状态
   */
  tooglePlayState() {
    this.playState = this.playState === "play" ? "pause" : "play";
  }
  /**
   * 获取歌曲url
   */
  async getUrl(id: number | string) {
    let response = null;
    if (isLocal(id)) return null;
    const downloads = store.state.download.downloadedSongs;
    if (
      downloads.some((song) => song.id === id) &&
      window.electron?.isElectron
    ) {
      let song = downloads.find((song) => song.id === id);
      if (fs.existsSync(song?.path) && song) {
        const fileUrl = `file://${song.path.replace(/\\/g, "/")}`;
        return { url: fileUrl };
      } else {
        Message.post("error", "player.local_file_not_found");
        if (song) store.state.download.delete(song.id);
      }
    }
    if (getStorage("login_cookie")) {
      response = await useApi("/song/url/v1", {
        id: id,
        level: this.quality,
        cookie: getStorage("login_cookie"),
      }).catch((error) => {
        console.error(error);
      });
    } else {
      response = await useApi("/song/url/v1", {
        id: id,
        level: this.quality,
      }).catch((error) => {
        console.error(error);
      });
    }
    let result = response.data[0];
    if (result.url === null) {
      const msg = i18n.global.t("player.noUrlError");
      Message.post("error", msg);
      throw new Error("Failed to get track url");
    }
    return result;
  }
  /**
   * 分贝转换为线性
   * @param {Number} dB 分贝
   */
  dBToGain(dB: number) {
    return Math.pow(10, dB / 20);
  }
  /**
   * 获取音量
   */
  get volume() {
    return this._volume;
  }
  /**
   * 设置音量
   * @param {Number} value 音量
   */
  set volume(value: number) {
    if (value >= 0 && value <= 1) {
      this._volume = value;
      this._audio.volume = value;
      this.subscriber.exec("volume");
    }
  }
  /**
   * 设置增益
   * @param {Number} gain 增益，单位为分贝
   * @param {Number} peak 峰值，用于判断增益是否合理，0到1之间
   * @returns {String} 返回设置增益的信息
   */
  setGain(gain: number, peak: number): string {
    if (!this._volume_leveling) {
      (gain = 1), (peak = 1);
    }
    // 将分贝转换为线性
    let gain_linear = this.dBToGain(gain);
    // 如果新的贬值大于1且峰值不为0
    if (peak * gain_linear > 1 && peak !== 0) {
      // 重新计算增益
      gain_linear = 1 / peak;
    }
    if (
      gain_linear < 0 ||
      typeof gain_linear !== "number" ||
      isNaN(gain_linear) ||
      gain_linear === Infinity ||
      peak === Infinity ||
      peak < 0 ||
      peak > 2 ||
      typeof peak !== "number" ||
      isNaN(peak)
    ) {
      return "Gain not supported, gain: " + gain_linear + "peak: " + peak;
    }
    if (gain_linear > 4) {
      gain_linear = 4;
    }
    // 设置增益
    let setGainNodeMsg = "gainNode not found";
    try {
      if (this._gainNode) {
        this._gainNode.gain.value = gain_linear;
        this.subscriber.exec("gain");
        setGainNodeMsg = " gainNode set to " + gain_linear;
      }
    } catch (error) {
      console.error(error);
    }
    if (!this._volume_leveling) {
      return "\n Volume leveling is off, gain set to 1";
    }
    return (
      "\n Required Gain: " +
      this.dBToGain(gain).toFixed(3) +
      ", Gain set to " +
      gain_linear.toFixed(3) +
      "\n Original Peak: " +
      peak.toFixed(3) +
      ", Peak set to " +
      (peak * gain_linear).toFixed(3) +
      "\n" +
      setGainNodeMsg
    );
  }
  /**
   * 获取当前播放时间
   */
  get currentTime() {
    return this._currentTime as number;
  }
  /**
   * 设置当前播放时间
   * @param {Number} value 当前播放时间
   */
  set currentTime(value: number) {
    if (value >= 0 && value <= (this._duration as number)) {
      this._audio.currentTime = value;
      this._currentTime = value;
      this._progress = value / (this._duration as number);
      this.subscriber.exec("time");
    }
  }
  /**
   * 获取播放进度
   */
  get progress() {
    return this._progress as number;
  }
  /**
   * 设置播放进度
   * @param {Number} value 播放进度，0-1之间
   */
  set progress(value: number) {
    if (value >= 0 && value <= 1) {
      this._progress = value;
      this._currentTime = (this._duration as number) * value;
      this._audio.currentTime = this._currentTime;
    }
  }
  /**
   * 获取歌曲总时长
   */
  get duration() {
    return this._duration;
  }
  /**
   * 获取音质
   */
  get quality() {
    return this._quality;
  }
  /**
   * 设置音质
   * @param {'standard'|'higher'|'exhigh'|'lossless'|'hires'|'jyeffect'|'sky'|'jymaster'} value 音质
   */
  set quality(
    value:
      | "standard"
      | "higher"
      | "exhigh"
      | "lossless"
      | "hires"
      | "jyeffect"
      | "sky"
      | "jymaster",
  ) {
    if (qualities.includes(value)) {
      this._quality = value;
      this.reloadUrl();
      this.subscriber.exec("quality");
    } else {
      console.log("Quality not supported: ", value);
    }
  }
  /**
   * 获取音质显示
   */
  get qualityDisplay():
    | "quality.standard"
    | "quality.higher"
    | "quality.exhigh"
    | "quality.lossless"
    | "quality.hires"
    | "quality.jyeffect"
    | "quality.sky"
    | "quality.jymaster"
    | "quality.default"
    | "quality.local" {
    if (
      store.state.download.downloadedSongs.some(
        (song) => song.id == this.currentTrack?.id,
      )
    ) {
      return "quality.local";
    }
    switch (this.quality) {
      case "standard":
        return "quality.standard";
      case "higher":
        return "quality.higher";
      case "exhigh":
        return "quality.exhigh";
      case "lossless":
        return "quality.lossless";
      case "hires":
        return "quality.hires";
      case "jyeffect":
        return "quality.jyeffect";
      case "sky":
        return "quality.sky";
      case "jymaster":
        return "quality.jymaster";
      default:
        return "quality.default";
    }
  }
  /**
   * 格式化音频文件大小
   * @param {Number} size 文件大小, 单位为字节
   */
  formatSize(size: number) {
    if (size < 1024) {
      return size + "B";
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + "KB";
    } else if (size < 1024 * 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(1) + "MB";
    }
  }
  /**
   * 获取当前歌曲的可用音质
   * @returns {Array} 返回一个包含音质信息的数组, 数组元素为对象: {name: 'quality', size: 'size'}
   */
  get availableQuality(): Array<{
    name:
      | "exhigh"
      | "standard"
      | "lossless"
      | "hires"
      | "jyeffect"
      | "sky"
      | "jymaster";
    size: string | undefined;
  }> {
    let result: Array<{
      name:
        | "exhigh"
        | "standard"
        | "lossless"
        | "hires"
        | "jyeffect"
        | "sky"
        | "jymaster";
      size: string | undefined;
    }> = [];
    if (!this.currentTrack) return [];
    if (this.currentTrack.h) {
      result.push({
        name: "exhigh",
        size: this.formatSize(this.currentTrack.h.size),
      });
    }
    if (this.currentTrack.l) {
      result.push({
        name: "standard",
        size: this.formatSize(this.currentTrack.l.size),
      });
    }
    if (this.currentTrack.sq) {
      result.push({
        name: "lossless",
        size: this.formatSize(this.currentTrack.sq.size),
      });
    }
    if (this.currentTrack.hr) {
      result.push({
        name: "hires",
        size: this.formatSize(this.currentTrack.hr.size),
      });
    }
    if (this.currentTrack.jyeffect) {
      result.push({
        name: "jyeffect",
        size: this.formatSize(this.currentTrack.jyeffect.size),
      });
    }
    if (this.currentTrack.sky) {
      result.push({
        name: "sky",
        size: this.formatSize(this.currentTrack.sky.size),
      });
    }
    if (this.currentTrack.jymaster) {
      result.push({
        name: "jymaster",
        size: this.formatSize(this.currentTrack.jymaster.size),
      });
    }
    return result;
  }
  /**
   * 获取音量均衡状态
   */
  get volumeLeveling() {
    return this._volume_leveling;
  }
  /**
   * 设置音量均衡状态
   */
  set volumeLeveling(value: boolean) {
    this._volume_leveling = value;
    if (!this.currentTrack) return;
    this.gainTrack(this.currentTrack?.id).then((msg) => {
      console.log("Volume leveling:", msg);
    });
  }
  /**
   * 获取输出设备
   */
  get device() {
    return this._outputAudio.sinkId;
  }
  /**
   * 设置输出设备
   */
  async setDevice(value: string) {
    await this._outputAudio.setSinkId(value).catch((error) => {
      console.error(error);
    });
    if (this.playState === "play") {
      await this._audio.play();
    }
  }
}
