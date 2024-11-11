/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * setting.ts 为渲染进程中，处理设置的工具
 * Setting类会在vuex store中被实例化
 * Setting类封闭了设置内容，提供了导入导出功能
 * Settings接口用于获取智能提示
 * SettingGroup对象是所有设置的内容
*---------------------------------------------------------------*/

import { Theme1, Theme2 } from "./theme";
import { themes } from "./theme";
let fs: any, path: any, os: any;

if (window.electron?.isElectron) {
    fs = window.api.fs;
    path = window.api.path;
    os = window.api.os;
}

type SettingCatagory = {
    [key: string]: {
        /** 设置项的值 */
        value: any,
        /** 设置项的默认值(暂未使用) */
        default: any,
        /** 检验器，验证值是否有效 */
        validation: (value: any) => boolean,
        /** 更好支持数字类型 */
        type?: 'number',
        /** 在导出设置时，是否忽略，默认忽略 */
        nosave?: boolean
    }
}

export type SettingGroup = {
    [key: string]: SettingCatagory
};

/**
 * 设置接口，用于获取智能提示
 */
export interface Settings {
    /** 播放设置 */
    play: {
        /** 双击歌曲列表的行为 */
        dbclick: 'all' | 'single',
        /** 是否启用音量均衡 */
        volume_leveling: boolean,
        /** 音量 */
        volume: number,
        /** 播放模式 */
        mode: string,
        /** 播放音质 */
        quality: string,
        /** 播放设备 */
        device: string,
        /** 是否启用自动播放 */
        autoPlay: boolean,
    },
    /** 播放界面设置 */
    playui: {
        /** 是否显示播放界面的频谱图 */
        spectrum: boolean,
    }
    /** 下载设置 */
    download: {
        /** 下载路径 */
        path: string,
        /** 下载音质 */
        quality: string,
        /** 本地音乐路径 */
        localPaths: string[],
    }
    /** 显示设置 */
    display: {
        /** 语言 */
        language: 'zh' | 'en',
        /** 主题 */
        theme: string,
        /** 用户自定义的主题 */
        userCustomThemes: Array<{
            data: Theme1 | Theme2,
            classContent: string,
        }>,
        /** 缩放 */
        zoom: number,
        /** 全屏时是否自动缩放 */
        fullscreenAutoZoom: boolean,
        /** 侧边栏宽度 */
        sidebarWidth: number,
        /** 歌曲列表的专辑列宽度 */
        albumWidth: number,
    },
    /** 标题栏设置 */
    titleBar: {
        /** 搜索历史 */
        searchHistory: string[],
        /** 点击关闭按钮时的行为 */
        closeButton: 'quit' | 'minimize',
        /** 是否 总是询问关闭按钮行为 */
        closeAlwaysAsk: boolean,
    },
    /** 系统 */
    system: {
        /** 开机自启动 */
        openAtLogin: boolean,
    }
}

