/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * playerCore.ts — Player 协调层
 *---------------------------------------------------------------*/

import { Lyrics, Song } from "@/utils/api";
import { Subscriber } from "@/utils/subscribe";
import { type IEqualizer, PlayerEvents } from "@/dual/player";
import indexDB from "@/utils/indexDB";
import { isLocal } from "@/utils/localTracks_renderer";
import { qualities } from "@/utils/setting";
import { type ITrack } from "@/utils/tracks";
import { getStorage, setStorage, StorageKey } from "@/utils/render_storage";
import { type LrcItem, type LrcItem2, type YrcItem } from "@/utils/lyric";
import {
  type GaplessBufferDebugSnapshot,
  type PlayMode,
  type QualityInfo,
  resolveInitialPlayMode,
} from "./types";
import { AudioEngine } from "./AudioEngine";
import { GaplessEngine } from "./GaplessEngine";
import { PlaylistEngine } from "./PlaylistEngine";
import { HistoryEngine } from "./HistoryEngine";
import { SessionEngine } from "./SessionEngine";
import { MediaSessionBridge } from "./MediaSessionBridge";

const ipcRenderer = window.electron?.ipcRenderer;

var fs: any;
if (window.electron?.isElectron) {
  fs = window.api.fs;
}

export class Player {
  _audio: HTMLAudioElement = new Audio();
  _preloadAudio: HTMLAudioElement = new Audio();
  _outputAudio: HTMLAudioElement = new Audio();

  audioEngine: AudioEngine;
  gaplessEngine: GaplessEngine;
  playlistEngine: PlaylistEngine;
  historyEngine: HistoryEngine;
  sessionEngine: SessionEngine;
  mediaSessionBridge: MediaSessionBridge;

  _playState: "play" | "pause" = "pause";
  _volume: number = 1;
  _currentTime: number = 0;
  _progress: number = 0;
  _bufferedProgress: number = 0;
  _duration: number = 0;
  _quality:
    | "standard"
    | "higher"
    | "exhigh"
    | "lossless"
    | "hires"
    | "jyeffect"
    | "sky"
    | "jymaster" = getStorage(StorageKey.Setting_Play_Quality) ?? "exhigh";
  _volume_leveling: boolean =
    getStorage(StorageKey.Setting_Play_VolumeLeveling) ?? true;
  _lyrics: Array<LrcItem | LrcItem2 | YrcItem> = [];
  _updateTime: null | NodeJS.Timeout = null;
  reloadInterval: null | NodeJS.Timeout = null;
  subscriber: Subscriber<any> = new Subscriber(PlayerEvents);
  db: indexDB = new indexDB("ncm", "playlist");
  localHistoryDB: indexDB = new indexDB("ncm_play_history", "history");
  noUrlCount: number = 0;
  _downloadedSongs: any[] = [];
  _mode: PlayMode = resolveInitialPlayMode();

  constructor() {
    this.audioEngine = new AudioEngine(this);
    this.historyEngine = new HistoryEngine(this.subscriber);
    this.sessionEngine = new SessionEngine();
    this.playlistEngine = new PlaylistEngine(this.subscriber);
    this.gaplessEngine = new GaplessEngine(this as any);
    this.mediaSessionBridge = new MediaSessionBridge();

    this.configureAudioElement(this._audio);
    this.configureAudioElement(this._preloadAudio);
    this.bindActiveAudioCallbacks();
    this.gaplessEngine.resetPreloadAudioState();
    this.audioEngine.initAudioContext();

    navigator.mediaDevices?.addEventListener("devicechange", () =>
      this.handleDeviceChange(),
    );

    this.db.openDatabase().then(() => {
      this.subscriber.on("indexDB", PlayerEvents.playlist, () => {
        try {
          this.db.storePlaylist(this.playlistEngine.playlist);
        } catch (e) {
          console.error(e);
        }
      });
      try {
        this.db.fetchPlaylist().then((res) => {
          this.playlistEngine._playlist = res;
          const lastTrack = getStorage(StorageKey.CurrentTrack);
          if (lastTrack) {
            this.subscriber.on("indexDB", PlayerEvents.playerReady, () => {
              const autoPlay =
                getStorage(StorageKey.Setting_Play_AutoPlay) ?? false;
              this.playTrack(
                lastTrack,
                autoPlay ?? true,
                1600,
                getStorage(StorageKey.Track_Progress) ?? undefined,
              );
            });
          }
          this.subscriber.exec(PlayerEvents.playlist);
        });
      } catch (e) {
        console.error(e);
      }
    });

    this.localHistoryDB
      .openDatabase()
      .catch((e) => console.error("localHistoryDB", e));

    this.subscriber.on("currentTrackStorage", PlayerEvents.track, () => {
      setStorage(StorageKey.CurrentTrack, this.currentTrack);
    });
    this.subscriber.on("player", PlayerEvents.track, () => {
      if (!this.currentTrack?.id) return;
      Lyrics.get(this.currentTrack.id).then((l) => {
        this.lyrics = l;
      });
    });

    this.mediaSessionBridge.init(
      this.subscriber,
      () => this.currentTrack,
      () => this.playlistEngine.currentTrackName,
      () => this.playlistEngine.currentTrackArtists,
      () => this._playState,
      (v) => (this.playState = v),
      () => this.previous(),
      () => this.next(),
      (v) => (this.currentTime = v),
      () => this._currentTime,
      () => this._duration,
    );

    setTimeout(() => this.subscriber.exec(PlayerEvents.playerReady), 500);
  }

