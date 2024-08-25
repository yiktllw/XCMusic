
export function preparePlaylist(playlist) {
    return playlist.map((track, index) => {
        return {
            ...track,
            url: '',
            originalIndex: index,
        };
    });
}