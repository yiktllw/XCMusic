/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * background.ts 为 Electron 主进程的入口文件
 * 已在该文件中实现的功能:
 * 1. 创建窗口
 * 2. 创建托盘
 * 3. 监听缩放比例消息
 * 4. 监听全屏和退出全屏
 * 5. 处理窗口隐藏和显示
 * 6. 处理托盘点击事件
 * 7. 监听退出事件
 * 8. 监听第二个实例
 * 9. 存储窗口的大小和位置
 * 10. 禁用 GPU 加速
 *---------------------------------------------------------------*/

"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  Tray,
  nativeImage,
  Menu,
  ipcMain,
  screen,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const isDevelopment = process.env.NODE_ENV !== "production";
import { startNeteaseMusicApi } from "@/electron/services";
import * as path from "path";
import * as fs from "fs";
import Store from "electron-store";

// 设置磁盘缓存的最大大小
app.commandLine.appendSwitch("disk-cache-size", `${100 * 1024 * 1024}`);
// 设置媒体缓存的最大大小
app.commandLine.appendSwitch("media-cache-size", `${30 * 1024 * 1024}`);

interface WindowState {
  width: number;
  height: number;
}

interface DesktopLyricState {
  opened: boolean;
  locked: boolean;
}

interface AppStore {
  windowState: WindowState;
  lyricWindowState: {
    x: number;
    y: number;
    width: number;
    height: number;
    displayId?: number;
    scaleFactor?: number;
  };
  desktopLyricState: DesktopLyricState;
  disableGpu: boolean;
}

interface ApiRuntime {
  host: string;
  port: number;
  baseURL: string;
  source: "started" | "reused" | "fallback";
}

const store = new Store<AppStore>();
const defaultDesktopLyricState: DesktopLyricState = {
  opened: false,
  locked: false,
};
const storedDesktopLyricState = store.get(
  "desktopLyricState",
  defaultDesktopLyricState,
) as DesktopLyricState;
let desktopLyricState: DesktopLyricState = {
  opened:
    storedDesktopLyricState && storedDesktopLyricState.opened === true
      ? true
      : false,
  locked:
    storedDesktopLyricState && storedDesktopLyricState.locked === true
      ? true
      : false,
};
// 从 store 中获取窗口的大小和位置
const windowState = store.get("windowState", {
  width: 1177,
  height: 777,
});

// 是否禁用 GPU 加速
const disableGpu = store.get("disableGpu", false);
if (disableGpu) {
  app.disableHardwareAcceleration();
}
ipcMain.on("disable-gpu", () => {
  store.set("disableGpu", true);
});
ipcMain.on("enable-gpu", () => {
  store.set("disableGpu", false);
});

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);
// if (process.env.NODE_ENV === "development") {
//   app.commandLine.appendSwitch("remote-debugging-port", "9222");
//   app.commandLine.appendSwitch("inspect", "9229");
// }
// app.commandLine.appendSwitch("--inspect=9229");

let win: BrowserWindow | null = null;
let playerWin: BrowserWindow | null = null;
let lyricWin: BrowserWindow | null = null;
let tray: Tray | null = null;
let isAppQuitting = false;
let hasRestoredDesktopLyric = false;
const defaultApiRuntime: ApiRuntime = {
  host: "127.0.0.1",
  port: 43210,
  baseURL: "http://127.0.0.1:43210",
  source: "fallback",
};
let apiRuntime: ApiRuntime = { ...defaultApiRuntime };

const DEFAULT_LYRIC_WIDTH = 1024;
const DEFAULT_LYRIC_HEIGHT = 200;
const MIN_LYRIC_WIDTH = 320;
const MIN_LYRIC_HEIGHT = 120;

const clamp = (value: number, min: number, max: number) => {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
};

const centerRectInArea = (
  area: { x: number; y: number; width: number; height: number },
  width: number,
  height: number,
) => {
  return {
    x: Math.round(area.x + (area.width - width) / 2),
    y: Math.round(area.y + (area.height - height) / 2),
    width,
    height,
  };
};

