import { Setting } from "./utils/setting";
import { shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import https from "https";

interface electron {
    ipcRenderer: {
        send(channel: string, ...data?: any): void;
        on(channel: string, listener: (event: any, ...args: any[]) => void): void;
        once(channel: string, listener: (event: any, ...args: any[]) => void): void;
        invoke(channel: string, data?: any): Promise<any>;
    };
    isElectron: boolean;
    shell: shell;
}

interface api {
    fs: typeof fs;
    os: typeof os;
    path: typeof path;
    NodeID3: typeof NodeID3;
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
        test: any;
    }
}
