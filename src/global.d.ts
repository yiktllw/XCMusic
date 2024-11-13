/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * global.d.ts 为全局变量的声明文件
 * 用于声明全局变量，以便在其他文件中使用
 * 已声明的全局变量有:
 * Window:
 *  -setting: Setting;
 *  -Setting: typeof Setting;
 *  -electron: electron;
 *  -api: api;
 *  -savedPositions: savedPositions;
 *  -test: any;
 *---------------------------------------------------------------*/

import { Setting } from "./utils/setting";
import { shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import crypto from "crypto";
import https from "https";

interface electron {
  ipcRenderer: {
    send(channel: string, ...data: any): void;
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
  crypto: (str: string) => string;
  NodeID3: typeof NodeID3;
  pathJoin: (...args: string[]) => string;
  readFile: (
    path: string,
    options?: { encoding?: null; flag?: string },
  ) => Buffer;
  writeFile: (
    path: string,
    data: any,
    options?: { encoding?: string; flag?: string },
  ) => void;
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
