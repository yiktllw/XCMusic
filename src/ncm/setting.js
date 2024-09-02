
export class setting {
    constructor() {
        this.initSettings();
        this._play = {
            _volume: localStorage.getItem('setting.play.volume'),
        };
    }
    initSettings() {
        if (!localStorage.getItem('setting.init')) {
            return;
        }
        localStorage.setItem('setting.init', true);
        localStorage.setItem('setting.play.volume', 1);
    }
    get play_volume() {
        return this._play._volume;
    }
    set play_volume(value) {
        if (value > 1){
            value = 1;
        } else if (value < 0) {
            value = 0;
        }
        localStorage.setItem('setting.play.volume', value);
        this._play._volume = value;
    }
}