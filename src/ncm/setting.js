import { themes } from "./theme";

export class Setting {
    #modes = [
        'order',
        'random',
        'listrandom',
        'listloop',
        'loop'
    ];
    #qualities = [
        'standard',
        'higher',
        'exhigh',
        'lossless',
        'hires',
        'jyeffect',
        'sky',
        'jymaster',
    ];
    constructor() {
        this.init = {
            value: localStorage.getItem('setting.init') ?? false,
            default: false,
            validation: (value) => {
                let valid = typeof value === 'boolean';
                if (valid) {
                    localStorage.setItem('setting.init', value);
                }
                return valid;
            },
        }
        this.play = {
            volume: {
                value: localStorage.getItem('setting.play.volume') ?? 1,
                default: 1,
                validation: (value) => {
                    let valid = typeof value === 'number' && value >= 0 && value <= 1;
                    if (valid) {
                        localStorage.setItem('setting.play.volume', value);
                    }
                    return valid;
                },
            },
            mode: {
                value: localStorage.getItem('setting.play.mode') ?? 'order',
                default: 'order',
                validation: (value) => {
                    let valid = typeof value === 'string' && this.modes.includes(value);
                    if (valid) {
                        localStorage.setItem('setting.play.mode', value);
                    }
                    return valid;
                },
            },
            quality: {
                value: localStorage.getItem('setting.play.quality') ?? 'standard',
                default: 'standard',
                validation: (value) => {
                    let valid = typeof value === 'string' && this.qualities.includes(value);
                    if (valid) {
                        localStorage.setItem('setting.play.quality', value);
                    }
                    return valid;
                },
            },
        }
        this.display = {
            language: {
                value: localStorage.getItem('setting.display.language') ?? 'zh',
                default: 'zh',
                validation: (value) => {
                    let valid = ['zh', 'en'].includes(value);
                    if (valid) {
                        localStorage.setItem('setting.display.language', value);
                    }
                    return valid;
                }
            },
            theme: {
                value: localStorage.getItem('setting.display.theme') ?? 'dark',
                default: 'dark',
                validation: (value) => {
                    let valid = typeof value === 'string' && themes.some(theme => theme.value === value);
                    if (valid) {
                        localStorage.setItem('setting.display.theme', value);
                    }
                    return valid;
                }
            },
            zoom: {
                value: localStorage.getItem('setting.display.zoom') ?? 1,
                default: 1,
                validation: (value) => {
                    let valid = typeof value === 'number' && value >= 0.5 && value <= 2;
                    if (valid) {
                        localStorage.setItem('setting.display.zoom', value);
                        if (window.electron.isElectron) {
                            window.electron.ipcRenderer.send('zoom', value);
                        }
                    }
                    return valid;
                },
            },
            sidebarWidth: {
                value: localStorage.getItem('setting.display.sidebarWidth') ?? 200,
                default: 200,
                validation: (value) => {
                    let valid = typeof value === 'number' && value >= 180 && value <= 260;
                    if (valid) {
                        localStorage.setItem('setting.display.sidebarWidth', value);
                    }
                    return valid;
                },
            },
            albumWidth: {
                value: localStorage.getItem('setting.display.albumWidth') ?? 230,
                default: 230,
                validation: (value) => {
                    let valid = typeof value === 'number' && value >= 200 && value <= 400;
                    if (valid) {
                        localStorage.setItem('setting.display.albumWidth', value);
                    }
                    return valid;
                },
            },
        }
        this.titleBar = {
            searchHistory: {
                value: JSON.parse(localStorage.getItem('setting.searchHistory')) ?? [],
                default: [],
                validation: (value) => {
                    let valid = Array.isArray(value);
                    if (valid) {
                        localStorage.setItem('setting.searchHistory', JSON.stringify(value));
                    }
                    return valid;
                }
            }
        }
        // this._initSettings(true);
        return Setting.createProxy(this);
    }
    static createProxy(obj) {
        const proxyObj = {};

        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                proxyObj[key] = new Proxy(obj[key], {
                    get(target, prop) {
                        if (prop in target && 'value' in target[prop]) {
                            return target[prop].value;
                        }
                        return target[prop];
                    },
                    set(target, prop, value) {
                        if (prop in target && 'value' in target[prop]) {
                            if (target[prop].validation && !target[prop].validation(value)) {
                                throw new Error(`Invalid value: ${value} for ${prop}`);
                            }
                            if (target[prop].value !== value) {
                                target[prop].value = value;
                                console.log(`Set ${prop} to ${value}`);
                            }
                            return true;
                        }
                        return false; // 不允许修改非 value 属性的其他属性
                    }
                });
            } else {
                proxyObj[key] = obj[key];
            }
        }

        return proxyObj;
    }
    get modes() {
        return this.#modes;
    }
    get qualities() {
        return this.#qualities;
    }
}