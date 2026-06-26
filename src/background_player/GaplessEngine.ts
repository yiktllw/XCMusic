/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * GaplessEngine.ts — 无缝播放预加载与切换
 *---------------------------------------------------------------*/

import { type ITrack } from "@/utils/tracks";
import { isLocal } from "@/utils/localTracks_renderer";
import { getStorage, setStorage, StorageKey } from "@/utils/render_storage";
import type {
  AudioBufferSnapshot,
  GaplessBufferDebugSnapshot,
  PlayMode,
} from "./types";
import type { PlaylistEngine } from "./PlaylistEngine";
import type { HistoryEngine } from "./HistoryEngine";
import type { SessionEngine } from "./SessionEngine";

export interface GaplessEngineHost {
  _audio: HTMLAudioElement;
  _preloadAudio: HTMLAudioElement;
  _outputAudio: HTMLAudioElement;
  _sourceNode: MediaElementAudioSourceNode | undefined;
  _preloadSourceNode: MediaElementAudioSourceNode | undefined;

  playlistEngine: PlaylistEngine;
  historyEngine: HistoryEngine;
  sessionEngine: SessionEngine;

  configureAudioElement(el: HTMLAudioElement): void;
  bindActiveAudioCallbacks(): void;
  getUrl(id: number | string): Promise<{ url: string } | null>;
  gainTrack(id: number | string): Promise<string>;
  resumeAudioContext(): Promise<void>;
  getAudioContext(): AudioContext | null;
  updateTime(): void;

  noUrlCount: number;
  _mode: PlayMode;
  _playState: "play" | "pause";
  _bufferedProgress: number;

  execPlayStateEvent(): void;
  execTrackEvent(): void;
  execTrackReadyEvent(): void;
  execTimeEvent(): void;
}

export class GaplessEngine {
  _gaplessPlayback: boolean =
    getStorage(StorageKey.Setting_Play_GaplessPlayback) ?? false;
  _gaplessPreloadLeadSeconds: number = 10;
  _gaplessPreloadMinBufferedSeconds: number = 5;
  _gaplessPreloadedTrackIndex: number | null = null;
  _gaplessPreloadedTrackId: number | string | null = null;
  _gaplessPreloadPromise: Promise<void> | null = null;
  _gaplessPreloadToken: number = 0;

  private host: GaplessEngineHost;

  constructor(host: GaplessEngineHost) {
    this.host = host;
  }

  isGaplessEnabled(): boolean {
    return this._gaplessPlayback;
  }

  resetPreloadAudioState(resetAudioSource: boolean = true) {
    this._gaplessPreloadToken += 1;
    this._gaplessPreloadPromise = null;
    this._gaplessPreloadedTrackIndex = null;
    this._gaplessPreloadedTrackId = null;

    if (!resetAudioSource) {
      return;
    }

    this.host._preloadAudio.pause();
    this.host._preloadAudio.onended = null;
    this.host._preloadAudio.onerror = null;
    this.host._preloadAudio.removeAttribute("src");
    this.host._preloadAudio.load();
  }

  resolveGaplessNextTrackIndex(): number | null {
    const pl = this.host.playlistEngine;
    if (pl.playlistCount === 0) {
      return null;
    }

    const mode = this.host._mode;
    if (mode === "loop") {
      return pl._current;
    }

    if (mode === "random") {
      const he = this.host.historyEngine;
      const nextFromHistory = he._history[he._historyIndex + 1];
      if (nextFromHistory) {
        const idx = pl._playlist.findIndex(
          (track) => track.id === nextFromHistory.id,
        );
        return idx >= 0 ? idx : null;
      }
      return Math.floor(Math.random() * pl.playlistCount);
    }

    return (pl._current + 1) % pl.playlistCount;
  }

  private async resolveTrackUrlForPlayback(
    track: ITrack,
  ): Promise<string | null> {
    if (isLocal(track.id)) {
      return `file://${track.localPath.replace(/\\/g, "/")}`;
    }
    try {
      const result = await this.host.getUrl(track.id);
      return result?.url ?? null;
    } catch (error) {
      console.error("Failed to resolve track url for gapless preload", error);
      return null;
    }
  }

