/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YArtistList.ts 为YArtistList组件配套的处理工具
 *---------------------------------------------------------------*/

import { IPlaylist } from "./YPlaylistList";
import { ITrack } from "@/utils/tracks";

/**
 * 个人用户
 */
export interface IUser {
  /**
   * 用户 id
   */
  id: number;
  /**
   * 用户名
   */
  name: string;
  /**
   * 用户头像
   */
  picUrl: string;
  /**
   * 关注数
   */
  follows: number;
  /**
   * 粉丝数
   */
  followeds: number;
  /**
   * 歌单数
   */
  playlistCount: number;
  /**
   * 等级
   */
  level: number;
  /**
   * 听歌数量
   */
  listenSongs: number;
  /**
   * 是否显示歌单大图
   */
  listType: boolean;
  /**
   * 用户创建的歌单
   */
  userPlaylists: IPlaylist[];
  /**
   * 用户收藏的歌单
   */
  userSubscribedPlaylists: IPlaylist[];
  /**
   * 切换器的初始位置
   */
  position:
    | "createdPlaylist"
    | "subscribedPlaylist"
    | "song"
    | "album"
    | "detail";
  /**
   * 切换器
   */
  switcher: Array<{
    display:
      | "sidebar.created_playlist"
      | "sidebar.subscribed_playlist"
      | "user_view.songs"
      | "user_view.albums"
      | "user_view.detail";
    position:
      | "createdPlaylist"
      | "subscribedPlaylist"
      | "song"
      | "album"
      | "detail";
  }>;
}

/**
 * 歌手
 */
export interface IArtist {
  /**
   * 歌手id
   */
  id: number;
  /**
   * 歌手名
   */
  name: string;
  /**
   * 歌手头像
   */
  picUrl: string;
  /**
   * 歌手译名
   */
  transName: string;
  /**
   * 歌手身份
   */
  identity: string;
  /**
   * 歌手简介
   */
  briefDesc: string;
  /**
   * 歌手详细介绍
   */
  intro: Array<{
    ti: string;
    txt: string;
  }>;
  /**
   * 歌手音乐数
   */
  musicSize: number;
  /**
   * 歌手专辑数
   */
  albumSize: number;
  /**
   * 歌手的作品
   */
  tracks: Array<ITrack>;
  /**
   * 歌手的专辑
   */
  albums: Array<IPlaylist>;
  /**
   * 切换器的初始位置
   */
  position:
    | "createdPlaylist"
    | "subscribedPlaylist"
    | "song"
    | "album"
    | "detail";
  /**
   * 切换器
   */
  switcher: Array<{
    display:
      | "sidebar.created_playlist"
      | "sidebar.subscribed_playlist"
      | "user_view.songs"
      | "user_view.albums"
      | "user_view.detail";
    position:
      | "createdPlaylist"
      | "subscribedPlaylist"
      | "song"
      | "album"
      | "detail";
  }>;
}
