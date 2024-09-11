
export class Tracks{
    constructor({
        url = '/tracks/all',
        tracks = [],
    }){
        this._url = url;
        this._tracks = tracks;
    }
}