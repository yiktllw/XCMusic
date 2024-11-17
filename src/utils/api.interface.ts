import { ITrack } from "@/utils/tracks";

export namespace IPlaylist {

  /** /playlist/detail的参数 */
  export interface DetailParams {
    id: number;
    cookie?: string;
  }

  /** /playlist/detail的返回信息 */
  export interface DetailResponse {
    /** 200为成功 */
    code: number;
    /** 歌单 */
    playlist: {
      /** 歌单ID */
      id: number;
      /** 歌单名称 */
      name: string;
      /** 歌单封面 */
      coverImgUrl: string;
      /** 创建时间，UNIX时间戳 */
      createTime: number;
      /** 创建者 */
      creator: {
        /** 用户ID */
        userId: number;
        /** 用户名 */
        nickname: string;
        /** 用户头像 */
        avatarUrl: string;
      };
      /** 播放次数 */
      playCount: number;
      /** 歌曲的ID */
      trackIds: Array<number>;
      /** 歌单内的歌曲 */
      tracks: Array<ITrack>;
      /** 歌曲数量 */
      trackCount: number;
      /** 用户ID */
      userId: number;
    };
    /** 歌曲权限信息，暂未使用 */
    privileges: Array<any>;
  }
}
