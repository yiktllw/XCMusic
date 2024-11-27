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