  configureAudioElement(el: HTMLAudioElement) {
    el.crossOrigin = "anonymous";
    el.preload = "auto";
    el.autoplay = false;
    el.volume = this._volume;
  }

  private syncTimeFromAudio(emitTrackReady = false) {
    const d = this._audio.duration;
    if (Number.isFinite(d) && d > 0) this._duration = d;
    const ct = Number.isFinite(this._audio.currentTime)
      ? Math.max(0, this._audio.currentTime)
      : 0;
    this._currentTime = Math.floor(ct);
    if (this._duration > 0)
      this._progress = Math.max(
        0,
        Math.min(
          1,
          parseFloat((this._currentTime / this._duration).toFixed(3)),
        ),
      );
    else this._progress = 0;
    this.updateBufferedProgressFromAudio();
    this.subscriber.exec(PlayerEvents.time);
    if (emitTrackReady) this.subscriber.exec(PlayerEvents.trackReady);
  }

  bindActiveAudioCallbacks() {
    this._audio.onerror = () => this.handleAudioError();
    this._audio.onended = () => {
      void this.handleTrackEnded();
    };
    const hm = () => this.syncTimeFromAudio(true);
    this._audio.onloadedmetadata = hm;
    this._audio.ondurationchange = hm;
  }

  private updateBufferedProgressFromAudio() {
    this._bufferedProgress = this.gaplessEngine.updateBufferedProgressFromAudio(
      this._audio,
      this._progress,
    );
  }

  updateTime() {
    if (this._updateTime) clearTimeout(this._updateTime);
    const update = () => {
      this.sessionEngine.tickPlaybackSession(
        this.currentTrack,
        this._playState,
        this._audio.duration,
      );
      if (this._playState === "play")
        void this.gaplessEngine.prepareGaplessPreload(false);
      if (this._audio.readyState === 0) {
        this._updateTime = setTimeout(update, 300);
        return;
      }
      const prevBP = this._bufferedProgress;
      this.updateBufferedProgressFromAudio();
      const bpChanged = Math.abs(this._bufferedProgress - prevBP) >= 0.005;
      const secChanged =
        this._playState === "play" &&
        Math.floor(this._currentTime as number) !==
          Math.floor(this._audio.currentTime);
      if (secChanged) {
        this._currentTime = Math.floor(this._audio.currentTime);
        this._duration = this._audio.duration;
        this._progress = Math.max(
          0,
          Math.min(
            1,
            parseFloat((this._currentTime / this._duration).toFixed(3)),
          ),
        );
        this.subscriber.exec(PlayerEvents.time);
        this.subscriber.exec(PlayerEvents.trackReady);
        if (getStorage(StorageKey.Setting_Play_RememberTrackProgress) === true)
          setStorage(StorageKey.Track_Progress, {
            id: this.currentTrack?.id ?? 0,
            normalizedProgress: this._progress,
          });
      } else if (bpChanged) this.subscriber.exec(PlayerEvents.time);
      this._updateTime = setTimeout(update, 300);
    };
    this._updateTime = setTimeout(update, 300);
  }

