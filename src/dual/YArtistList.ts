/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YArtistList.ts 为YArtistList组件配套的处理工具
*---------------------------------------------------------------*/

/**
 * 歌手
 */
export interface IArtist {
    id: number;
    name: string;
    _picUrl: string;
    albumSize: number;
}

/**
 * 用户
 */
export interface IArtist{
    userId: number;
    nickname: string;
    _picUrl: string;
    followeds: number;
}