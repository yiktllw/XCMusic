/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * setting.ts 为渲染进程中，处理设置的工具
 * Setting类会在vuex store中被实例化
 * Setting类封装了设置内容，提供了导入导出功能
 * ISettings接口用于获取智能提示
 * SettingGroup对象是所有设置的内容
 *---------------------------------------------------------------*/

import { ProxyConfig } from "@/dual/userProxy.interface";
import { getStorage, setStorage, StorageKey } from "@/utils/render_storage";
import { Theme1, Theme2, themes } from "@/utils/theme";
import { setProxyUrl } from "@/utils/api";
let fs: any, path: any, os: any;

if (window.electron?.isElectron) {
  fs = window.api.fs;
  path = window.api.path;
  os = window.api.os;
}

type SettingCatagory = {
  [key: string]: {
    /** 设置项的值 */
    value: any;
    /** 设置项的默认值(暂未使用) */
    default: any;
    /** 检验器，验证值是否有效，若有效，会执行对应的操作 */
    validation: (value: any) => boolean;
    /** 更好支持数字类型 */
    type?: "number";
    /** 在导出设置时，是否忽略，默认忽略 */
    nosave?: boolean;
  };
};

export type SettingGroup = {
  [key: string]: SettingCatagory;
};

/**
 * 设置接口，用于获取智能提示
 */
export interface ISettings {
  /** 播放设置 */
  play: {
    /** 双击歌曲列表的行为 */
    dbclick: "all" | "single";
    /** 是否启用音量均衡 */
    volume_leveling: boolean;
    /** 音量 */
    volume: number;
    /** 播放模式 */
    mode: string;
    /** 播放音质 */
    quality: string;
    /** 播放设备 */
    device: string;
    /** 是否启用自动播放 */
    autoPlay: boolean;
    /** 是否记住歌曲播放进度 */
    rememberTrackProgress: boolean;
  };
  /** 播放界面设置 */
  playui: {
    /** 是否显示播放界面的频谱图 */
    spectrum: boolean;
  };
  /** 下载设置 */
  download: {
    /** 下载路径 */
    path: string;
    /** 下载音质 */
    quality: string;
    /** 本地音乐路径 */
    localPaths: string[];
  };
  /** 显示设置 */
  display: {
    /** 语言 */
    language: "zh" | "en";
    /** 主题 */
    theme: string;
    /** 用户自定义的主题 */
    userCustomThemes: Array<{
      data: Theme1 | Theme2;
      classContent: string;
    }>;
    /** 缩放 */
    zoom: number;
    /** 全屏时是否自动缩放 */
    fullscreenAutoZoom: boolean;
    /** 侧边栏宽度 */
    sidebarWidth: number;
    /** 歌曲列表的专辑列宽度 */
    albumWidth: number;
    /** 在侧边栏中，隐藏的元素 */
    hideInSidebar: TSideBarItems[];
    /** 是否在播放列表中显示封面 */
    showCoverInPlaylist: boolean;
  };
  /** 标题栏设置 */
  titleBar: {
    /** 搜索历史 */
    searchHistory: string[];
    /** 点击关闭按钮时的行为 */
    closeButton: "quit" | "minimize";
    /** 是否 总是询问关闭按钮行为 */
    closeAlwaysAsk: boolean;
  };
  /** 工具设置 */
  tools: {
    /** 代理设置 */
    proxy: ProxyConfig;
  };
  /** 系统 */
  system: {
    /** 开机自启动 */
    openAtLogin: boolean;
    /** 禁用硬件加速 */
    disableGpuAcceleration: boolean;
  };
}

/**
 * 设置对象，用于实例化设置，内容与ISettings接口一致
 */