  async reloadUrl() {
    if (!this.currentTrack || isLocal(this.currentTrack.id)) return;
    try {
      await this.audioEngine.ensureAudioGraphReady();
    } catch (e) {
      console.error(e);
      return;
    }
    const result = await this.getUrl(this.currentTrack.id);
    if (!result) return;
    this._audio.src = result.url;
    this._audio.currentTime = this._currentTime as number;
    try {
      if (this._playState === "play") {
        await this.audioEngine.resumeAudioContext();
        await this._outputAudio.play().catch(() => undefined);
        await this._audio.play();
      }
      this.updateTime();
    } catch (e) {
      console.error("reloadUrl", e);
    }
  }

  async handleAudioError() {
    if (!this.currentTrack) return;
    if (navigator.onLine) await this.reloadUrl();
  }

  getUrl(id: number | string): Promise<{ url: string } | null> {
    if (isLocal(id)) return Promise.resolve(null);
    const dls = this._downloadedSongs;
    if (dls.some((s) => s.id === id) && window.electron?.isElectron) {
      const song = dls.find((s) => s.id === id);
      if (fs.existsSync(song?.path) && song)
        return Promise.resolve({
          url: `file://${song.path.replace(/\\/g, "/")}`,
        });
      ipcRenderer?.send("player-error", {
        type: "error",
        key: "player.local_file_not_found",
        translate: true,
      });
      ipcRenderer?.send("download-delete", song.id);
    }
    return Song.getUrlObj(id as number, this._quality).then((r) => {
      if (r.url === null) {
        ipcRenderer?.send("player-error", {
          type: "error",
          key: "player.noUrlError",
          translate: true,
        });
        throw new Error("Failed to get track url");
      }
      return r;
    });
  }

  async playTrack(
    track: ITrack,
    autoPlay = true,
    delay = 0,
    progress?: { id: number; normalizedProgress: number },
  ) {
    await this.sessionEngine.flushPlaybackSession();
    let ti = this.playlistEngine.findIndexById(track.id);
    if (ti === -1) {
      this.playlistEngine.addTrack(track);
      await this.playTrack(track);
      return;
    }
    this.playlistEngine._current = ti;
    this.subscriber.exec(PlayerEvents.track);
    // 重置播放进度相关状态（原 startPlaybackSession 中的逻辑）
    this._currentTime = 0;
    this._progress = 0;
    this._bufferedProgress = 0;
    this._duration = 0;
    this.subscriber.exec(PlayerEvents.time);
    this.sessionEngine.startPlaybackSession(track);
    try {
      await this.audioEngine.ensureAudioGraphReady();
    } catch (e) {
      console.error(e);
      return;
    }
    if (
      await this.gaplessEngine.tryUseGaplessBufferedTrack(
        track,
        ti,
        autoPlay,
        delay,
        progress,
      )
    )
      return;
    let nourl = false;
    let result: { url: string } | null = null;
    if (!isLocal(track.id)) {
      result = (await this.getUrl(track.id).catch(() => {
        if (navigator.onLine && this.noUrlCount < 10) {
          this.next();
          nourl = true;
          this.noUrlCount++;
        }
      })) as any;
    } else result = { url: `file://${track.localPath.replace(/\\/g, "/")}` };
    if (nourl || !result) return;
    this._bufferedProgress = 0;
    this._audio.src = result.url;
    this._audio.currentTime = 0;
    this._audio.onended = () => {
      void this.handleTrackEnded();
    };
    await this.gainTrack(track.id);
    if (autoPlay) {
      try {
        if (delay > 0) {
          setTimeout(() => {
            void this.audioEngine.resumeAudioContext();
            this._audio.play().then(() => {
              if (
                progress &&
                progress.normalizedProgress > 0 &&
                progress.normalizedProgress <= 1 &&
                progress.id === track.id &&
                getStorage(StorageKey.Setting_Play_RememberTrackProgress) ===
                  true
              )
                this._audio.currentTime =
                  this._audio.duration * progress.normalizedProgress;
            });
            void this._outputAudio.play().catch(() => undefined);
            this._playState = "play";
            this.execPlayStateEvent();
          }, delay);
        } else {
          await this.audioEngine.resumeAudioContext();
          await this._audio.play();
          await this._outputAudio.play().catch(() => undefined);
          this._playState = "play";
          this.execPlayStateEvent();
        }
      } catch (e) {
        console.error(e);
      }
    }
    this.updateTime();
    this.noUrlCount = 0;
    this.subscriber.exec(PlayerEvents.trackReady);
    void this.gaplessEngine.prepareGaplessPreload(false);
  }

