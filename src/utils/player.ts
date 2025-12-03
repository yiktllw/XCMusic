/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * player.ts (Proxy Version)
 * 代理所有操作到 Hidden Window
 *---------------------------------------------------------------*/

import { markRaw } from "vue";
import { Subscriber } from "@/utils/subscribe";
import { SongPicker } from "@/utils/damakuSongPicker";
import { SongPickerEvents } from "@/dual/damakuSongPicker";
import { type IEqualizer, PlayerEvents } from "@/dual/player";
import { Message } from "@/dual/YMessageC";
import store from "@/store";
import i18n from "@/i18n";
import { type ITrack } from "@/utils/tracks";
import { type LrcItem, type LrcItem2, type YrcItem } from "@/utils/lyric";

const ipcRenderer = window.electron?.ipcRenderer;

type PlayerEventCallbacks = {
  [PlayerEvents.playState]: () => void;
  [PlayerEvents.playlist]: () => void;
  [PlayerEvents.track]: () => void;
  [PlayerEvents.trackReady]: () => void;
  [PlayerEvents.lyrics]: () => void;
  [PlayerEvents.time]: () => void;
  [PlayerEvents.quality]: () => void;
  [PlayerEvents.volume]: () => void;
  [PlayerEvents.history]: () => void;
  [PlayerEvents.mode]: () => void;
  [PlayerEvents.playerReady]: () => void;
  [PlayerEvents.gain]: () => void;
};

export class Player {
  _playlist: ITrack[] = [];
  _playlistId: number | string = 0;
  _current: number = 0;
  _mode: "order" | "listloop" | "random" | "loop" | "listrandom" = "order";
  _history: ITrack[] = [];
  _historyIndex: number = 0;
  _playState: "play" | "pause" = "pause";
  _volume: number = 1;
  _currentTime: number = 0;
  _progress: number = 0;
  _duration: number = 0;
  _quality: string = "exhigh";
  _volume_leveling: boolean = true;
  _lyrics: Array<LrcItem | LrcItem2 | YrcItem> = [];
  songPicker: SongPicker | undefined;
  subscriber: Subscriber<PlayerEventCallbacks> =
    new Subscriber<PlayerEventCallbacks>(PlayerEvents);

  // Mock objects to prevent crashes if accessed
  _audio: any = {
    src: "",
    volume: 1,
    currentTime: 0,
    duration: 0,
    play: async () => {},
    pause: () => {},
  };
  _outputAudio: any = { setSinkId: async () => {} };
  _audioContext: any = null;
  _gainNode: any = null;
  _spectrumData: Uint8Array | null = null;
  _analyserNode: any = {
    frequencyBinCount: 1024,
    context: { sampleRate: 44100 },
    getByteFrequencyData: (array: Uint8Array) => {
      if (this._spectrumData) {
        array.set(this._spectrumData);
      }
    },
  };
  db: any = { openDatabase: async () => {}, fetchPlaylist: async () => [] };

  constructor() {
    if (window.electron?.isElectron) {
      this.initIPC();

      this.songPicker = markRaw(new SongPicker());
      this.songPicker.subscriber.on("player.js", SongPickerEvents.Track, () => {
        if (!this.songPicker?.track) return;
        this.playTrack(this.songPicker?.track);
      });
      this.songPicker.subscriber.on(
        "player.js",
        SongPickerEvents.NextTrack,
        () => {
          if (!this.songPicker?.track) return;
          this.nextPlay(this.songPicker?.track);
        },
      );

      // Sync downloaded songs initially and on change
      setTimeout(() => {
        this.syncDownloadedSongs();
        // Watch for download changes (this is a bit hacky, better to use store subscription)
        store.watch(
          (state) => state.download.downloadedSongs,
          () => {
            this.syncDownloadedSongs();
          },
          { deep: true },
        );
      }, 1000);
    }
  }

  initIPC() {
    if (!ipcRenderer) return;

    // Clean up existing listeners to prevent duplicates on HMR or re-instantiation
    ipcRenderer.removeAllListeners("player-event");
    ipcRenderer.removeAllListeners("player-spectrum");
    ipcRenderer.removeAllListeners("player-error");
    ipcRenderer.removeAllListeners("player-ready");

    ipcRenderer.on("player-ready", () => {
      this.sendCommand("getState");
    });

    ipcRenderer.on("player-event", ({ event: eventName, data }) => {
      switch (eventName) {
        case PlayerEvents.time:
          this._currentTime = data.currentTime;
          this._duration = data.duration;
          this._progress = data.progress;
          if (data.sampleRate && this._analyserNode) {
            this._analyserNode.context.sampleRate = data.sampleRate;
          }
          break;
        case PlayerEvents.playState:
          this._playState = data;
          break;
        case PlayerEvents.track:
          // data is currentTrack.
          // Update _current index if possible
          if (data) {
            const idx = this._playlist.findIndex((t) => t.id === data.id);
            if (idx !== -1) {
              this._current = idx;
            }
            // Update track info in playlist
            if (this._playlist[this._current]) {
              this._playlist[this._current] = data;
            }
          }
          break;
        case PlayerEvents.playlist:
          this._playlist = data;
          break;
        case PlayerEvents.volume:
          this._volume = data;
          break;
        case PlayerEvents.quality:
          this._quality = data;
          break;
        case PlayerEvents.mode:
          this._mode = data;
          break;
        case PlayerEvents.lyrics:
          this._lyrics = data;
          break;
        case PlayerEvents.history:
          this._history = data;
          break;
      }
      this.subscriber.exec(eventName);
    });

    ipcRenderer.on("player-spectrum", (data: any) => {
      // data is { data: number[] }
      if (data && data.data) {
        // Convert back to Uint8Array if it was serialized to array
        this._spectrumData = new Uint8Array(data.data);
      }
    });

    ipcRenderer.on("player-error", (error: any) => {
      if (error.translate) {
        Message.post(error.type, i18n.global.t(error.key));
      } else {
        Message.post(error.type, error.message);
      }
    });

    // Request initial state
    this.sendCommand("getState");
  }

