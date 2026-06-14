import { settingGroup } from "@/utils/setting";
import packageJson from "@/../package.json";
import { type IDownloadedSong } from "@/utils/download_renderer";
import {
  getAllPlayEvents,
  writePlayEvent,
  type PlayEvent,
} from "@/utils/playEvent";

const ipcRenderer = window.electron?.ipcRenderer;

// ───────────────────────────────
//  设置序列化（无 JSON 文件中间态）
// ───────────────────────────────

/**
 * 从设置实例中读取所有设置项（跳过 nosave 标记的项）
 */
function readAllSettings(settingInstance: any): Record<string, any> {
  const result: Record<string, any> = {};
  for (const section of Object.keys(settingGroup)) {
    result[section] = {};
    for (const key of Object.keys(settingGroup[section])) {
      const entry = settingGroup[section][key];
      if (entry && entry.nosave) continue;
      try {
        result[section][key] = settingInstance[section][key];
      } catch {
        // 跳过无法读取的项（如验证错误）
      }
    }
  }
  return result;
}

/**
 * 将设置对象写回设置实例（跳过验证失败的项）
 */
function writeAllSettings(
  settingInstance: any,
  settings: Record<string, any>,
): void {
  for (const [section, values] of Object.entries(settings)) {
    if (!values || typeof values !== "object") continue;
    for (const [key, value] of Object.entries(values as Record<string, any>)) {
      try {
        settingInstance[section][key] = value;
      } catch {
        // 跳过验证失败的项
      }
    }
  }
}

// ───────────────────────────────
//  导出 / 导入 入口
// ───────────────────────────────

/**
 * 导出用户数据
 * 收集设置、听歌数据、已下载歌曲信息，通过 IPC 送至主进程写入 .xcmdb 文件
 * @param options - 选择需要导出的数据项，默认全部导出
 */
export async function exportUserData(
  settingInstance: any,
  downloadedSongs: IDownloadedSong[],
  options?: {
    settings?: boolean;
    playHistory?: boolean;
    downloadedSongs?: boolean;
  },
): Promise<{ success: boolean; message?: string }> {
  if (!ipcRenderer) {
    console.error("Not running in Electron");
    return { success: false, message: "Not running in Electron" };
  }

  try {
    const opt = options ?? {};
    const wantSettings = opt.settings !== false;
    const wantPlayHistory = opt.playHistory !== false;
    const wantDownloaded = opt.downloadedSongs !== false;

    // 按需收集数据
    const safeData: Record<string, any> = {
      version: packageJson.version,
    };
    if (wantSettings) {
      safeData.settings = readAllSettings(settingInstance);
    }
    if (wantPlayHistory) {
      safeData.playHistory = await getAllPlayEvents();
    }
    if (wantDownloaded) {
      safeData.downloadedSongs = downloadedSongs;
    }

    // 深拷贝以确保 IPC 传输安全
    const cloned = JSON.parse(JSON.stringify(safeData));

    // IPC 送到主进程处理 SQLite 文件保存
    const result = await ipcRenderer.invoke("export-user-data", cloned);

    return {
      success: result?.success === true,
      message: result?.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Export user data failed:", message);
    return { success: false, message };
  }
}

export interface IImportData {
  settings?: Record<string, any>;
  playHistory?: PlayEvent[];
  downloadedSongs?: IDownloadedSong[];
}

/**
 * 打开 .xcmdb 文件并读取数据（只读不写）
 */
export async function importUserData(): Promise<{
  success: boolean;
  data?: IImportData;
  message?: string;
}> {
  if (!ipcRenderer) {
    return { success: false, message: "Not running in Electron" };
  }

  try {
    const result = await ipcRenderer.invoke("import-user-data");
    if (!result || !result.success) {
      return {
        success: false,
        message: result?.message || "unknown_error",
      };
    }
    return { success: true, data: result.data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Import user data failed:", msg);
    return { success: false, message: "parse_error" };
  }
}

/**
 * 将已读取的导入数据按选项写入各模块
 */
export async function writeImportedData(
  settingInstance: any,
  importDownloadedSongs: (songs: IDownloadedSong[]) => Promise<void> | void,
  data: IImportData,
  options?: {
    settings?: boolean;
    playHistory?: boolean;
    downloadedSongs?: boolean;
  },
): Promise<{ success: boolean; message: string }> {
  try {
    const opt = options ?? {};
    const wantSettings = opt.settings !== false;
    const wantPlayHistory = opt.playHistory !== false;
    const wantDownloaded = opt.downloadedSongs !== false;

    if (wantSettings && data.settings) {
      writeAllSettings(settingInstance, data.settings);
    }
    if (
      wantPlayHistory &&
      data.playHistory &&
      Array.isArray(data.playHistory)
    ) {
      // PlayEvent 有唯一 ID，直接写入，跳过已存在的
      for (const ev of data.playHistory) {
        await writePlayEvent(ev);
      }
    }
    if (
      wantDownloaded &&
      data.downloadedSongs &&
      Array.isArray(data.downloadedSongs)
    ) {
      await importDownloadedSongs(data.downloadedSongs);
    }
    return { success: true, message: "success" };
  } catch (error) {
    console.error("Write imported data failed:", error);
    return { success: false, message: "write_error" };
  }
}
