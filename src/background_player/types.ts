/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * types.ts — Player 相关类型定义、常量和工具函数
 *---------------------------------------------------------------*/

import { type IEqualizer, equalizerFreqs } from "@/dual/player";
import type { PlayerEvents } from "@/dual/player";
import { getStorage, StorageKey } from "@/utils/render_storage";

export type QualityInfo = {
  name: string;
  size: number;
  gain: number;
  peak: number;
};

export type AudioBufferSnapshot = {
  readyState: number;
  duration: number | null;
  currentTime: number;
  bufferedSeconds: number;
  bufferedProgress: number;
  bufferedRanges: Array<{
    start: number;
    end: number;
  }>;
};

export type GaplessBufferDebugSnapshot = {
  gaplessEnabled: boolean;
  preloadPending: boolean;
  preloadedTrackId: number | string | null;
  preloadedTrackIndex: number | null;
  preloadMatchesNextTrack: boolean;
  currentTrack: {
    id: number | string;
    name: string;
    index: number;
  } | null;
  nextTrack: {
    id: number | string;
    name: string;
    index: number;
  } | null;
  currentBufferedProgress: number;
  currentAudio: AudioBufferSnapshot;
  preloadAudio: AudioBufferSnapshot;
};

export type PlayerEventCallbacks = {
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
  [PlayerEvents.timeSync]: () => void;
  [PlayerEvents.fluidPalette]: () => void;
};

export const WORKLET_PROCESSOR_NAME = "xc-audio-engine-processor";
export const equalizerKeys = Object.keys(equalizerFreqs) as Array<
  keyof IEqualizer
>;

export const createDefaultEqualizer = (): IEqualizer => ({
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
});

export const normalizeEqualizer = (value: unknown): IEqualizer => {
  const normalized = createDefaultEqualizer();
  if (!value || typeof value !== "object") {
    return normalized;
  }

  const source = value as Partial<Record<keyof IEqualizer, unknown>>;
  equalizerKeys.forEach((key) => {
    const level = source[key];
    if (typeof level === "number" && Number.isFinite(level)) {
      normalized[key] = level;
    }
  });
  return normalized;
};

export const WORKLET_MODULE_PATH = "audio/xcAudioEngineProcessor.worklet.js";

export const getWorkletModuleURL = () =>
  new URL(WORKLET_MODULE_PATH, window.location.href).toString();

export type PlayMode = "order" | "listloop" | "random" | "loop" | "listrandom";
export type QualityValue =
  | "standard"
  | "higher"
  | "exhigh"
  | "lossless"
  | "hires"
  | "jyeffect"
  | "sky"
  | "jymaster";
export type PlayStateValue = "play" | "pause";

export const resolveInitialPlayMode = (): PlayMode => {
  const storedMode = getStorage(StorageKey.Setting_Play_Mode);
  if (
    storedMode === "order" ||
    storedMode === "listloop" ||
    storedMode === "random" ||
    storedMode === "loop" ||
    storedMode === "listrandom"
  ) {
    return storedMode;
  }
  return "order";
};
