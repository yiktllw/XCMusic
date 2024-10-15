import { Setting } from "./utils/setting";
import fs from "fs";
import path from "path";

interface electron {
    ipcRenderer: {
        send(channel: string, data?: any): void;
        on(channel: string, listener: (event: any, ...args: any[]) => void): void;
        once(channel: string, listener: (event: any, ...args: any[]) => void): void;
    };
    isElectron: boolean;
}

interface api {
    fs: fs;
    path: path;
    pathJoin: (...args: string[]) => string;
    readFile: (path: string, options?: { encoding?: null; flag?: string; }) => Buffer;
    writeFile: (path: string, data: any, options?: { encoding?: string; flag?: string; }) => void;
    existsSync: (path: string) => boolean;
    makeDirSync: (path: string) => void;
    homeDir: () => string;
}

interface savedPosition {
    top: number | string;
    left: number | string;
}

interface savedPositions {
    [key: string]: savedPosition;
}

declare global {
    interface Window {
        setting: Setting;
        Setting: typeof Setting;
        electron: electron;
        api: api;
        savedPositions: savedPositions;
    }
}