  private async handleTrackEnded() {
    await this.sessionEngine.flushPlaybackSession();
    if (this.gaplessEngine.isGaplessEnabled()) {
      const ni = this.gaplessEngine.resolveGaplessNextTrackIndex();
      const nt = ni !== null ? this.playlistEngine._playlist[ni] : null;
      if (nt && ni !== null) {
        const sw = await this.gaplessEngine.tryUseGaplessBufferedTrack(
          nt,
          ni,
          true,
          0,
        );
        if (sw) {
          if (this._mode === "random") {
            if (
              this.historyEngine._history[this.historyEngine._historyIndex + 1]
            ) {
              this.historyEngine._historyIndex += 1;
              this.subscriber.exec(PlayerEvents.history);
            } else this.historyEngine.appendToHistory(nt);
          }
          return;
        }
      }
    }
    await this.next();
  }

  async randomPlay(direction: -1 | 1) {
    if (
      this.historyEngine._history[this.historyEngine._historyIndex + direction]
    ) {
      this.playlistEngine._current = this.playlistEngine.findIndexById(
        this.historyEngine._history[
          this.historyEngine._historyIndex + direction
        ].id,
      );
      this.historyEngine._historyIndex += direction;
      this.subscriber.exec(PlayerEvents.history);
    } else if (direction === 1) {
      this.playlistEngine._current = Math.floor(
        Math.random() * this.playlistEngine.playlistCount,
      );
      this.historyEngine.appendToHistory(this.currentTrack!);
    } else {
      this.playlistEngine._current = Math.floor(
        Math.random() * this.playlistEngine.playlistCount,
      );
      this.historyEngine.insertToHistory(this.currentTrack!);
    }
    await this.playTrack(this.currentTrack!);
  }

  async next() {
    if (this.playlistEngine.playlistCount === 0) return;
    if (this._mode === "random") await this.randomPlay(1);
    else if (this._mode === "loop") await this.playTrack(this.currentTrack!);
    else {
      this.playlistEngine._current =
        (this.playlistEngine._current + 1) % this.playlistEngine.playlistCount;
      await this.playTrack(this.currentTrack!);
    }
  }

  async previous() {
    if (this.playlistEngine.playlistCount === 0) return;
    if (this._mode === "random") await this.randomPlay(-1);
    else {
      this.playlistEngine._current =
        (this.playlistEngine._current - 1 + this.playlistEngine.playlistCount) %
        this.playlistEngine.playlistCount;
      await this.playTrack(this.currentTrack!);
    }
  }

  private async applyPlayState(value: "play" | "pause") {
    if (!this._audio || !this._audio.readyState) return;
    const prev = this._playState;
    this._playState = value;
    if (this._playState === "play") {
      try {
        await this.audioEngine.ensureAudioGraphReady();
        await this.audioEngine.resumeAudioContext();
        await this._outputAudio.play().catch(() => undefined);
        await this._audio.play().catch((e) => console.error(e));
        const dur = this._audio.duration;
        const rem =
          Number.isFinite(dur) && dur > 0
            ? Math.max(0, dur - this._audio.currentTime)
            : Number.POSITIVE_INFINITY;
        void this.gaplessEngine.prepareGaplessPreload(
          prev === "pause" &&
            rem <= this.gaplessEngine._gaplessPreloadLeadSeconds,
        );
      } catch (e) {
        this._playState = "pause";
        this._audio.pause();
        this._outputAudio.pause();
        console.error("applyPlayState", e);
      }
    } else {
      this._audio.pause();
      this._outputAudio.pause();
    }
    if (this._playState === "pause") {
      if (this.reloadInterval) clearInterval(this.reloadInterval);
      this.reloadInterval = setInterval(() => this.reloadUrl(), 1000 * 60 * 20);
    } else {
      if (this.reloadInterval) clearInterval(this.reloadInterval);
    }
    this.subscriber.exec(PlayerEvents.playState);
  }

  get playState() {
    return this._playState;
  }
  set playState(value) {
    if (value === "play" || value === "pause") void this.applyPlayState(value);
    else console.error("PlayState not supported:", value);
  }

  tooglePlayState() {
    this.playState = this._playState === "play" ? "pause" : "play";
  }

