
/**
 * 格式化时间戳为 yyyy-mm-dd
 * @param {number} timestamp 时间戳
 * @returns {string} 格式化后的时间字符串
 */
export function formatDate_yyyymmdd(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 格式化时间戳为 mm:ss
 * @param {number} duration 时间戳
 */
export function formatDuration_mmss(duration) {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}