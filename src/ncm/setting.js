
export class Setting {
    constructor() {
        this._setting = [
            {
                name: 'init',
                type: 'value',
                value: localStorage.getItem('setting.init') ?? false,
            },
            {
                name: 'play',
                title: '播放设置',
                type: 'group',
                items: [
                    {
                        name: 'play.volume',
                        title: '音量',
                        type: 'value',
                        value: localStorage.getItem('setting.play.volume') ?? 1,
                    },
                    {
                        name: 'play.mode',
                        title: '播放模式',
                        type: 'value',
                        value: localStorage.getItem('setting.play.mode') ?? 0,
                    },
                    {
                        name: 'play.quality',
                        title: '音质',
                        type: 'value',
                        value: localStorage.getItem('setting.play.quality') ?? 'standard',
                    },
                ]
            },
            {
                name: 'display',
                title: '界面设置',
                type: 'group',
                items: [
                    {
                        name: 'display.sidebarWidth',
                        title: '侧边栏宽度',
                        type: 'value',
                        value: localStorage.getItem('setting.display.sidebarWidth') ?? 200,
                    },
                    {
                        name: 'display.albumWidth',
                        title: '专辑宽度',
                        type: 'value',
                        value: localStorage.getItem('setting.display.albumWidth') ?? 230,
                    },
                ]
            },
        ];
        this._initSettings(true);
    }
    _initSettings(reset = false) {
        if (!localStorage.getItem('setting.init') && !reset) {
            return;
        }
        
        // setting.init = true
        this._setting[0].value = true;
        this._setValue(this._setting[0]);

        for (let i = 0; i < this._setting.length; i++) {
            // 遍历设置项
            if (this._setting[i].type === 'group') {
                // 遍历设置项中的子项
                for (let j = 0; j < this._setting[i].items.length; j++) {
                    // 设置子项的值
                    this._setValue(this._setting[i].items[j]);
                }
            }
        }
    }
    _clearSettings() {
        // localStorage.clear();
        // setting.init = false
        this._setting[0].value = false;
        this._setValue(this._setting[0]);
        
        for (let i = 0; i < this._setting.length; i++) {
            // 遍历设置项
            if (this._setting[i].type === 'group') {
                // 遍历设置项中的子项
                for (let j = 0; j < this._setting[i].items.length; j++) {
                    // 移除子项的值
                    this._removeValue(this._setting[i].items[j]);
                }
            }
        }
    }
    _setValue(item) {
        if (item.type === 'value') {
            localStorage.setItem(`setting.${item.name}`, item.value);
            console.log(`setting.${item.name} = ${item.value}`);
        }
    }
    _removeValue(item) {
        if (item.type === 'value') {
            localStorage.removeItem(`setting.${item.name}`);
        }
    }
    _getValue(name){
        return localStorage.getItem(`setting.${name}`);
    }
    get play() {
        return {
            volume: this._setting[1].items[0].value,
            mode: this._setting[1].items[1].value,
            quality: this._setting[1].items[2].value,
        };
    }
    set play(play) {
        // play.volume 
        if (play.volume >= 0 && play.volume <= 1) {
            this._setting[1].items[0].value = play.volume;
            this._setValue(this._setting[1].items[0]);
        }
        // play.mode
        if (play.mode === 'order' || play.mode === 'random' || play.mode === 'listrandom' || play.mode === 'listloop' || play.mode === 'loop') {
            this._setting[1].items[1].value = play.mode;
            this._setValue(this._setting[1].items[1]);
        }
        // play.quality
        if (play.quality === 'standard' || play.quality === 'higher' || play.quality === 'exhigh' || play.quality === 'lossless' || play.quality === 'hires' || play.quality === 'jyeffect' || play.quality === 'sky' || play.quality === 'jymaster') {
            this._setting[1].items[2].value = play.quality;
            this._setValue(this._setting[1].items[2]);
        }
    }
    get display() {
        return {
            sidebarWidth: this._setting[2].items[0].value,
            albumWidth: this._setting[2].items[1].value,
        };
    }
    set display(display) {
        // display.sidebarWidth
        if (display.sidebarWidth >= 180 && display.sidebarWidth <= 260) {
            this._setting[2].items[0].value = display.sidebarWidth;
            this._setValue(this._setting[2].items[0]);
        }
        // display.albumWidth
        if (display.albumWidth >= 200 && display.albumWidth <= 400) {
            // console.log('set display.albumWidth',display.albumWidth);
            this._setting[2].items[1].value = display.albumWidth;
            this._setValue(this._setting[2].items[1]);
        }
    }
}