  getContiguousBufferedEndAtCurrentTime(
    audioElement: HTMLAudioElement,
  ): number | null {
    const buffered = audioElement.buffered;
    if (!buffered || buffered.length === 0) {
      return null;
    }

    const currentTime = Number.isFinite(audioElement.currentTime)
      ? audioElement.currentTime
      : 0;
    const currentTolerance = 0.2;
    const joinGapTolerance = 0.15;

    let currentRangeIndex = -1;
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);

      if (
        currentTime >= start - currentTolerance &&
        currentTime <= end + currentTolerance
      ) {
        currentRangeIndex = i;
        break;
      }
    }

    if (currentRangeIndex === -1) {
      return null;
    }

    let contiguousEnd = buffered.end(currentRangeIndex);
    for (let i = currentRangeIndex + 1; i < buffered.length; i++) {
      const nextStart = buffered.start(i);
      const nextEnd = buffered.end(i);
      if (nextStart <= contiguousEnd + joinGapTolerance) {
        contiguousEnd = Math.max(contiguousEnd, nextEnd);
        continue;
      }
      break;
    }

    return contiguousEnd;
  }

  getBufferedAheadSeconds(audioElement: HTMLAudioElement): number {
    const contiguousBufferedEnd =
      this.getContiguousBufferedEndAtCurrentTime(audioElement);
    if (contiguousBufferedEnd === null) {
      return 0;
    }

    const currentTime = Number.isFinite(audioElement.currentTime)
      ? audioElement.currentTime
      : 0;
    const bufferedAhead = contiguousBufferedEnd - currentTime;

    return Math.max(0, parseFloat(bufferedAhead.toFixed(3)));
  }

  private async waitAudioPreloaded(
    audioElement: HTMLAudioElement,
    timeoutMs: number = 8000,
  ): Promise<boolean> {
    const isReady = () => {
      return (
        audioElement.readyState >= 3 ||
        this.getBufferedAheadSeconds(audioElement) >=
          this._gaplessPreloadMinBufferedSeconds
      );
    };

    const checkReady = isReady();
    if (checkReady) {
      return Promise.resolve(true);
    }

    return await new Promise<boolean>((resolve) => {
      let settled = false;

      const onEvent = () => {
        if (isReady()) {
          settled = true;
          cleanup();
          resolve(true);
        }
      };

      const onError = () => {
        if (!settled) {
          settled = true;
          cleanup();
          resolve(false);
        }
      };

      const cleanup = () => {
        audioElement.removeEventListener("canplay", onEvent);
        audioElement.removeEventListener("canplaythrough", onEvent);
        audioElement.removeEventListener("loadeddata", onEvent);
        audioElement.removeEventListener("progress", onEvent);
        audioElement.removeEventListener("error", onError);
      };

      audioElement.addEventListener("canplay", onEvent);
      audioElement.addEventListener("canplaythrough", onEvent);
      audioElement.addEventListener("loadeddata", onEvent);
      audioElement.addEventListener("progress", onEvent);
      audioElement.addEventListener("error", onError);

      setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          const finalCheck = isReady();
          resolve(finalCheck);
        }
      }, timeoutMs);
    });
  }

  swapActiveAndPreloadSlots() {
    const h = this.host;
    const previousAudio = h._audio;
    h._audio = h._preloadAudio;
    h._preloadAudio = previousAudio;

    const previousSourceNode = h._sourceNode;
    h._sourceNode = h._preloadSourceNode;
    h._preloadSourceNode = previousSourceNode;

    h.configureAudioElement(h._audio);
    h.configureAudioElement(h._preloadAudio);
    h.bindActiveAudioCallbacks();
    this.resetPreloadAudioState(true);
  }

  async tryUseGaplessBufferedTrack(
    track: ITrack,
    trackIndex: number,
    autoPlay: boolean,
    delay: number,
    progress?: {
      id: number;
      normalizedProgress: number;
    },
  ): Promise<boolean> {
    if (!this.isGaplessEnabled()) {
      return false;
    }

    if (
      this._gaplessPreloadedTrackIndex !== trackIndex ||
      this._gaplessPreloadedTrackId !== track.id ||
      !this.host._preloadAudio.src ||
      this.host._preloadAudio.readyState < 2
    ) {
      return false;
    }

    this.swapActiveAndPreloadSlots();
    const pl = this.host.playlistEngine;
    pl._current = trackIndex;
    this.host.execTrackEvent();
    this.host.sessionEngine.startPlaybackSession(track);

    if (autoPlay) {
      try {
        if (delay > 0) {
          setTimeout(() => {
            void this.host.resumeAudioContext();
            this.host._audio.play().then(() => {
              // 只需要在程序启动时调用此方法，也就是delay>0时
              // 从记忆的进度开始播放
              if (
                progress &&
                progress.normalizedProgress > 0 &&
                progress.normalizedProgress <= 1 &&
                progress.id === track.id &&
                getStorage(StorageKey.Setting_Play_RememberTrackProgress) ===
                  true
              ) {
                this.host._audio.currentTime =
                  this.host._audio.duration * progress.normalizedProgress;
              }
            });
            void this.host._outputAudio.play().catch(() => undefined);
            this.host._playState = "play";
            this.host.execPlayStateEvent();
          }, delay);
        } else {
          await this.host.resumeAudioContext();
          await this.host._audio.play();
          await this.host._outputAudio.play().catch(() => undefined);
          this.host._playState = "play";
          this.host.execPlayStateEvent();
        }
      } catch (error) {
        console.error("Failed to start buffered gapless track", error);
      }
    }

    void this.host.gainTrack(track.id).catch((error) => {
      console.error("Failed to update gain for buffered track", error);
    });
    this.host.noUrlCount = 0;
    this.host.updateTime();
    this.host.execTrackReadyEvent();
    void this.prepareGaplessPreload(false);
    return true;
  }

  async prepareGaplessPreload(forceRefresh: boolean = false) {
    if (!this.isGaplessEnabled()) {
      this.resetPreloadAudioState(true);
      return;
    }

    const pl = this.host.playlistEngine;
    if (!pl.currentTrack || pl.playlistCount === 0) {
      return;
    }

    const duration = this.host._audio.duration;
    const remainSeconds =
      Number.isFinite(duration) && duration > 0
        ? Math.max(0, duration - this.host._audio.currentTime)
        : Number.POSITIVE_INFINITY;

    if (remainSeconds > this._gaplessPreloadLeadSeconds) {
      return;
    }

    const nextTrackIndex = this.resolveGaplessNextTrackIndex();
    if (nextTrackIndex === null) {
      return;
    }
    const nextTrack = pl._playlist[nextTrackIndex];
    if (!nextTrack) {
      return;
    }

    if (
      !forceRefresh &&
      this._gaplessPreloadedTrackIndex === nextTrackIndex &&
      this._gaplessPreloadedTrackId === nextTrack.id &&
      this.host._preloadAudio.readyState >= 2
    ) {
      return;
    }

    if (forceRefresh) {
      this.resetPreloadAudioState(true);
    }

    if (this._gaplessPreloadPromise) {
      return;
    }

    const token = this._gaplessPreloadToken + 1;
    this._gaplessPreloadToken = token;

    this._gaplessPreloadPromise = (async () => {
      const trackUrl = await this.resolveTrackUrlForPlayback(nextTrack);
      if (!trackUrl || token !== this._gaplessPreloadToken) {
        return;
      }

      this.host._preloadAudio.pause();
      this.host._preloadAudio.src = trackUrl;
      this.host._preloadAudio.currentTime = 0;
      this.host._preloadAudio.load();

      const ready = await this.waitAudioPreloaded(this.host._preloadAudio);
      if (!ready || token !== this._gaplessPreloadToken) {
        return;
      }

      this._gaplessPreloadedTrackIndex = nextTrackIndex;
      this._gaplessPreloadedTrackId = nextTrack.id;
    })()
      .catch((error) => {
        console.error("Gapless preload failed", error);
      })
      .finally(() => {
        if (token === this._gaplessPreloadToken) {
          this._gaplessPreloadPromise = null;
        }
      });
  }

  setGaplessPlayback(enabled: boolean) {
    this._gaplessPlayback = enabled;
    setStorage(StorageKey.Setting_Play_GaplessPlayback, enabled);
    if (!enabled) {
      this.resetPreloadAudioState(true);
      return;
    }
    void this.prepareGaplessPreload(false);
  }

  getAudioBufferSnapshot(audioElement: HTMLAudioElement): AudioBufferSnapshot {
    const duration =
      Number.isFinite(audioElement.duration) && audioElement.duration > 0
        ? parseFloat(audioElement.duration.toFixed(3))
        : null;
    const currentTime = Number.isFinite(audioElement.currentTime)
      ? parseFloat(audioElement.currentTime.toFixed(3))
      : 0;
    const bufferedEnd =
      this.getContiguousBufferedEndAtCurrentTime(audioElement);
    const bufferedSeconds =
      bufferedEnd !== null ? parseFloat(bufferedEnd.toFixed(3)) : currentTime;

    const bufferedRanges: Array<{ start: number; end: number }> = [];
    const buffered = audioElement.buffered;
    if (buffered && buffered.length > 0) {
      for (let i = 0; i < buffered.length; i++) {
        bufferedRanges.push({
          start: parseFloat(buffered.start(i).toFixed(3)),
          end: parseFloat(buffered.end(i).toFixed(3)),
        });
      }
    }

    const bufferedProgress = duration
      ? Math.max(
          0,
          Math.min(1, parseFloat((bufferedSeconds / duration).toFixed(3))),
        )
      : 0;

    return {
      readyState: audioElement.readyState,
      duration,
      currentTime,
      bufferedSeconds,
      bufferedProgress,
      bufferedRanges,
    };
  }

  updateBufferedProgressFromAudio(
    audio: HTMLAudioElement,
    progress: number,
  ): number {
    const safeProgress = Number.isFinite(progress)
      ? Math.max(0, Math.min(1, progress))
      : 0;
    const duration = audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      return safeProgress;
    }

    const buffered = audio.buffered;
    if (!buffered || buffered.length === 0) {
      return safeProgress;
    }

    const bufferedEnd = this.getContiguousBufferedEndAtCurrentTime(audio);
    if (bufferedEnd === null) {
      return safeProgress;
    }

    return Math.max(
      safeProgress,
      Math.max(0, Math.min(1, parseFloat((bufferedEnd / duration).toFixed(3)))),
    );
  }

  get gaplessBufferDebugSnapshot(): GaplessBufferDebugSnapshot {
    const pl = this.host.playlistEngine;
    const nextTrackIndex = this.resolveGaplessNextTrackIndex();
    const nextTrack =
      nextTrackIndex !== null ? (pl._playlist[nextTrackIndex] ?? null) : null;
    const currentTrack = pl.currentTrack;

    const currentAudio = this.getAudioBufferSnapshot(this.host._audio);
    const preloadAudio = this.getAudioBufferSnapshot(this.host._preloadAudio);

    return {
      gaplessEnabled: this._gaplessPlayback,
      preloadPending: this._gaplessPreloadPromise !== null,
      preloadedTrackId: this._gaplessPreloadedTrackId,
      preloadedTrackIndex: this._gaplessPreloadedTrackIndex,
      preloadMatchesNextTrack:
        !!nextTrack &&
        nextTrackIndex !== null &&
        this._gaplessPreloadedTrackId === nextTrack.id &&
        this._gaplessPreloadedTrackIndex === nextTrackIndex,
      currentTrack: currentTrack
        ? {
            id: currentTrack.id,
            name: currentTrack.name,
            index: pl._current,
          }
        : null,
      nextTrack: nextTrack
        ? {
            id: nextTrack.id,
            name: nextTrack.name,
            index: nextTrackIndex as number,
          }
        : null,
      currentBufferedProgress: this.host._bufferedProgress,
      currentAudio,
      preloadAudio,
    };
  }
}
