/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * render_storage.ts 为在渲染进程中存储数据相关功能
 * 主要包装了localStorage，用于将数据JSON化，以防类型丢失
 *---------------------------------------------------------------*/

import { ProxyConfig } from "@/dual/userProxy.interface";
import { Theme1, Theme2 } from "./theme";
import { ITrack } from "./tracks";
import { IEqualizer } from "@/dual/player";

export enum StorageKey {
  /** 当前歌曲 */
  CurrentTrack = "currentTrack",
  /** 用户头像 */
  LoginAvatar = "login_avatar",
  /** 登录Cookie */
  LoginCookie = "login_cookie",
  /** 登录状态 */
  LoginStatus = "login_status",
  /** 用户ID */
  LoginUserId = "login_user_id",
  /** 用户名 */
  LoginUserName = "login_user_name",
  /** 设置-显示-专辑宽度 */
  Setting_Display_AlbumWidth = "setting.display.albumWidth",
  /** 设置-显示-全屏自动缩放 */
  Setting_Display_FullscreenAutoZoom = "setting.display.fullscreenAutoZoom",
  /** 设置-显示-侧边栏隐藏 */
  Setting_Display_HideInSidebar = "setting.display.hideInSidebar",
  /** 设置-显示-语言 */
  Setting_Display_Language = "setting.display.language",
  /** 设置-显示-侧边栏宽度 */
  Setting_Display_SidebarWidth = "setting.display.sidebarWidth",
  /** 设置-显示-主题 */
  Setting_Display_Theme = "setting.display.theme",
  /** 设置-显示-用户自定义主题 */
  Setting_Display_UserCustomThemes = "setting.display.userCustomThemes",
  /** 设置-显示-缩放 */
  Setting_Display_Zoom = "setting.display.zoom",
  /** 设置-下载-本地路径 */
  Setting_Download_LocalPaths = "setting.download.localPaths",
  /** 设置-下载-路径 */
  Setting_Download_Path = "setting.download.path",
  /** 设置-下载-音质 */
  Setting_Download_Quality = "setting.download.quality",
  /** 设置-播放-自动播放 */
  Setting_Play_AutoPlay = "setting.play.autoPlay",
  /** 设置-播放-双击行为 */
  Setting_Play_Dbclick = "setting.play.dbclick",
  /** 设置-播放-输出设备 */
  Setting_Play_Device = "setting.play.device",
  /** 设置-播放-模式 */
  Setting_Play_Mode = "setting.play.mode",
  /** 设置-播放-音质 */
  Setting_Play_Quality = "setting.play.quality",
  /** 设置-播放-音量 */
  Settting_Play_Volume = "setting.play.volume",
  /** 设置-播放-音量均衡 */
  Setting_Play_VolumeLeveling = "setting.play.volume_leveling",
  /** 设置-播放-显示频谱图 */
  Setting_PlayUI_Spectrum = "setting.playUI.spectrum",
  /** 设置-搜索-历史记录 */
  Setting_SearchHistory = "setting.searchHistory",
  /** 设置-系统-禁用GPU加速 */
  Setting_System_disableGpuAcceleration = "setting.system.disableGpuAcceleration",
  /** 设置-系统-开机自启 */
  Setting_System_OpenAtLogin = "setting.system.openAtLogin",
  /** 设置-标题栏-关闭按钮 */
  Setting_TitleBar_CloseButton = "setting.titleBar.closeButton",
  /** 设置-标题栏-关闭时总是询问 */
  Setting_TitleBar_CloseAlwaysAsk = "setting.titleBar.closeAlwaysAsk",
  /** 设置-工具-代理 */
  Setting_Tools_Proxy = "setting.tool.proxy",
  /** 设置-播放-记住播放进度 */
  Setting_Play_RememberTrackProgress = "setting.play.rememberTrackProgress",
  /** 播放进度 */
  Track_Progress = "track_progress",
  /** 均衡器设置 */
  Setting_Play_Equalizer = "setting.play.equalizer",
}

