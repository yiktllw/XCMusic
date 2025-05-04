/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * globalMsg.ts 为渲染进程中，发送消息到HomeView的工具
 * 主要有两个功能：
 * 1. 发送消息到HomeView
 * 2. 要求用户确认某些操作
 *---------------------------------------------------------------*/

import { type IPlaylistCtxData } from "@/dual/YContextMenuItemC";
import { Subscriber } from "@/utils/subscribe";
import { GlobalMsgEvents } from "@/dual/globalMsg";
import { type IEscapedFonts } from "./fonts";

export interface IConfirm {
  /** 显示在确认窗口的内容 */
  content: string;
  /** 是否需要翻译 */
  needTranslate: boolean;
  /** 确认后的回调函数 */
  callback: Function;
}

type GlobalMsgFuncs = {
  [GlobalMsgEvents.CreatePlaylist]: () => void;
  [GlobalMsgEvents.OpenLoginWindow]: (base64Img: string) => void;
  [GlobalMsgEvents.CloseLoginWindow]: () => void;
  [GlobalMsgEvents.CloseLoginWindowFromHomeView]: () => void;
  [GlobalMsgEvents.OpenCustomWindow]: () => void;
  [GlobalMsgEvents.CloseCustomWindow]: () => void;
  [GlobalMsgEvents.OpenCloseWindow]: () => void;
  [GlobalMsgEvents.OpenCtxMenuPlaylist]: (data: IPlaylistCtxData) => void;
  [GlobalMsgEvents.OpenFontSelectWindow]: (
    title: string,
    default_selected_fonts: IEscapedFonts,
    callbackFn: (selected_fonts: IEscapedFonts) => void,
  ) => void;
  [GlobalMsgEvents.Confirm]: (args: IConfirm) => void;
  [GlobalMsgEvents.ClosePlayUI]: () => void;
  [GlobalMsgEvents.RefreshSidebar]: () => void;
  [GlobalMsgEvents.RefreshPlaylist]: (playlistId: number) => void;
};

export class GlobalMsg {
  subscriber = new Subscriber<GlobalMsgFuncs>(GlobalMsgEvents);
  constructor() {}
  post<K extends keyof GlobalMsgFuncs>(
    msg: K,
    ...args: Parameters<GlobalMsgFuncs[K]>
  ) {
    if (!(msg in GlobalMsgEvents)) {
      console.error("msg not exist in allowed list:", msg);
      return;
    }
    this.subscriber.exec(msg, ...args);
  }
  confirm(args: IConfirm) {
    this.subscriber.exec(GlobalMsgEvents.Confirm, args);
  }
}
