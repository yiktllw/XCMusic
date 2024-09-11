
export class Tracks{
    constructor({
        url = 'playlist/tracks/all',
        tracks = [],
    }){
        this._url = url;
        this._tracks = tracks;
    }
}

export class Track{
    constructor({
        url = '/playlist/tracks/all',
        track = null,
    }){
        this._track = {
            id: 0,
            name: '',
            tns: '',
            al: {
                picUrl: '',
            },
            ar: [
                {
                },
            ];
            _picUrl: '',
        }
        if (track !== null && url === '/playlist/tracks/all') {
            this._track.id = track.id;
            this._track.name = track.name;
            this._track.tns = track.tns[0] ?? '';
            this._track.al.picUrl = track.al.picUrl;
            this._track._picUrl = track.al.picUrl + '?param=40y40';
            
        }
    }
}
