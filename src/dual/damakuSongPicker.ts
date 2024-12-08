/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * damakuSongPicker.ts 为@/utils/damakuSongPicker.ts配套的处理工具
 * 用于防止循环引用
 *---------------------------------------------------------------*/

export enum SongPickerEvents {
  /** 点歌: 立即播放 */
  Track = "Track",
  /** 点歌: 下一首播放 */
  NextTrack = "NextTrack",
}
