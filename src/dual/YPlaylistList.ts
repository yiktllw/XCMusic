/*-----------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * YPlaylistList和YPlaylistBiglist组件配套的处理工具
*-----------------------------------------*/

/**
 * 歌单
 */
export interface IPlaylist {
    id: number;
    name: string;
    _picUrl: string;
    _bigPicUrl: string;
    playCount: number;
    trackCount: number;
    creator: {
        userId: number;
        nickname: string;
    }
}

/**
 * 专辑
 */
export interface IPlaylist {
    id: number;
    name: string;
    _picUrl: string;
    _bigPicUrl: string;
    playCount: number;
    size: number;
    publishTime: number;
    artist: {
        id: number;
        name: string;
    }
}