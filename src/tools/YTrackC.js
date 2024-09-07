import { useApi } from "@/ncm/api";

export class YTrackC {
    constructor(id = null) {
        this._id = id;
        this._name = '';
        this._picUrl = '';
        this._ar = [];
        this._al = {};
        this._onTrackLoaded = null;
        this.init();
    }
    async init() {
        if (!this._id) {
            return;
        } else {
            await useApi('/song/detail', {
                ids: this._id
            }).then(res => {
                let tns = res.songs[0].tns ? ' (' + res.songs[0].tns + ')' : '';
                this._name = res.songs[0].name + tns;
                this._picUrl = res.songs[0].al.picUrl;
                this._ar = res.songs[0].ar;
                this._al = res.songs[0].al;
                let trackTns = res.songs[0].al.tns[0] ? ' (' + res.songs[0].al.tns + ')' : '';
                this._al.name = res.songs[0].al.name + trackTns;
                this.onTrackLoaded();
            }).catch(err => {
                console.error(err);
            });
        }
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get picUrl() {
        return this._picUrl;
    }
    get ar() {
        return this._ar;
    }
    get al() {
        return this._al;
    }
    get onTrackLoaded() {
        return this._onTrackLoaded;
    }
    set onTrackLoaded(fn) {
        if (typeof fn === 'function') {
            this._onTrackLoaded = fn;
        } else {
            throw new Error('onTrackLoaded must be a function, but got ' + typeof fn);
        }
    }
}