  syncDownloadedSongs() {
    const songs = store.state.download.downloadedSongs.map((s) => ({
      id: s.id,
      path: s.path,
    }));
    this.sendCommand("setDownloadedSongs", songs);
  }

  sendCommand(command: string, args?: any) {
    const sanitizedArgs = args ? JSON.parse(JSON.stringify(args)) : args;
    ipcRenderer?.send("player-command", { command, args: sanitizedArgs });
  }

  // Methods
  async playTrack(
    track: ITrack,
    autoPlay: boolean = true,
    delay: number = 0,
    progress?: any,
  ) {
    this.sendCommand("playTrack", { track, autoPlay, delay, progress });
  }

  async next() {
    this.sendCommand("next");
  }
  async previous() {
    this.sendCommand("prev");
  }
  tooglePlayState() {
    this.sendCommand("togglePlay");
  }

  // Getters and Setters
  get playlist() {
    return this._playlist;
  }
  set playlist(list) {
    this._playlist = list; // Optimistic update
    this.sendCommand("setPlaylist", list);
  }

  get playlistCount() {
    return this._playlist.length;
  }

  deleteTrack(id: string | number) {
    this.sendCommand("deleteTrack", id);
  }
  addPlaylist(list: ITrack[]) {
    this.sendCommand("addPlaylist", list);
  }
  clearPlaylist() {
    this.sendCommand("clearPlaylist");
  }
  nextPlay(track: ITrack) {
    this.sendCommand("nextPlay", track);
  }
  playAll(list: Array<ITrack>) {
    this.sendCommand("playAll", list);
  }
  addTrack(value: ITrack) {
    this.sendCommand("addTrack", value);
  }

  updatePlaycount() {
    /* Handled in core or ignored */
  }

  get current() {
    return this._current;
  }
  get currentTrack(): ITrack | null {
    return this._playlist[this._current];
  }
  set currentTrack(value: ITrack) {
    /* Read only mostly, or impl set */
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

  get playlistId() {
    return this._playlistId as number;
  }
  set playlistId(value: number) {
    this._playlistId = value; /* Sync? */
  }

  get mode() {
    return this._mode;
  }
  set mode(value) {
    this.sendCommand("setMode", value);
  }

  get history() {
    return this._history;
  }

  get playState() {
    return this._playState;
  }
  set playState(value) {
    if (value === "play") this.sendCommand("play");
    else this.sendCommand("pause");
  }

  get volume() {
    return this._volume;
  }
  set volume(value) {
    this.sendCommand("setVolume", value);
  }

  get currentTime() {
    return this._currentTime;
  }
  set currentTime(value) {
    this.sendCommand("seek", value);
  }

  get progress() {
    return this._progress;
  }
  set progress(value) {
    this._progress = value;
    this.sendCommand("seek", this._duration * value);
  }

  get duration() {
    return this._duration;
  }

  get quality() {
    return this._quality;
  }
  set quality(value) {
    this.sendCommand("setQuality", value);
  }

  get volumeLeveling() {
    return this._volume_leveling;
  }
  set volumeLeveling(value) {
    this.sendCommand("setVolumeLeveling", value);
  }

  get device() {
    return this._outputAudio.sinkId;
  } // This might be tricky to sync
  async setDevice(value: string) {
    this.sendCommand("setDevice", value);
  }

  get lyrics() {
    return this._lyrics;
  }

  // Equalizer
  setEqualizer(equalizer: IEqualizer) {
    this.sendCommand("setEqualizer", equalizer);
  }
  getEqualizer(): IEqualizer {
    // This is hard because it's async.
    // We might need to cache the last set equalizer or request it.
    // For now return default or cached.
    return {
      _32Hz: 0,
      _64Hz: 0,
      _125Hz: 0,
      _250Hz: 0,
      _500Hz: 0,
      _1kHz: 0,
      _2kHz: 0,
      _4kHz: 0,
      _8kHz: 0,
      _16kHz: 0,
    };
  }

  // Helpers
  formatSize(size: number) {
    if (size < 1024) return size + "B";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + "KB";
    else if (size < 1024 * 1024 * 1024)
      return (size / 1024 / 1024).toFixed(1) + "MB";
  }

  get qualityDisplay() {
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

  get availableQuality() {
    let result = [];
    if (!this.currentTrack) return [];
    if (this.currentTrack.h)
      result.push({
        name: "exhigh",
        size: this.formatSize(this.currentTrack.h.size),
      });
    if (this.currentTrack.l)
      result.push({
        name: "standard",
        size: this.formatSize(this.currentTrack.l.size),
      });
    if (this.currentTrack.sq)
      result.push({
        name: "lossless",
        size: this.formatSize(this.currentTrack.sq.size),
      });
    if (this.currentTrack.hr)
      result.push({
        name: "hires",
        size: this.formatSize(this.currentTrack.hr.size),
      });
    if (this.currentTrack.jyeffect)
      result.push({
        name: "jyeffect",
        size: this.formatSize(this.currentTrack.jyeffect.size),
      });
    if (this.currentTrack.sky)
      result.push({
        name: "sky",
        size: this.formatSize(this.currentTrack.sky.size),
      });
    if (this.currentTrack.jymaster)
      result.push({
        name: "jymaster",
        size: this.formatSize(this.currentTrack.jymaster.size),
      });
    return result;
  }
}
