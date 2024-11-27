/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * login.ts 为@/utils/login.ts配套的处理工具
 *---------------------------------------------------------------*/

/**
 * /user/playlist 接口返回的歌单数据
 */
export interface UserPlaylist {
  /** 歌单名称 */
  name: string;
  /** 歌单ID */
  id: number;
  /** 歌单封面 */
  coverImgUrl: string;
  /** 歌单歌曲数量 */
  trackCount: number;
  /** 是否是用户订阅的歌单 */
  subscribed: boolean;
  /** 歌单创建者信息 */
  creator: {
    /** 用户ID */
    userId: number;
    /** 用户昵称 */
    nickname: string;
  };
  /** 歌单的播放次数 */
  playCount: number;
}

export enum LoginEvents {
  /** 用户创建、订阅的歌单 */
  userPlaylists = "userPlaylists",
  /** 登录状态 */
  status = "status",
  /** 用户ID */
  userId = "userId",
  /** 用户名 */
  userName = "userName",
  /** 用户头像 */
  avatar = "avatar",
}