export const settingGroup: SettingGroup = {
  play: {
    dbclick: {
      value: getStorage(StorageKey.Setting_Play_Dbclick) ?? "all",
      default: "all",
      validation: (value) => {
        let valid = ["all", "single"].includes(value);
        if (valid) {
          setStorage(StorageKey.Setting_Play_Dbclick, value);
        }
        return valid;
      },
    },
    volume_leveling: {
      value: getStorage(StorageKey.Setting_Play_VolumeLeveling) ?? true,
      default: true,
      validation: (value) => {
        let valid = typeof value === "boolean";
        let valid2 =
          typeof value === "string" &&
          ["true", "false"].includes(value.toLowerCase());
        if (valid) {
          setStorage(StorageKey.Setting_Play_VolumeLeveling, value);
        } else if (valid2) {
          setStorage(StorageKey.Setting_Play_VolumeLeveling, value);
          valid = true;
        }
        return valid;
      },
    },
    volume: {
      value: getStorage(StorageKey.Settting_Play_Volume) ?? 1,
      default: 1,
      type: "number",
      validation: (value) => {
        let valid = typeof value === "number" && value >= 0 && value <= 1;
        if (valid) {
          setStorage(StorageKey.Settting_Play_Volume, value);
        }
        return valid;
      },
    },
    mode: {
      value: getStorage(StorageKey.Setting_Play_Mode) ?? "order",
      default: "order",
      validation: (value) => {
        let valid = typeof value === "string" && modes.includes(value);
        if (valid) {
          setStorage(StorageKey.Setting_Play_Mode, value);
        }
        return valid;
      },
    },
    quality: {
      value: getStorage(StorageKey.Setting_Play_Quality) ?? "standard",
      default: "standard",
      validation: (value) => {
        let valid = typeof value === "string" && qualities.includes(value);
        if (valid) {
          setStorage(StorageKey.Setting_Play_Quality, value);
        }
        return valid;
      },
    },
    device: {
      value: getStorage(StorageKey.Setting_Play_Device) ?? "default",
      default: "default",
      validation: (value) => {
        let valid = typeof value === "string";
        if (valid) {
          setStorage(StorageKey.Setting_Play_Device, value);
        }
        return valid;
      },
    },
    autoPlay: {
      value: getStorage(StorageKey.Setting_Play_AutoPlay) ?? false,
      default: false,
      validation: (value) => {
        let valid = validBoolean(value);
        if (valid) {
          value = strToBool(value);
          setStorage(StorageKey.Setting_Play_AutoPlay, value);
        }
        return valid;
      },
    },
    rememberTrackProgress: {
      value: getStorage(StorageKey.Setting_Play_RememberTrackProgress) ?? false,
      default: false,
      validation(value: boolean) {
        let valid = typeof value === typeof true;
        if (valid) {
          setStorage(StorageKey.Setting_Play_RememberTrackProgress, value);
        }
        return valid;
      },
    },
  },
  playui: {
    spectrum: {
      value: getStorage(StorageKey.Setting_PlayUI_Spectrum) ?? false,
      default: false,
      validation: (value) => {
        let valid = typeof value === "boolean";
        let valid2 =
          typeof value === "string" &&
          ["true", "false"].includes(value.toLowerCase());
        if (valid) {
          setStorage(StorageKey.Setting_PlayUI_Spectrum, value);
        } else if (valid2) {
          setStorage(StorageKey.Setting_PlayUI_Spectrum, value);
          valid = true;
        }
        return valid;
      },
    },
  },
  download: {
    path: {
      value:
        getStorage(StorageKey.Setting_Download_Path) ?? getDownloadDirectory(),
      default: getDownloadDirectory(),
      validation: (value) => {
        let valid = typeof value === "string" && isValidDirectory(value);
        if (valid) {
          setStorage(StorageKey.Setting_Download_Path, value);
        }
        return valid;
      },
    },
    quality: {
      value: getStorage(StorageKey.Setting_Download_Quality) ?? "standard",
      default: "standard",
      validation: (value) => {
        let valid = typeof value === "string" && qualities.includes(value);
        if (valid) {
          setStorage(StorageKey.Setting_Download_Quality, value);
        }
        return valid;
      },
    },
    localPaths: {
      value: getStorage(StorageKey.Setting_Download_LocalPaths) ?? [],
      default: [],
      validation: (value) => {
        let valid =
          Array.isArray(value) &&
          value.every((path: string) => isValidDirectory(path));
        if (valid) {
          setStorage(StorageKey.Setting_Download_LocalPaths, value);
        }
        return valid;
      },
    },
  },
  display: {
    language: {
      value: getStorage(StorageKey.Setting_Display_Language) ?? "zh",
      default: "zh",
      validation: (value) => {
        let valid = ["zh", "en"].includes(value);
        if (valid) {
          setStorage(StorageKey.Setting_Display_Language, value);
        }
        return valid;
      },
    },
    theme: {
      value: getStorage(StorageKey.Setting_Display_Theme) ?? "dark",
      default: "dark",
      validation: (value) => {
        const userCustomThemes: Array<{
          data: Theme1 | Theme2;
          classContent: string;
        }> = getStorage(StorageKey.Setting_Display_UserCustomThemes) ?? [];
        let valid =
          typeof value === "string" &&
          (themes.some((theme) => theme.value === value) ||
            userCustomThemes.some((theme) => theme.data.value === value));
        if (valid) {
          setStorage(StorageKey.Setting_Display_Theme, value);
        }
        return valid;
      },
    },
    userCustomThemes: {
      value: getStorage(StorageKey.Setting_Display_UserCustomThemes) ?? [],
      default: [],
      validation: (value) => {
        let valid = Array.isArray(value);
        if (valid) {
          setStorage(StorageKey.Setting_Display_UserCustomThemes, value);
        }
        return valid;
      },
    },
    zoom: {
      value: getStorage(StorageKey.Setting_Display_Zoom) ?? 1,
      default: 1,
      type: "number",
      validation: (value) => {
        let valid = typeof value === "number" && value >= 0.5 && value <= 2;
        if (valid) {
          setStorage(StorageKey.Setting_Display_Zoom, value);
          if (window.electron?.isElectron) {
            window.electron.ipcRenderer.send("zoom", value);
          }
        }
        return valid;
      },
    },
    fullscreenAutoZoom: {
      value: getStorage(StorageKey.Setting_Display_FullscreenAutoZoom) ?? false,
      default: false,
      validation: (value) => {
        let valid = typeof value === "boolean";
        let valid2 =
          typeof value === "string" &&
          ["true", "false"].includes(value.toLowerCase());
        if (valid) {
          setStorage(StorageKey.Setting_Display_FullscreenAutoZoom, value);
        } else if (valid2) {
          setStorage(StorageKey.Setting_Display_FullscreenAutoZoom, value);
          valid = true;
        }
        return valid;
      },
    },
    sidebarWidth: {
      value: getStorage(StorageKey.Setting_Display_SidebarWidth) ?? 200,
      default: 200,
      type: "number",
      nosave: true,
      validation: (value) => {
        let valid = typeof value === "number" && value >= 180 && value <= 260;
        if (valid) {
          setStorage(StorageKey.Setting_Display_SidebarWidth, value);
        }
        return valid;
      },
    },
    albumWidth: {
      value: getStorage(StorageKey.Setting_Display_AlbumWidth) ?? 230,
      default: 230,
      type: "number",
      nosave: true,
      validation: (value) => {
        let valid = typeof value === "number" && value >= 200 && value <= 400;
        if (valid) {
          setStorage(StorageKey.Setting_Display_AlbumWidth, value);
        }
        return valid;
      },
    },
    hideInSidebar: {
      value: getStorage(StorageKey.Setting_Display_HideInSidebar) ?? [],
      default: [],
      validation: (value) => {
        let valid =
          Array.isArray(value) &&
          value.every((item: string) => sidebarItems.includes(item));
        if (valid) {
          setStorage(StorageKey.Setting_Display_HideInSidebar, value);
        }
        return valid;
      },
    },
  },
  titleBar: {
    searchHistory: {
      value: getStorage(StorageKey.Setting_SearchHistory) ?? [],
      default: [],
      nosave: true,
      validation: (value) => {
        let valid = Array.isArray(value);
        if (valid) {
          setStorage(StorageKey.Setting_SearchHistory, value);
        }
        return valid;
      },
    },
    closeButton: {
      value: getStorage(StorageKey.Setting_TitleBar_CloseButton) ?? "minimize",
      default: "minimize",
      validation: (value) => {
        let valid =
          typeof value === "string" && ["quit", "minimize"].includes(value);
        if (valid) {
          setStorage(StorageKey.Setting_TitleBar_CloseButton, value);
        }
        return valid;
      },
    },
    closeAlwaysAsk: {
      value: getStorage(StorageKey.Setting_TitleBar_CloseAlwaysAsk) ?? true,
      default: true,
      validation: (value) => {
        let valid = typeof value === "boolean";
        let valid2 =
          typeof value === "string" &&
          ["true", "false"].includes(value.toLowerCase());
        if (valid) {
          setStorage(StorageKey.Setting_TitleBar_CloseAlwaysAsk, value);
        } else if (valid2) {
          setStorage(StorageKey.Setting_TitleBar_CloseAlwaysAsk, value);
          valid = true;
        }
        return valid;
      },
    },
  },
  tools: {
    proxy: {
      value: getStorage(StorageKey.Setting_Tools_Proxy) ?? {
        mode: "none",
        server: "",
        username: "",
        password: "",
      },
      default: {
        mode: "none",
        server: "",
        username: "",
        password: "",
      },
      validation: (value: ProxyConfig) => {
        let valid =
          typeof value === "object" &&
          typeof value.mode === "string" &&
          ["none", "http", "socks4", "socks5", "browser"].includes(
            value.mode,
          ) &&
          typeof value.server === "string" &&
          (value.mode === "none" || value.server !== "") &&
          typeof value.username === "string" &&
          typeof value.password === "string";
        if (value.mode !== "none") {
          try {
            new URL(`${value.mode}://${value.server}`);
          } catch (e) {
            valid = false;
          }
        }
        if (valid) {
          setStorage(StorageKey.Setting_Tools_Proxy, value);
          // 值有效时，设置代理
          if (window.electron?.isElectron) {
            setProxyUrl(value);
            window.electron.ipcRenderer.send("set-proxy", value);
          }
        }
        return valid;
      },
    },
  },
  system: {
    openAtLogin: {
      value: getStorage(StorageKey.Setting_System_OpenAtLogin) ?? false,
      default: false,
      validation: (value) => {
        let valid = false;
        let isBool = typeof value === "boolean";

        // 将value转换为boolean并得知是否有效
        if (isBool) {
          setStorage(StorageKey.Setting_System_OpenAtLogin, value);
          valid = true;
        } else if (typeof value === "string") {
          value = value.toLowerCase();
          if (value === "true") {
            value = true;
            valid = true;
          } else if (value === "false") {
            value = false;
            valid = true;
          }
        }

        if (valid && window.electron?.isElectron) {
          window.electron.ipcRenderer.send("open-at-login", value);
        }

        return valid;
      },
    },
    disableGpuAcceleration: {
      value:
        getStorage(StorageKey.Setting_System_disableGpuAcceleration) ?? false,
      default: false,
      validation: (value) => {
        let valid = typeof value === "boolean";
        if (valid) {
          setStorage(StorageKey.Setting_System_disableGpuAcceleration, value);
          if (window.electron?.isElectron) {
            window.electron.ipcRenderer.send(
              value ? "disable-gpu" : "enable-gpu",
            );
          }
        }
        return valid;
      },
    },
  },
};

