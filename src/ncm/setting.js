import { themes } from "./theme";

/**
 * 设置项
 * @typedef {Object} SettingCatagory 设置分类
 * @property {Object} SettingCatagory.SettingItem 设置项
 * @property {any} SettingCatagory.SettingItem.value 设置项的值
 * @property {any} SettingCatagory.SettingItem.default 设置项的默认值
 * @property {Function} SettingCatagory.SettingItem.validation 设置项的验证函数
 * @property {String} SettingCatagory.SettingItem.type 设置项值的类型，可选，目前只支持为 'number'
 * @property {Boolean} SettingCatagory.SettingItem.nosave 是否不保存到 localStorage
 */

/**
 * 设置组
 * @typedef {Array<SettingCatagory>} SettingGroup 设置组
 */

export const settingGroup = {
    play: {
        volume: {
            value: localStorage.getItem('setting.play.volume') ?? 1,
            default: 1,
            type: 'number',
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
                let valid = typeof value === 'string' && ['order', 'random', 'listrandom', 'listloop', 'loop'].includes(value);
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
                let valid = typeof value === 'string' && ['standard', 'higher', 'exhigh', 'lossless', 'hires', 'jyeffect', 'sky', 'jymaster'].includes(value);
                if (valid) {
                    localStorage.setItem('setting.play.quality', value);
                }
                return valid;
            },
        },
    },
    display: {
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
            type: 'number',
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
            type: 'number',
            nosave: true,
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
            type: 'number',
            nosave: true,
            validation: (value) => {
                let valid = typeof value === 'number' && value >= 200 && value <= 400;
                if (valid) {
                    localStorage.setItem('setting.display.albumWidth', value);
                }
                return valid;
            },
        },
    },
    titleBar: {
        searchHistory: {
            value: JSON.parse(localStorage.getItem('setting.searchHistory')) ?? [],
            default: [],
            nosave: true,
            validation: (value) => {
                let valid = Array.isArray(value);
                if (valid) {
                    localStorage.setItem('setting.searchHistory', JSON.stringify(value));
                }
                return valid;
            }
        }
    }
}

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
        return Setting.createProxy(settingGroup);
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
                            if (target[prop].type === 'number') {
                                value = parseFloat(value);
                            }
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
    /**
     * 将当前设置导出为 JSON 字符串
     * @param {Setting} instance Setting的实例
     * @returns {string} JSON string
     */
    static exportToJSON(instance) {
        let settings = {};
        for (const key of Object.keys(settingGroup)) {
            settings[key] = {};
            try {
                if (settingGroup[key].nosave) continue;
                if (settings[key].value !== undefined) {
                    settings[key] = instance[key];
                } else {
                    for (const subKey of Object.keys(settingGroup[key])) {
                        if (settingGroup[key][subKey].nosave) continue;
                        settings[key][subKey] = instance[key][subKey];
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        // return settings;
        return JSON.stringify(settings, null, '\t');
    }

    /**
     * 
     * @param {Setting} instance Setting的实例
     * @param {String} json JSON字符串
     */
    static importFromJSON(instance, json) {
        let settings = JSON.parse(json);
        for (const key of Object.keys(settings)) {
            try {
                if (settings[key].value !== undefined) {
                    instance[key] = settings[key];
                } else {
                    for (const subKey of Object.keys(settings[key])) {
                        instance[key][subKey] = settings[key][subKey];
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        return instance;
    }

    get modes() {
        return this.#modes;
    }
    get qualities() {
        return this.#qualities;
    }
}