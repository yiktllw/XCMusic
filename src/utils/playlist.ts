/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * playlist.ts 为渲染进程中，处理播放列表的工具
 * 用于为某些歌曲数组添加 url 字段和 originalIndex 字段
 *---------------------------------------------------------------*/

import { ITrack } from "./tracks";

/**
 * 准备播放列表, 为每个歌曲添加 url 字段和 originalIndex 字段
 */
export function preparePlaylist(playlist: ITrack[]): Array<ITrack> {
  return playlist.map((track, index) => {
    return {
      ...track,
      url: "",
      originalIndex: index,
    };
  });
}