/** 播放模式 */
const modes = ["order", "random", "listrandom", "listloop", "loop"];

/** 音质 */
export const qualities = [
  "standard",
  "higher",
  "exhigh",
  "lossless",
  "hires",
  "jyeffect",
  "sky",
  "jymaster",
];

/** 侧边栏的内容 */
const sidebarItems = ["favorite", "album", "local", "download", "cloud"];

export type TSideBarItems =
  | "favorite"
  | "album"
  | "local"
  | "download"
  | "cloud";

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
    if (typeof obj[key] === "object" && obj[key] !== null) {
      proxyObj[key] = new Proxy(obj[key] as SettingCatagory, {
        get(target, prop) {
          if (
            typeof prop === "string" &&
            prop in target &&
            "value" in target[prop]
          ) {
            return target[prop].value;
          }
          return typeof prop === "string" ? target[prop] : undefined;
        },
        set(target, prop, value) {
          if (
            typeof prop === "string" &&
            prop in target &&
            "value" in target[prop]
          ) {
            if (target[prop].type === "number") {
              value = parseFloat(value);
            }
            if (target[prop].validation && !target[prop].validation(value)) {
              throw new Error(`Invalid value: ${value} for ${prop}`);
            }
            if (target[prop].value !== value) {
              target[prop].value = value;
              console.log(`Set ${prop} to `, JSON.stringify(value, null, "\t"));
            }
            return true;
          }
          return false; // 不允许修改非 value 属性的其他属性
        },
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
    console.error("Not running in electron");
    return "";
  }
  const homeDir = os.homedir(); // 获取用户主目录
  let downloadDir: string;

  switch (os.platform()) {
    case "win32": // Windows 平台
      downloadDir = path.join(homeDir, "Downloads");
      break;
    case "darwin": // macOS 平台
    case "linux": // Linux 平台
      downloadDir = path.join(homeDir, "Downloads");
      break;
    default:
      throw new Error("Unsupported platform");
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
  return JSON.stringify(settings, null, "\t");
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
    console.error("Not running in electron");
    return false;
  }
  try {
    return fs.existsSync(directoryPath);
  } catch (err) {
    return false; // 如果出现错误，说明目录无效
  }
}

function validBoolean(value: any): boolean {
  return (
    typeof value === "boolean" ||
    (typeof value === "string" &&
      ["true", "false"].includes(value.toLowerCase()))
  );
}

function strToBool(value: string | boolean): boolean {
  if (typeof value === "boolean") return value;
  return value === "true";
}
