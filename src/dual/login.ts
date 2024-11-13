/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * login.ts 为@/utils/login.ts配套的处理工具
 *---------------------------------------------------------------*/

/**
 * /user/playlist 接口返回的歌单数据
 */
export interface UserPlaylist {
  name: string;
  id: number;
  coverImgUrl: string;
  subscribed: boolean;
}