export type StorageMap = {
  [StorageKey.CurrentTrack]: ITrack | null;
  [StorageKey.LoginAvatar]: string | null;
  [StorageKey.LoginCookie]: string | null;
  [StorageKey.LoginStatus]: boolean;
  [StorageKey.LoginUserId]: number | null;
  [StorageKey.LoginUserName]: string | null;
  [StorageKey.Setting_Display_AlbumWidth]: number;
  [StorageKey.Setting_Display_FullscreenAutoZoom]: boolean;
  [StorageKey.Setting_Display_HideInSidebar]: string[];
  [StorageKey.Setting_Display_Language]: "zh" | "en";
  [StorageKey.Setting_Display_SidebarWidth]: number;
  [StorageKey.Setting_Display_Theme]: string;
  [StorageKey.Setting_Display_UserCustomThemes]: Array<{
    data: Theme1 | Theme2;
    classContent: string;
  }>;
  [StorageKey.Setting_Display_Zoom]: number;
  [StorageKey.Setting_Download_LocalPaths]: string[];
  [StorageKey.Setting_Download_Path]: string;
  [StorageKey.Setting_Download_Quality]:
    | "standard"
    | "exhigh"
    | "lossless"
    | "hires"
    | "jyeffect"
    | "sky"
    | "jymaster";
  [StorageKey.Setting_Play_AutoPlay]: boolean;
  [StorageKey.Setting_Play_Dbclick]: "all" | "single";
  [StorageKey.Setting_Play_Device]: string;
  [StorageKey.Setting_Play_Mode]:
    | "loop"
    | "random"
    | "listloop"
    | "listrandom"
    | "order";
  [StorageKey.Setting_Play_Quality]:
    | "standard"
    | "exhigh"
    | "lossless"
    | "hires"
    | "jyeffect"
    | "sky"
    | "jymaster";
  [StorageKey.Settting_Play_Volume]: number;
  [StorageKey.Setting_Play_VolumeLeveling]: boolean;
  [StorageKey.Setting_PlayUI_Spectrum]: boolean;
  [StorageKey.Setting_SearchHistory]: string[];
  [StorageKey.Setting_System_disableGpuAcceleration]: boolean;
  [StorageKey.Setting_System_OpenAtLogin]: boolean;
  [StorageKey.Setting_TitleBar_CloseButton]: "quit" | "minimize";
  [StorageKey.Setting_TitleBar_CloseAlwaysAsk]: boolean;
  [StorageKey.Setting_Tools_Proxy]: ProxyConfig;
  [StorageKey.Setting_Play_RememberTrackProgress]: boolean;
  [StorageKey.Track_Progress]: {
    /** 歌曲ID */
    id: number;
    /** 播放进度，0-1 */
    normalizedProgress: number;
  };
  [StorageKey.Setting_Play_Equalizer]: IEqualizer;
};

interface IData {
  data: any;
}

/**
 * 从localStorage中存储数据
 */
export function setStorage<T extends keyof StorageMap>(
  key: T,
  value: StorageMap[T] | null,
): void {
  const data: IData = {
    data: value,
  };
  localStorage.setItem(key, JSON.stringify(data, null, 4));
}

/**
 * 从localStorage中获取数据
 */
export function getStorage<T extends keyof StorageMap>(
  key: T,
): StorageMap[T] | null {
  const value = localStorage.getItem(key);
  if (!value) {
    setStorage(key, null);
    return null;
  }
  let data: IData;
  try {
    data = JSON.parse(value);
  } catch (error) {
    console.error("解析数据失败", error);
    setStorage(key, null);
    return null;
  }
  if (typeof data === "object" && "data" in data) {
    return data.data as StorageMap[T];
  } else {
    setStorage(key, null);
    return null;
  }
}
