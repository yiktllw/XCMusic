/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * download_renderer.ts 为@/utils/download_renderer.ts配套的处理工具
 * 用于防止循环引用
 *---------------------------------------------------------------*/

export enum DownloadEvents {
  /** 下载完成 */
  Complete = "Complete",
  /** 正在下载 */
  Doing = "Doing",
  /** 下载列表变动 */
  List = "List",
}