const rectsIntersect = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

const resolveLyricWindowBounds = (
  savedBounds?: AppStore["lyricWindowState"],
) => {
  const displays = screen.getAllDisplays();
  const primaryArea = screen.getPrimaryDisplay().workArea;
  const savedWidth =
    savedBounds && typeof savedBounds.width === "number"
      ? savedBounds.width
      : DEFAULT_LYRIC_WIDTH;
  const savedHeight =
    savedBounds && typeof savedBounds.height === "number"
      ? savedBounds.height
      : DEFAULT_LYRIC_HEIGHT;

  if (!savedBounds) {
    const width = clamp(savedWidth, MIN_LYRIC_WIDTH, primaryArea.width);
    const height = clamp(savedHeight, MIN_LYRIC_HEIGHT, primaryArea.height);
    return centerRectInArea(primaryArea, width, height);
  }

  const requestedRect = {
    x: savedBounds.x,
    y: savedBounds.y,
    width: Math.max(savedWidth, MIN_LYRIC_WIDTH),
    height: Math.max(savedHeight, MIN_LYRIC_HEIGHT),
  };

  const allAreas = displays.map((display) => display.workArea);
  const onAnyDisplay = allAreas.some((area) =>
    rectsIntersect(requestedRect, area),
  );

  if (onAnyDisplay) {
    return requestedRect;
  }

  const matchDisplayById =
    savedBounds && typeof savedBounds.displayId === "number"
      ? displays.find((display) => display.id === savedBounds.displayId)
      : undefined;
  const rectCenter = {
    x: Math.round(requestedRect.x + requestedRect.width / 2),
    y: Math.round(requestedRect.y + requestedRect.height / 2),
  };
  const nearestArea = screen.getDisplayNearestPoint(rectCenter).workArea;

  const targetArea = matchDisplayById
    ? matchDisplayById.workArea
    : nearestArea || primaryArea;
  const visibleWidth = Math.min(requestedRect.width, targetArea.width);
  const visibleHeight = Math.min(requestedRect.height, targetArea.height);
  const x = clamp(
    requestedRect.x,
    targetArea.x,
    targetArea.x + targetArea.width - visibleWidth,
  );
  const y = clamp(
    requestedRect.y,
    targetArea.y,
    targetArea.y + targetArea.height - visibleHeight,
  );

  return {
    x,
    y,
    width: requestedRect.width,
    height: requestedRect.height,
  };
};

const getDesktopLyricStateSnapshot = (): DesktopLyricState => {
  return {
    opened: desktopLyricState.opened,
    locked: desktopLyricState.locked,
  };
};

const persistDesktopLyricState = () => {
  store.set("desktopLyricState", getDesktopLyricStateSnapshot());
};

const broadcastDesktopLyricState = () => {
  const snapshot = getDesktopLyricStateSnapshot();
  if (win) {
    win.webContents.send("desktop-lyric-state", snapshot);
  }
  if (lyricWin) {
    lyricWin.webContents.send("desktop-lyric-state", snapshot);
  }
};

const setDesktopLyricState = (opened: boolean, locked: boolean) => {
  desktopLyricState.opened = opened;
  desktopLyricState.locked = opened ? locked : false;
  persistDesktopLyricState();
  broadcastDesktopLyricState();
};

const applyLyricWindowLockState = (locked: boolean, ignoreMouse: boolean) => {
  if (!lyricWin) return;
  lyricWin.setResizable(!locked);
  if (ignoreMouse) {
    lyricWin.setIgnoreMouseEvents(true, { forward: true });
  } else {
    lyricWin.setIgnoreMouseEvents(false);
  }
};

