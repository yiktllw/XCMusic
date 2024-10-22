import { themes } from "./theme";
let fs: any, path: any, os: any;

if (window.electron?.isElectron) {
    fs = window.api.fs;
    path = window.api.path;
    os = window.api.os;
}


type SettingCatagory = {
    [key: string]: {
        value: any,
        default: any,
        validation: (value: any) => boolean,
        type?: 'number',
        nosave?: boolean
    }
}

export type SettingGroup = {
    [key: string]: SettingCatagory
};

export interface Settings {
    play: {
        dbclick: 'all' | 'single',
        volume_leveling: boolean,
        volume: number,
        mode: string,
        quality: string,
        device: string,
    },
    download: {
        path: string,
        quality: string,
    }
    display: {
        language: 'zh' | 'en',
        theme: string,
        zoom: number,
        sidebarWidth: number,
        albumWidth: number,
    },
    titleBar: {
        searchHistory: string[],
        closeButton: 'quit' | 'minimize',
    }
}

export const settingGroup: SettingGroup = {
    play: {
        dbclick: {
            value: localStorage.getItem('setting.play.dbclick') ?? 'all',
            default: 'all',
            validation: (value) => {
                let valid = ['all', 'single'].includes(value);
                if (valid) {
                    localStorage.setItem('setting.play.dbclick', value);
                }
                return valid;
            }
        },
        volume_leveling: {
            value: localStorage.getItem('setting.play.volume_leveling') ?? true,
            default: true,
            validation: (value) => {
                let valid = typeof value === 'boolean';
                let valid2 = typeof value === 'string' && ['true', 'false'].includes(value.toLowerCase());
                if (valid) {
                    localStorage.setItem('setting.play.volume_leveling', value);
                } else if (valid2) {
                    localStorage.setItem('setting.play.volume_leveling', value);
                    valid = true;
                }
                return valid;
            }
        },
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
                let valid = typeof value === 'string' && modes.includes(value);
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
                let valid = typeof value === 'string' && qualities.includes(value);
                if (valid) {
                    localStorage.setItem('setting.play.quality', value);
                }
                return valid;
            },
        },
        device: {
            value: localStorage.getItem('setting.play.device') ?? 'default',
            default: 'default',
            validation: (value) => {
                let valid = typeof value === 'string';
                if (valid) {
                    localStorage.setItem('setting.play.device', value);
                }
                return valid;
            }
        }
    },
    download: {
        path: {
            value: localStorage.getItem('setting.download.path') ?? getDownloadDirectory(),
            default: getDownloadDirectory(),
            validation: (value) => {
                let valid = typeof value === 'string' && isValidDirectory(value);
                if (valid) {
                    localStorage.setItem('setting.download.path', value);
                }
                return valid;
            }
        },
        quality: {
            value: localStorage.getItem('setting.play.quality') ?? 'standard',
            default: 'standard',
            validation: (value) => {
                let valid = typeof value === 'string' && qualities.includes(value);
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
                    if (window.electron?.isElectron) {
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
            value: JSON.parse(localStorage.getItem('setting.searchHistory') || '[]') ?? [],
            default: [],
            nosave: true,
            validation: (value) => {
                let valid = Array.isArray(value);
                if (valid) {
                    localStorage.setItem('setting.searchHistory', JSON.stringify(value));
                }
                return valid;
            }
        },
        closeButton: {
            value: localStorage.getItem('setting.titleBar.closeButton') ?? 'minimize',
            default: 'minimize',
            validation: (value) => {
                let valid = typeof value === 'string' && ['quit', 'minimize'].includes(value);
                if (valid) {
                    localStorage.setItem('setting.titleBar.closeButton', value);
                }
                return valid;
            }
        }
    }
}

const modes = [
    'order',
    'random',
    'listrandom',
    'listloop',
    'loop'
]

export const qualities = [
    'standard',
    'higher',
    'exhigh',
    'lossless',
    'hires',
    'jyeffect',
    'sky',
    'jymaster',
]

export class Setting {
    constructor() {
        return Setting.createProxy(settingGroup);
    }
    static createProxy(obj: SettingGroup): SettingGroup {
        const proxyObj: { [key: string]: any } = {};

        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                proxyObj[key] = new Proxy(obj[key] as SettingCatagory, {
                    get(target, prop) {
                        if (typeof prop === 'string' && prop in target && 'value' in target[prop]) {
                            return target[prop].value;
                        }
                        return typeof prop === 'string' ? target[prop] : undefined;
                    },
                    set(target, prop, value) {
                        if (typeof prop === 'string' && prop in target && 'value' in target[prop]) {
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
    static exportToJSON(instance: any): string {
        let settings: { [key: string]: any } = {};
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
    static importFromJSON(instance: any, json: string) {
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
}

/**
 * 获取默认下载目录
 */
function getDownloadDirectory(): string {
    if (!window.electron?.isElectron) {
        console.error('Not running in electron');
        return '';
    }
    const homeDir = os.homedir();  // 获取用户主目录
    let downloadDir: string;

    switch (os.platform()) {
        case 'win32':  // Windows 平台
            downloadDir = path.join(homeDir, 'Downloads');
            break;
        case 'darwin':  // macOS 平台
        case 'linux':   // Linux 平台
            downloadDir = path.join(homeDir, 'Downloads');
            break;
        default:
            throw new Error('Unsupported platform');
    }

    return downloadDir;
}

/** 
 * 检查目录是否有效
 */
function isValidDirectory(directoryPath: string): boolean {
    if (!window.electron?.isElectron) {
        console.error('Not running in electron');
        return false;
    }
    try {
        return fs.existsSync(directoryPath);
    } catch (err) {
        return false;  // 如果出现错误，说明目录无效
    }
}