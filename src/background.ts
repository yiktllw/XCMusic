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
 *---------------------------------------------------------------*/

"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  screen,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";
import { startNeteaseMusicApi } from "./electron/services";
import * as path from "path";
import Store from "electron-store";

interface WindowState {
  width: number;
  height: number;
}

const store = new Store<WindowState>();
// 从 store 中获取窗口的大小和位置
const windowState: WindowState = store.get("windowState", {
  width: 1200,
  height: 750,
});

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=512");
app.commandLine.appendSwitch("js-flags", "--max-new-space-size=256");
let win: BrowserWindow | null = null;
let tray: Tray | null = null;

// 检查是否已经有实例在运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果已经有实例在运行，则退出新的实例
  app.quit();
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
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION === "true",
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webviewTag: true,
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e: any) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  let requests = [createWindow(), startNeteaseMusicApi()];
  await Promise.all(requests).catch((err) => {
    console.error(err);
  });

  // 监听缩放比例消息
  ipcMain.on("zoom", (event, zoomLevel) => {
    if (win) {
      win.webContents.setZoomFactor(zoomLevel);
    }
  });

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

    // 处理窗口隐藏
    win.on("hide", () => {
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

  // 创建托盘
  if (process.env.NODE_ENV === "development") {
    tray = new Tray(path.join(__dirname, "../src/assets/icons/icon.ico"));
  } else {
    tray = new Tray(path.join(__dirname, "icons/icon.ico"));
  }
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
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ];
  let menu = Menu.buildFromTemplate(_menu);
  tray.setContextMenu(menu);
  tray.setToolTip("XCMusic");

  // 处理托盘点击事件
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

import "./utils/rendererEvents";
