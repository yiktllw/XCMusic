/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YPlaylistList和YPlaylistBiglist组件配套的处理工具
 *---------------------------------------------------------------*/

/**
 * 歌单
 */
export interface IPlaylist {
  id: number | string;
  name: string;
  _picUrl: string;
  _bigPicUrl: string;
  playCount: number;
  trackCount: number | string;
  creator: {
    userId: number;
    nickname: string;
  };
  userId?: number;
}

/**
 * 专辑
 */
// eslint-disable-next-line no-redeclare
export interface IPlaylist {
  id: number | string;
  name: string;
  _picUrl: string;
  _bigPicUrl: string;
  playCount: number;
  size?: number;
  publishTime?: number;
  artist?: {
    id: number;
    name: string;
  };
}

export interface IBigPlaylist {
  /** 歌单id */
  id: number;
  /** 歌单封面 */
  _bigPicUrl: string;
  /** 歌单播放量 */
  playCount: number;
  /** 歌单名称 */
  name: string;
  /** 歌单歌曲数量 */
  size?: number;
  /** 歌单歌曲数量 */
  trackCount?: number;
}
