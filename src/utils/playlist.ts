
/**
 * 准备播放列表, 为每个歌曲添加 url 字段和 originalIndex 字段
 * @param {Array} playlist 要准备的播放列表
 * @returns {Array} 返回准备好的播放列表
 */
export function preparePlaylist(playlist: any[]): Array<any> {
    return playlist.map((track, index) => {
        return {
            ...track,
            url: '',
            originalIndex: index,
        };
    });
}