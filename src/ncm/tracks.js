
export class Tracks {
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
