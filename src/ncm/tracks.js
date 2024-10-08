
export class Tracks {
    /**
     * 初始化歌曲列表
     * @param {object} params 参数
     * @param {string} params.url 请求地址
     * @param {Array} params.tracks 歌曲列表
     * @param {object} params.params 额外参数
     */
    constructor({
        url = '/playlist/tracks/all',
        tracks = [],
        params = {},
    }) {
        this._tracks = tracks.map((item, index) => {
            let resultTrack = {
                id: 0,
                name: '',
                tns: '',
                al: {
                    id: 0,
                    name: '',
                    picUrl: '',
                    tns: '',
                },
                ar: [
                    {
                        id: 0,
                        name: '',
                        tns: '',
                    },
                ],
                _picUrl: '',
                cd: 1,
                no: 1,
                reelIndex: 0,
                songInReelIndex: 0,
                dt: 0,
                pop: 0,
                playCount: 0,
                lyrics: [
                    '',
                ],
                h: null,
                l: null,
                sq: null,
                hr: null,
                jyeffect: null,
                sky: null,
                jymaster: null,
            }
            if (item !== null) {
                let track = null;
                if (url === '/user/record') {
                    track = item.song;
                } else if (url === '/cloudsearch?type=1' || url === '/cloudsearch?type=1006') {
                    track = item;
                } else if (url === '/artist/songs') {
                    track = item;
                    let index = params.albums.findIndex((album) => album.id === track.al.id);
                    if (index === -1) {
                        track.al.picUrl = require('@/assets/song.svg');
                    } else {
                        track.al.picUrl = params.albums[index].picUrl;
                    }
                } else if (url === '/api/v2/artist/songs') {
                    track = item;
                    track.tns = track.transNames;
                    track.al = {
                        id: track.album.id,
                        name: track.album.name,
                        picUrl: track.album.picUrl,
                        tns: '',
                    }
                    track.ar = track.artists.map((ar) => {
                        return {
                            id: ar.id,
                            name: ar.name,
                            tns: '',
                        }
                    });
                    track.pop = track.popularity;
                    track.dt = track.duration;
                } else if (url === '/api/album/v3/detail') {
                    track = item;
                    track.cd = parseInt(track.cd);
                    if (params.needIndex) {
                        resultTrack = {
                            ...resultTrack,
                            originalIndex: index,
                        }
                    }
                    if (params.reels) {
                        params.reels.forEach((reel, reelIndex) => {
                            reel.songList.forEach((song, songIndex) => {
                                if (song.songId == track.id) {
                                    track.name = song.songName;
                                    resultTrack.reelIndex = reelIndex;
                                    resultTrack.songInReelIndex = songIndex;
                                }
                            });
                        });
                    }
                } else if (url === '/playlist/track/all' || url === '/album') {
                    track = item;
                    if (params.needIndex) {
                        resultTrack = {
                            ...resultTrack,
                            originalIndex: index,
                        }
                    }
                    if (url === '/album' && params.alPicUrl) {
                        track.al.picUrl = params.alPicUrl;
                    }
                }
                resultTrack.id = track.id;
                resultTrack.name = track.name;
                resultTrack.tns = track.tns ?? '';
                resultTrack.al.id = track.al.id;
                resultTrack.al.name = track.al.name;
                resultTrack.al.picUrl = track.al.picUrl;
                resultTrack.al.tns = track.al.tns ?? '';
                resultTrack._picUrl = track.al.picUrl + '?param=40y40';
                resultTrack.cd = track.cd ?? 1;
                resultTrack.no = track.no ?? 1;
                resultTrack.ar = track.ar.map((ar) => {
                    return {
                        id: ar.id,
                        name: ar.name,
                        tns: ar.tns ?? '',
                    }
                });
                resultTrack.dt = track.dt;
                resultTrack.pop = track.pop;
                resultTrack.h = track.h ? { size: track.h.size } : null;
                resultTrack.l = track.l ? { size: track.l.size } : null;
                resultTrack.sq = track.sq ? { size: track.sq.size } : null;
                resultTrack.hr = track.hr ? { size: track.hr.size } : null;
                if (url === '/cloudsearch?type=1006') {
                    resultTrack.lyrics = track.lyrics;
                } else if (url === '/user/record') {
                    resultTrack.playCount = item.playCount;
                }
            }

            return resultTrack;
        });
    }
    get tracks() {
        return this._tracks;
    }
}

export class Track {
    /**
     * 初始化歌曲信息
     * @param {object} params 参数
     * @param {string} params.url 请求地址
     * @param {object} params.track 歌曲信息
     * @param {object} params.params 额外参数
     */
    constructor({
        url = '/playlist/tracks/all',
        track = {},
        params = {
            type: 'local',
            path: 'C:/',
        },
    }) {
        this._track = track;
        this._url = url;
        this._params = params;
        if (params.type === 'local') {
            // 
        }
    }
    get track() {
        return this._track;
    }
}