const resolvePreloadScriptPath = () => {
  const candidates = [
    path.join(__dirname, "preload.js"),
    path.join(app.getAppPath(), "preload.js"),
    path.join(process.cwd(), "preload.js"),
    path.join(process.cwd(), "dist_electron", "preload.js"),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (found) {
    return found;
  }

  return path.join(__dirname, "preload.js");
};

const persistLyricWindowBounds = () => {
  if (!lyricWin || lyricWin.isDestroyed()) {
    return;
  }
  const bounds = lyricWin.getBounds();
  const displayId = screen.getDisplayNearestPoint({
    x: Math.round(bounds.x + bounds.width / 2),
    y: Math.round(bounds.y + bounds.height / 2),
  }).id;
  store.set("lyricWindowState", {
    ...bounds,
    displayId,
  });
};

const applyLyricWindowBounds = (target: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  if (!lyricWin || lyricWin.isDestroyed()) {
    return;
  }
  lyricWin.setBounds(target, false);
};

const syncMainWindowRuntimeState = () => {
  if (win && !win.isDestroyed()) {
    win.webContents.send("player-ready");
    broadcastDesktopLyricState();
  }

  if (playerWin && !playerWin.isDestroyed()) {
    playerWin.webContents.send("player-command", "getState");
  }
};

// 检查是否已经有实例在运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果已经有实例在运行，则退出新的实例
  app.quit();
}

async function createLyricWindow(options?: { locked?: boolean }) {
  const nextLocked =
    options && typeof options.locked === "boolean"
      ? options.locked
      : desktopLyricState.locked;

  if (lyricWin) {
    setDesktopLyricState(true, nextLocked);
    applyLyricWindowLockState(nextLocked, nextLocked);
    return;
  }
  const savedBounds = store.get("lyricWindowState") as
    | AppStore["lyricWindowState"]
    | undefined;
  const lyricBounds = resolveLyricWindowBounds(savedBounds);

  lyricWin = new BrowserWindow({
    width: lyricBounds.width,
    height: lyricBounds.height,
    x: lyricBounds.x,
    y: lyricBounds.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: resolvePreloadScriptPath(),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false,
    },
  });

  applyLyricWindowBounds(lyricBounds);

  // Migrate old lyric window state that has no displayId.
  if (!savedBounds || typeof savedBounds.displayId !== "number") {
    persistLyricWindowBounds();
  }

  setDesktopLyricState(true, nextLocked);
  applyLyricWindowLockState(nextLocked, nextLocked);

  lyricWin.webContents.on("did-finish-load", () => {
    applyLyricWindowBounds(lyricBounds);
    broadcastDesktopLyricState();
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await lyricWin.loadURL(
      process.env.WEBPACK_DEV_SERVER_URL + "#/desktop-lyrics",
    );
  } else {
    lyricWin.loadURL("app://./index.html#/desktop-lyrics");
  }

  lyricWin.on("move", () => {
    persistLyricWindowBounds();
  });

  lyricWin.on("resize", () => {
    persistLyricWindowBounds();
  });

  lyricWin.on("close", () => {
    persistLyricWindowBounds();
  });

  lyricWin.on("closed", () => {
    lyricWin = null;
    if (!isAppQuitting) {
      setDesktopLyricState(false, false);
    }
  });
}

