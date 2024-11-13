/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * globalMsg.ts 为渲染进程中，发送消息到HomeView的工具
 * 主要有两个功能：
 * 1. 发送消息到HomeView
 * 2. 要求用户确认某些操作
 *---------------------------------------------------------------*/

import { Subscriber } from "./subscribe";

const events = [
  "create-playlist",
  "open-login-window",
  "close-login-window",
  "close-login-window-from-homeview",
  "open-custom-window",
  "close-custom-window",
  "open-close-window",
  "open-ctx-menu-playlist",
  "confirm",
  "close-playui",
  "refresh-sidebar",
];

export interface IConfirm {
  /** 显示在确认窗口的内容 */
  content: string;
  /** 是否需要翻译 */
  needTranslate: boolean;
  /** 确认后的回调函数 */
  callback: Function;
}

export class GlobalMsg {
  subscriber: Subscriber;
  constructor() {
    this.subscriber = new Subscriber(events);
  }
  post(msg: string, data?: any) {
    if (!events.includes(msg)) {
      console.error("msg not exist in allowed list:", msg);
      return;
    }
    this.subscriber.exec(msg, data);
  }
  confirm(args: IConfirm) {
    this.subscriber.exec("confirm", args);
  }
}
