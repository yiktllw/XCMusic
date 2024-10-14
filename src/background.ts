'use strict'

import { app, protocol, BrowserWindow, Tray, Menu, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import { startNeteaseMusicApi } from './electron/services';
import * as path from 'path';

protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512');
app.commandLine.appendSwitch('js-flags', '--max-new-space-size=256');
let win: BrowserWindow | null = null;
let tray: Tray | null = null;

async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1200,
        height: 750,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION === 'true',
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            webviewTag: true,
            backgroundThrottling: false, // 禁止后台时限制性能
        },
        frame: false,
        icon: path.join(__dirname, '../src/assets/icons/icon.png'),
    })
    win.menuBarVisible = false;

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS3_DEVTOOLS)
        } catch (e: any) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    let requests = [
        createWindow(),
        startNeteaseMusicApi(),
    ];
    await Promise.all(requests).catch((err) => {
        console.error(err);
    });

    // 监听缩放比例消息
    ipcMain.on('zoom', (event, zoomLevel) => {
        if (win) {
            win.webContents.setZoomFactor(zoomLevel);
        }
    });

    // 创建托盘
    if (process.env.NODE_ENV === 'development') {
        tray = new Tray(path.join(__dirname, '../src/assets/icons/icon.ico'));
    } else {
        tray = new Tray(path.join(__dirname, 'icons/icon.ico'));
    }
    // 菜单模板
    let _menu = [
        {
            label: '显示主窗口',
            id: 'show-window',
            click: () => {
                win?.show();
            },
            enabled: !win?.show,
        },
        {
            label: '退出',
            click: () => {
                app.quit();
            }
        }
    ];
    let menu = Menu.buildFromTemplate(_menu);
    tray.setContextMenu(menu);
    tray.setToolTip('XCMusic');

    // 处理窗口隐藏
    win?.on('hide', () => {
        const showWindowMenuItem = menu.getMenuItemById('show-window');
        if (showWindowMenuItem) {
            showWindowMenuItem.enabled = true;
        }
        tray?.setContextMenu(menu);
    });

    // 处理窗口显示
    win?.on('show', () => {
        if (menu?.getMenuItemById('show-window')) {
            const showWindowMenuItem = menu.getMenuItemById('show-window');
            if (showWindowMenuItem) {
                showWindowMenuItem.enabled = false;
            }
        }
        tray?.setContextMenu(menu);
    });

    // 处理托盘点击事件
    tray.on('double-click', () => {
        if (win?.isVisible()) {
            win.hide();
        } else {
            win?.show();
        }
    });
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
import './ncm/titlebarEvent';