  /** 供 GaplessEngine 调用 */
  execPlayStateEvent() {
    this.subscriber.exec(PlayerEvents.playState);
  }
  execTrackEvent() {
    this.subscriber.exec(PlayerEvents.track);
  }
  execTrackReadyEvent() {
    this.subscriber.exec(PlayerEvents.trackReady);
  }
  execTimeEvent() {
    this.subscriber.exec(PlayerEvents.time);
  }

  get volume() {
    return this._volume;
  }
  set volume(v: number) {
    if (v >= 0 && v <= 1) {
      this._volume = v;
      this._audio.volume = v;
      this._preloadAudio.volume = v;
      this.subscriber.exec(PlayerEvents.volume);
    }
  }

  get currentTime() {
    return this._currentTime;
  }
  set currentTime(v: number) {
    if (v >= 0 && v <= this._duration) {
      this._audio.currentTime = v;
      this._currentTime = v;
      this._progress = v / this._duration;
      this.updateBufferedProgressFromAudio();
      this.subscriber.exec(PlayerEvents.time);
      void this.gaplessEngine.prepareGaplessPreload(true);
    }
  }

  get progress() {
    return this._progress;
  }
  get duration() {
    return this._duration;
  }
  get bufferedProgress() {
    return this._bufferedProgress;
  }

  get currentTrack(): ITrack | null {
    return this.playlistEngine.currentTrack ?? null;
  }
  set currentTrack(track: ITrack | null) {
    if (track === null) return;
    const idx = this.playlistEngine.findIndexById(track.id);
    if (idx !== -1) {
      this.playlistEngine._playlist[idx] = track;
      this.playlistEngine._current = idx;
    }
  }

  get playlist(): ITrack[] {
    return this.playlistEngine._playlist;
  }
  set playlist(value: ITrack[]) {
    this.playlistEngine._playlist = value;
    this.subscriber.exec(PlayerEvents.playlist);
  }

  addTrack(track: ITrack) {
    this.playlistEngine.addTrack(track);
  }

  deleteTrack(index: number) {
    if (this.playlistEngine._current === index) {
      if (this.playlistEngine.playlistCount >= 1) this.next();
    }
    this.playlistEngine.deleteTrack(index);
    if (this.playlistEngine._current > index) this.playlistEngine._current -= 1;
  }

  clearPlaylist() {
    this._audio.pause();
    this.playState = "play";
    this._audio.src = "";
    this.historyEngine.clearHistory();
    this.playlistEngine.clearPlaylist();
    this.subscriber.exec(PlayerEvents.track);
  }

  nextPlay(track: ITrack) {
    this.playlistEngine.nextPlay(track);
  }

  playAll(tracks: ITrack[]) {
    this.clearPlaylist();
    this.playlistEngine.playAll(tracks);
    if (this._mode === "listrandom") {
      const groupByAlbum =
        getStorage(StorageKey.Setting_Play_AllowConsecutiveAlbums) ?? false;
      this.playlistEngine.shuffleRandom(groupByAlbum);
      this.playlistEngine._current = 0;
    }
    if (tracks.length > 0) {
      this.playTrack(
        this.playlistEngine._playlist[this.playlistEngine._current],
      );
    }
  }

  addPlaylist(tracks: ITrack[]) {
    this.playlistEngine.addPlaylist(tracks);
  }

  get history() {
    return this.historyEngine._history;
  }

  get mode() {
    return this._mode;
  }
  set mode(value: PlayMode) {
    if (value === this._mode) return;
    if (
      value !== "order" &&
      value !== "listloop" &&
      value !== "random" &&
      value !== "loop" &&
      value !== "listrandom"
    )
      return;
    this.historyEngine.clearHistory();
    this.gaplessEngine.resetPreloadAudioState(true);
    this._mode = value;
    this.subscriber.exec(PlayerEvents.mode);
    if (
      value === "order" ||
      value === "listloop" ||
      value === "random" ||
      value === "loop"
    ) {
      this.playlistEngine.sortByOriginalIndex();
    } else if (value === "listrandom") {
      const groupByAlbum =
        getStorage(StorageKey.Setting_Play_AllowConsecutiveAlbums) ?? false;
      this.playlistEngine.shuffleRandom(groupByAlbum);
    }
  }

