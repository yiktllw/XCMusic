import { ipcMain, BrowserWindow, dialog } from 'electron';
import { Download } from './download';

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
    console.log(process.memoryUsage());
});

// 监听关闭事件
ipcMain.on('close', () => {
    const win = getCurrentWindow();
    if (win) {
        win.hide();
    }
});

// 清除网络缓存
ipcMain.on('clear-cache', () => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
        win.webContents.session.clearCache().then(() => {
            console.log('Network cache cleared');
        }).catch(err => {
            console.error('Error clearing cache:', err);
        });
    });
});

// 监听渲染进程的请求，打开选择文件夹对话框
ipcMain.handle('select-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'] // 只允许选择文件夹
    });
    if (canceled) {
        return null;
    } else {
        return filePaths[0]; // 返回选中的文件夹路径
    }
});

ipcMain.on('download-song', async (event, songUrl, track, downloadDir) => {
    try {
        // 下载歌曲文件
        const filePath = await Download.song(songUrl, track, downloadDir);
        event.reply('download-song-reply', filePath, {
            filePath: filePath,
            track: track
        });
    } catch (err: any) {
        event.reply('download-song-reply', err.toString());
    }
});