async function createPlayerWindow() {
  playerWin = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: resolvePreloadScriptPath(),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await playerWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL + "player.html");
  } else {
    playerWin.loadURL("app://./player.html");
  }
}

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    // transparent: true,
    // vibrancy: 'light',
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: resolvePreloadScriptPath(),
      nodeIntegration: true,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      // webviewTag: true,
      webSecurity: false, // 允许加载本地资源
      backgroundThrottling: false, // 禁止后台时限制性能
    },
    frame: false,
    icon: path.join(__dirname, "../src/assets/icons/icon.png"),
  });

  win.on("close", () => {
    if (!win) return;
    const bounds = win.getBounds();
    store.set("windowState", bounds);
  });
  win.on("hide", () => {
    if (!win) return;
    const bounds = win.getBounds();
    store.set("windowState", bounds);
  });
  win.menuBarVisible = false;

  win.webContents.on("did-finish-load", () => {
    syncMainWindowRuntimeState();
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("before-quit", () => {
  isAppQuitting = true;
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // IPC Forwarding
  ipcMain.on("player-command", (event, payload) => {
    const { command, args } = payload || {};
    if (playerWin && command) {
      playerWin.webContents.send("player-command", command, args);
    }
  });

  ipcMain.on("player-event", (event, payload) => {
    if (win) {
      win.webContents.send("player-event", payload);
    }
    if (lyricWin) {
      lyricWin.webContents.send("player-event", payload);
    }
  });

  ipcMain.on("open-desktop-lyric", (event, payload) => {
    let locked = false;
    if (typeof payload === "object" && payload !== null) {
      locked = Boolean((payload as { locked?: boolean }).locked);
    }
    createLyricWindow({ locked });
  });

  ipcMain.on("toggle-desktop-lyric", () => {
    if (lyricWin) {
      lyricWin.close();
    } else {
      createLyricWindow({ locked: false });
    }
  });

  ipcMain.on("close-desktop-lyric", () => {
    if (lyricWin) {
      lyricWin.close();
    }
  });

  ipcMain.on("reload-main-window", () => {
    if (!win || win.isDestroyed()) return;
    win.webContents.reloadIgnoringCache();
  });

  ipcMain.on("lock-desktop-lyric", (event, payload) => {
    if (!lyricWin) {
      setDesktopLyricState(false, false);
      return;
    }

    let locked = false;
    let ignoreMouse = false;

    if (typeof payload === "object" && payload !== null) {
      locked = Boolean((payload as { locked?: boolean }).locked);
      ignoreMouse = Boolean((payload as { ignoreMouse?: boolean }).ignoreMouse);
    } else {
      // Backward compatibility: boolean payload means locked + ignore mouse.
      locked = Boolean(payload);
      ignoreMouse = Boolean(payload);
    }

    setDesktopLyricState(true, locked);
    applyLyricWindowLockState(locked, ignoreMouse);
  });

  ipcMain.handle("get-desktop-lyric-state", () => {
    if (hasRestoredDesktopLyric && !lyricWin && desktopLyricState.opened) {
      desktopLyricState.opened = false;
      desktopLyricState.locked = false;
      persistDesktopLyricState();
    }
    return getDesktopLyricStateSnapshot();
  });

  ipcMain.handle("get-api-runtime", () => {
    return { ...apiRuntime };
  });

  ipcMain.on("player-spectrum", (event, data) => {
    if (win) {
      win.webContents.send("player-spectrum", data);
    }
  });

  ipcMain.on("player-error", (event, error) => {
    if (win) {
      win.webContents.send("player-error", error);
    }
  });

  ipcMain.on("download-delete", (event, id) => {
    if (win) {
      win.webContents.send("download-delete", id);
    }
  });

  ipcMain.on("player-ready", () => {
    if (win) {
      win.webContents.send("player-ready");
    }
  });

  // Redirect player console to main process in dev
  if (isDevelopment) {
    ipcMain.on("player-console-log", (event, args) => {
      console.log("[Player Window]:", ...args);
    });
    ipcMain.on("lyric-console-log", (event, args) => {
      console.log("[Lyric Window]:", ...args);
    });
  }

  // 监听缩放比例消息
  ipcMain.on("zoom", (event, zoomLevel) => {
    if (win) {
      win.webContents.setZoomFactor(zoomLevel);
    }
  });

  try {
    const runtime = await startNeteaseMusicApi();
    if (
      runtime &&
      typeof runtime.baseURL === "string" &&
      typeof runtime.port === "number"
    ) {
      apiRuntime = {
        host:
          typeof runtime.host === "string" && runtime.host.length > 0
            ? runtime.host
            : defaultApiRuntime.host,
        port: runtime.port,
        baseURL: runtime.baseURL,
        source: runtime.source === "reused" ? "reused" : "started",
      };
    }
  } catch (err) {
    apiRuntime = { ...defaultApiRuntime, source: "fallback" };
    console.error("Failed to start NCM API, fallback to default endpoint", err);
  }

  let requests = [createWindow(), createPlayerWindow()];
  await Promise.all(requests).catch((err) => {
    console.error(err);
  });

  syncMainWindowRuntimeState();

  if (desktopLyricState.opened) {
    try {
      await createLyricWindow({ locked: desktopLyricState.locked });
    } catch (error) {
      console.error("Failed to restore desktop lyric window:", error);
      setDesktopLyricState(false, false);
    }
  }
  hasRestoredDesktopLyric = true;

  if (win) {
    // 监听全屏
    win.on("enter-full-screen", () => {
      if (!win) return;
      // 获取窗口的当前位置
      const windowBounds = win.getBounds();
      // 获取窗口所在的显示器
      const display = screen.getDisplayNearestPoint({
        x: windowBounds.x,
        y: windowBounds.y,
      });
      const { width, height } = display.workAreaSize; // 也可以用 display.size 获取整个显示器的尺寸

      win.webContents.send("fullscreen-window-size", { width, height });
    });

    // 监听退出全屏
    win.on("leave-full-screen", () => {
      if (!win) return;
      win.webContents.send("leave-fullscreen");
    });
  }

  // 不同环境下的图标路径
  const trayIcons = {
    win32: "icons/icon.ico",
    win32_dev: "../src/assets/icons/icon.ico",
    /** 暂无法使用 */
    darwin: "icons/icon.icns",
    /** 暂无法使用 */
    darwin_dev: "../src/assets/icons/icon.svg",
    /** 待测试 */
    linux: "icons/icon.svg",
    /** 待测试 */
    linux_dev: "../src/assets/icons/icon.svg",
  };

  // 获取当前环境的图标路径
  let is_dev: "_dev" | "" =
    process.env.NODE_ENV === "development" ? "_dev" : "";
  const icon_env: keyof typeof trayIcons = `${process.platform as "win32" | "darwin" | "linux"}${is_dev}`;

  // 从获取的图标路径创建图片
  const img = nativeImage.createFromPath(
    path.join(__dirname, trayIcons[icon_env]),
  );
  // 从图片创建托盘
  if (!img.isEmpty()) tray = new Tray(img);

  // 菜单模板
  let _menu = [
    {
      label: "显示主窗口",
      id: "show-window",
      click: () => {
        if (win) win.show();
      },
      enabled: win ? !win.show : true,
    },
    {
      label: "打开桌面歌词",
      id: "open-desktop-lyric",
      click: () => {
        createLyricWindow({ locked: false });
      },
    },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ];
  let menu = Menu.buildFromTemplate(_menu);
  if (tray) {
    tray.setContextMenu(menu);
    tray.setToolTip("XCMusic");
  }

  if (win) {
    // 处理窗口隐藏
    win.on("hide", () => {
      if (!menu) return;
      const showWindowMenuItem = menu.getMenuItemById("show-window");
      if (showWindowMenuItem) {
        showWindowMenuItem.enabled = true;
      }
      if (tray) tray.setContextMenu(menu);
    });

    // 处理窗口显示
    win.on("show", () => {
      if (menu && menu.getMenuItemById("show-window")) {
        const showWindowMenuItem = menu.getMenuItemById("show-window");
        if (showWindowMenuItem) {
          showWindowMenuItem.enabled = false;
        }
      }
      if (tray) tray.setContextMenu(menu);
    });
  }

  // 处理托盘点击事件
  if (tray)
    tray.on("double-click", () => {
      if (!win) return;
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
      }
    });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

/**
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * 此处导入所有与ipcMain相关的事件
 */

import "@/utils/rendererEvents";