  async gainTrack(id: number | string): Promise<string> {
    if (isLocal(id)) return "Local track";
    await this.setAllQuality(id);
    let gain: any = null,
      peak: any = null;
    const gd: number[] = [],
      pd: number[] = [];
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
      gd.push(this.currentTrack![prop[i]]?.gain);
      pd.push(this.currentTrack![prop[i]]?.peak);
    }
    gd.forEach((v) => {
      if (gain === null || (v && v > gain) || gain === undefined) gain = v;
    });
    pd.forEach((v) => {
      if (peak === null || (v && v < peak && v !== 0) || peak === undefined)
        peak = v;
    });
    return this.setGain(gain, peak);
  }

  async setAllQuality(id: number | string) {
    const abbr = ["l", "h", "sq", "hr", "jyeffect", "sky", "jymaster"];
    const reqs = [
      this.getQuality(id, "standard").then((r) => {
        this.currentTrack = { ...this.currentTrack!, l: r };
      }),
    ];
    if (this._quality !== "standard") {
      const idx = qualities.indexOf(this._quality);
      reqs.push(
        this.getQuality(id, this._quality).then((r) => {
          this.currentTrack = { ...this.currentTrack!, [abbr[idx]]: r };
        }),
      );
    }
    await Promise.all(reqs);
  }

  async getQuality(
    id: number | string,
    quality: string,
  ): Promise<QualityInfo | null> {
    if (isLocal(id)) return null;
    const r = await Song.getQuality(id as number, quality);
    return { name: quality, ...r };
  }

  dBToGain(dB: number) {
    return Math.pow(10, dB / 20);
  }

  setGain(gain: number, peak: number): string {
    if (!this._volume_leveling) {
      gain = 1;
      peak = 1;
    }
    let gl = this.dBToGain(gain);
    if (peak * gl > 1 && peak !== 0) gl = 1 / peak;
    if (
      gl < 0 ||
      typeof gl !== "number" ||
      isNaN(gl) ||
      gl === Infinity ||
      peak === Infinity ||
      peak < 0 ||
      peak > 2 ||
      typeof peak !== "number" ||
      isNaN(peak)
    )
      return "Gain not supported, gain: " + gl + "peak: " + peak;
    if (gl > 4) gl = 4;
    let msg = "worklet post gain queued";
    try {
      this.audioEngine._workletPostGain = gl;
      this.audioEngine.applyPostGainToWorklet();
      this.subscriber.exec(PlayerEvents.gain);
      msg = this.audioEngine._workletReady
        ? " worklet post gain set to " + gl
        : " worklet post gain queued to " + gl;
    } catch (e) {
      console.error(e);
    }
    if (!this._volume_leveling)
      return "\n Volume leveling is off, gain set to 1";
    return (
      "\n Required Gain: " +
      this.dBToGain(gain).toFixed(3) +
      ", Gain set to " +
      gl.toFixed(3) +
      "\n Original Peak: " +
      peak.toFixed(3) +
      ", Peak set to " +
      (peak * gl).toFixed(3) +
      "\n" +
      msg
    );
  }

  async rebuildAudioSystem() {
    const wasPlaying = this._playState === "play";
    const ct = this._audio.currentTime,
      src = this._audio.src,
      vol = this._audio.volume;
    if (this._updateTime) {
      clearTimeout(this._updateTime);
      this._updateTime = null;
    }
    this.audioEngine.destroyAudioContext();
    this._audio = new Audio();
    this.configureAudioElement(this._audio);
    this.bindActiveAudioCallbacks();
    this._audio.volume = vol;
    this._preloadAudio = new Audio();
    this.configureAudioElement(this._preloadAudio);
    this.gaplessEngine.resetPreloadAudioState(true);
    this._outputAudio = new Audio();
    this.audioEngine.initAudioContext();
    try {
      await this.audioEngine.ensureAudioGraphReady();
    } catch (e) {
      console.error(e);
      return;
    }
    if (src) {
      this._audio.src = src;
      this._audio.currentTime = ct;
      this._audio.onended = () => {
        void this.handleTrackEnded();
      };
      if (wasPlaying) {
        await this.audioEngine.resumeAudioContext();
        await this._outputAudio.play().catch(() => undefined);
        this._audio.play().catch((e) => console.error(e));
      }
      this.updateTime();
    }
  }

  handleDeviceChange() {
    void this.rebuildAudioSystem();
  }

  async setDevice(value: string) {
    await this.audioEngine.setDevice(value);
    if (this._playState === "play") {
      await this.audioEngine.resumeAudioContext();
      await this._outputAudio.play().catch(() => undefined);
      await this._audio.play();
    }
  }

  get quality() {
    return this._quality;
  }
  set quality(value) {
    const valid = [
      "standard",
      "higher",
      "exhigh",
      "lossless",
      "hires",
      "jyeffect",
      "sky",
      "jymaster",
    ];
    if (
      value &&
      (valid as string[]).includes(value) &&
      value !== this._quality
    ) {
      this._quality = value;
      setStorage(StorageKey.Setting_Play_Quality, value as any);
      if (this.currentTrack) this.gainTrack(this.currentTrack.id);
      this.subscriber.exec(PlayerEvents.quality);
    }
  }

  get qualityDisplay(): string {
    if (this._downloadedSongs.some((s) => s.id == this.currentTrack?.id))
      return "quality.local";
    switch (this._quality) {
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

  formatSize(size: number): string {
    if (size < 1024) return size + "B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + "KB";
    if (size < 1024 * 1024 * 1024)
      return (size / 1024 / 1024).toFixed(1) + "MB";
    return "";
  }

  get availableQuality() {
    const r: Array<{ name: string; size: string | undefined }> = [];
    const ct = this.currentTrack;
    if (!ct) return r;
    if (ct.h) r.push({ name: "exhigh", size: this.formatSize(ct.h.size) });
    if (ct.l) r.push({ name: "standard", size: this.formatSize(ct.l.size) });
    if (ct.sq) r.push({ name: "lossless", size: this.formatSize(ct.sq.size) });
    if (ct.hr) r.push({ name: "hires", size: this.formatSize(ct.hr.size) });
    if (ct.jyeffect)
      r.push({ name: "jyeffect", size: this.formatSize(ct.jyeffect.size) });
    if (ct.sky) r.push({ name: "sky", size: this.formatSize(ct.sky.size) });
    if (ct.jymaster)
      r.push({ name: "jymaster", size: this.formatSize(ct.jymaster.size) });
    return r;
  }

  get volumeLeveling() {
    return this._volume_leveling;
  }
  set volumeLeveling(v: boolean) {
    this._volume_leveling = v;
    if (this.currentTrack) this.gainTrack(this.currentTrack.id);
  }

  get currentGain(): number {
    return this.audioEngine._workletPostGain;
  }
  setManualGain(value: number) {
    this.audioEngine._workletPostGain = value;
    this.audioEngine.applyPostGainToWorklet();
    this.subscriber.exec(PlayerEvents.gain);
  }

  get device() {
    return this.audioEngine.device;
  }
  get sampleRate() {
    return this.audioEngine.sampleRate;
  }
  get gaplessBufferDebugSnapshot(): GaplessBufferDebugSnapshot {
    return this.gaplessEngine.gaplessBufferDebugSnapshot;
  }

  setEqualizer(eq: IEqualizer) {
    this.audioEngine.setEqualizer(eq);
  }
  getEqualizer(): IEqualizer {
    return this.audioEngine.getEqualizer();
  }
  toggleSpectrum(enabled: boolean) {
    this.audioEngine.toggleSpectrum(enabled);
  }
  getSpectrumData(): Uint8Array | null {
    return this.audioEngine.getSpectrumData();
  }
  setGaplessPlayback(enabled: boolean) {
    this.gaplessEngine.setGaplessPlayback(enabled);
  }

  get lyrics() {
    return this._lyrics;
  }
  private set lyrics(v: Array<LrcItem | LrcItem2 | YrcItem>) {
    this._lyrics = v;
    this.subscriber.exec(PlayerEvents.lyrics);
  }

  setDownloadedSongs(songs: any[]) {
    this._downloadedSongs = songs;
  }

  // -- GaplessEngine host interface delegates --

  get _sourceNode(): MediaElementAudioSourceNode | undefined {
    return this.audioEngine._sourceNode;
  }
  set _sourceNode(v: MediaElementAudioSourceNode | undefined) {
    this.audioEngine._sourceNode = v;
  }
  get _preloadSourceNode(): MediaElementAudioSourceNode | undefined {
    return this.audioEngine._preloadSourceNode;
  }
  set _preloadSourceNode(v: MediaElementAudioSourceNode | undefined) {
    this.audioEngine._preloadSourceNode = v;
  }
  resumeAudioContext(): Promise<void> {
    return this.audioEngine.resumeAudioContext();
  }
  getAudioContext(): AudioContext | null {
    return this.audioEngine._audioContext;
  }
}