/**
 * 设置类，用于实例化设置，内容与Settings接口一致
 */
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
        },
        autoPlay: {
            value: localStorage.getItem('setting.play.autoPlay') === 'true',
            default: false,
            validation: (value) => {
                let valid = validBoolean(value);
                if (valid) {
                    value = strToBool(value);
                    localStorage.setItem('setting.play.autoPlay', value);
                }
                return valid;
            },
        },
    },
    playui: {
        spectrum: {
            value: localStorage.getItem('setting.playui.spectrum') ?? false,
            default: false,
            validation: (value) => {
                let valid = typeof value === 'boolean';
                let valid2 = typeof value === 'string' && ['true', 'false'].includes(value.toLowerCase());
                if (valid) {
                    localStorage.setItem('setting.playui.spectrum', value);
                } else if (valid2) {
                    localStorage.setItem('setting.playui.spectrum', value);
                    valid = true;
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
            value: localStorage.getItem('setting.download.quality') ?? 'standard',
            default: 'standard',
            validation: (value) => {
                let valid = typeof value === 'string' && qualities.includes(value);
                if (valid) {
                    localStorage.setItem('setting.download.quality', value);
                }
                return valid;
            },
        },
        localPaths: {
            value: JSON.parse(localStorage.getItem('setting.download.localPaths') ?? '[]'),
            default: [],
            validation: (value) => {
                let valid = Array.isArray(value) && value.every((path: string) => isValidDirectory(path));
                if (valid) {
                    localStorage.setItem('setting.download.localPaths', JSON.stringify(value));
                }
                return valid;
            }
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
                const userCustomThemes: Array<{
                    data: Theme1 | Theme2,
                    classContent: string,
                }> = JSON.parse(localStorage.getItem('setting.display.userCustomThemes') ?? '[]');
                let valid = typeof value === 'string' && (themes.some(theme => theme.value === value) || userCustomThemes.some((theme) => theme.data.value === value));
                if (valid) {
                    localStorage.setItem('setting.display.theme', value);
                }
                return valid;
            }
        },
        userCustomThemes: {
            value: JSON.parse(localStorage.getItem('setting.display.userCustomThemes') ?? '[]'),
            default: [],
            validation: (value) => {
                let valid = Array.isArray(value);
                if (valid) {
                    localStorage.setItem('setting.display.userCustomThemes', JSON.stringify(value));
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
        fullscreenAutoZoom: {
            value: localStorage.getItem('setting.display.fullscreenAutoZoom') ?? false,
            default: false,
            validation: (value) => {
                let valid = typeof value === 'boolean';
                let valid2 = typeof value === 'string' && ['true', 'false'].includes(value.toLowerCase());
                if (valid) {
                    localStorage.setItem('setting.display.fullscreenAutoZoom', value);
                } else if (valid2) {
                    localStorage.setItem('setting.display.fullscreenAutoZoom', value);
                    valid = true;
                }
                return valid;
            }
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
        },
        closeAlwaysAsk: {
            value: localStorage.getItem('setting.titleBar.closeAlwaysAsk') ?? true,
            default: true,
            validation: (value) => {
                let valid = typeof value === 'boolean';
                let valid2 = typeof value === 'string' && ['true', 'false'].includes(value.toLowerCase());
                if (valid) {
                    localStorage.setItem('setting.titleBar.closeAlwaysAsk', value);
                } else if (valid2) {
                    localStorage.setItem('setting.titleBar.closeAlwaysAsk', value);
                    valid = true;
                }
                return valid;
            }
        },
    },
    system: {
        openAtLogin: {
            value: localStorage.getItem('setting.system.openAtLogin') === 'true',
            default: false,
            validation: (value) => {
                let valid = false;
                let isBool = typeof value === 'boolean';

                // 将value转换为boolean并得知是否有效
                if (isBool) {
                    localStorage.setItem('setting.system.openAtLogin', value);
                    valid = true;
                } else if (typeof value === 'string') {
                    value = value.toLowerCase();
                    if (value === 'true') {
                        value = true;
                        valid = true;
                    } else if (value === 'false') {
                        value = false;
                        valid = true;
                    }
                }

                if (valid && window.electron?.isElectron) {
                    window.electron.ipcRenderer.send('open-at-login', value);
                }

                return valid;
            },
        },
    },
}

/** 播放模式 */
const modes = [
    'order',
    'random',
    'listrandom',
    'listloop',
    'loop'
]

/** 音质 */
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

/** 
 * 设置类 
 * 访问方法与Settings接口一致
 * 通过代理实现，能够验证值的有效性
*/
export class Setting {
    constructor() {
        return createProxy(settingGroup);
    }
}

/** 创建一个SettingGroup的代理 */
function createProxy(obj: SettingGroup): SettingGroup {
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

/** 获取默认下载目录 */
export function getDownloadDirectory(): string {
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
 * 将当前设置导出为 JSON 字符串
 * @param {Setting} instance Setting的实例
 * @returns {string} JSON string
 */
export function exportToJSON(instance: any): string {
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
export function importFromJSON(instance: any, json: string): any {
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
/** 
 * 检查目录是否有效
 */
export function isValidDirectory(directoryPath: string): boolean {
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

function validBoolean(value: any): boolean {
    return typeof value === 'boolean' || (typeof value === 'string' && ['true', 'false'].includes(value.toLowerCase()));
}

function strToBool(value: string | boolean): boolean {
    if (typeof value === 'boolean') return value;
    return value === 'true';
}