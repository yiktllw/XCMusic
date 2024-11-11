/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * localTracks_renderer.ts 为渲染进程中，处理本地音乐的工具
 * 因为localTracks.ts无法在渲染进程中使用，所以将其功能拆分到此文件中
*---------------------------------------------------------------*/

export function isLocal(id: number | string) {
    if (typeof id === 'string') {
        return id.includes('/') || id.includes('\\') || id.includes('_') || id.length === 64;
    }
    return false;
}
