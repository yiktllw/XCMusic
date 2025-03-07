/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * player.ts 为@/utils/player.ts配套的处理工具
 * 用于防止循环引用
 *---------------------------------------------------------------*/

export enum PlayerEvents {
  /** 播放、暂停 */
  playState = "playState",
  /** 播放列表 */
  playlist = "playlist",
  /** 当前播放的歌曲 */
  track = "track",
  /** 歌曲准备完毕 */
  trackReady = "trackReady",
  /** 歌曲的歌词 */
  lyrics = "lyrics",
  /** 歌曲的播放时间，1秒1次 */
  time = "time",
  /** 歌曲的播放音质 */
  quality = "quality",
  /** 音量 */
  volume = "volume",
  /** 播放历史(纯随机模式使用) */
  history = "history",
  /** 播放模式 */
  mode = "mode",
  /** 播放器准备就绪 */
  playerReady = "playerReady",
  /** 歌曲音量均衡的增益 */
  gain = "gain",
}

/** 音频增益接口 */
export interface IEqualizer {
  /** 32Hz */
  _32Hz: number;
  /** 64Hz */
  _64Hz: number;
  /** 125Hz */
  _125Hz: number;
  /** 250Hz */
  _250Hz: number;
  /** 500Hz */
  _500Hz: number;
  /** 1kHz */
  _1kHz: number;
  /** 2kHz */
  _2kHz: number;
  /** 4kHz */
  _4kHz: number;
  /** 8kHz */
  _8kHz: number;
  /** 16kHz */
  _16kHz: number;
}

// 均衡器的频率
export const equalizerFreqs = {
  _32Hz: 32,
  _64Hz: 64,
  _125Hz: 125,
  _250Hz: 250,
  _500Hz: 500,
  _1kHz: 1000,
  _2kHz: 2000,
  _4kHz: 4000,
  _8kHz: 8000,
  _16kHz: 16000,
} as const;

export const equalizerFreqsDisplay = {
  _32Hz: "32",
  _64Hz: "64",
  _125Hz: "125",
  _250Hz: "250",
  _500Hz: "500",
  _1kHz: "1k",
  _2kHz: "2k",
  _4kHz: "4k",
  _8kHz: "8k",
  _16kHz: "16k",
};
