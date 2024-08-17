import { ipcMain, BrowserWindow } from 'electron';

// 获取当前窗口
const getCurrentWindow = () => BrowserWindow.getFocusedWindow();

// 监听最小化事件
ipcMain.on('minimize', () => {
    const win = getCurrentWindow();
    if (win) {
        win.minimize();
    }
});

// 监听最大化事件
ipcMain.on('maximize', () => {
    const win = getCurrentWindow();
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    }
});

// 监听关闭事件
ipcMain.on('close', () => {
    const win = getCurrentWindow();
    if (win) {
        win.close();
    }
});