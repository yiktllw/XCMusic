/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * render_storage.ts 为在渲染进程中存储数据相关功能
 * 主要包装了localStorage，用于将数据JSON化，以防类型丢失
 *---------------------------------------------------------------*/

import { Theme1, Theme2 } from "./theme";
import { ITrack } from "./tracks";

export enum StorageKey {
  CurrentTrack = "currentTrack",
  LoginAvatar = "login_avatar",
  LoginCookie = "login_cookie",
  LoginStatus = "login_status",
  LoginUserId = "login_user_id",
  LoginUserName = "login_user_name",
  Setting_Display_AlbumWidth = "setting.display.albumWidth",
  Setting_Display_FullscreenAutoZoom = "setting.display.fullscreenAutoZoom",
  Setting_Display_HideInSidebar = "setting.display.hideInSidebar",
  Setting_Display_Language = "setting.display.language",
  Setting_Display_SidebarWidth = "setting.display.sidebarWidth",
  Setting_Display_Theme = "setting.display.theme",
  Setting_Display_UserCustomThemes = "setting.display.userCustomThemes",
  Setting_Display_Zoom = "setting.display.zoom",
  Setting_Download_LocalPaths = "setting.download.localPaths",
  Setting_Download_Path = "setting.download.path",
  Setting_Download_Quality = "setting.download.quality",
  Setting_Play_AutoPlay = "setting.play.autoPlay",
  Setting_Play_Dbclick = "setting.play.dbclick",
  Setting_Play_Device = "setting.play.device",
  Setting_Play_Mode = "setting.play.mode",
  Setting_Play_Quality = "setting.play.quality",
  Settting_Play_Volume = "setting.play.volume",
  Setting_Play_VolumeLeveling = "setting.play.volume_leveling",
  Setting_PlayUI_Spectrum = "setting.playUI.spectrum",
  Setting_SearchHistory = "setting.searchHistory",
  Setting_System_disableGpuAcceleration = "setting.system.disableGpuAcceleration",
  Setting_System_OpenAtLogin = "setting.system.openAtLogin",
  Setting_TitleBar_CloseButton = "setting.titleBar.closeButton",
  Setting_TitleBar_CloseAlwaysAsk = "setting.titleBar.closeAlwaysAsk",
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
};

interface IData {
  data: any;
}

/**
 * 从localStorage中存储数据
 */
export function setStorage<T extends keyof StorageMap>(
  key: T,
  value: StorageMap[T] | null
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
  key: T
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
