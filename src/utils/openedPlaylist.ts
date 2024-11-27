/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 *  openedPlaylist.ts 用于存储侧边栏打开的歌单
 *---------------------------------------------------------------*/

import { Subscriber } from "@/utils/subscribe";

export enum OpenedPlaylistEvents {
  id = "id",
}
  
type OpenedPlaylistEventCallbacks = {
  [OpenedPlaylistEvents.id]: () => void;
}

export class OpenedPlaylist {
  _id: number;
  subscriber = new Subscriber<OpenedPlaylistEventCallbacks>(OpenedPlaylistEvents);
  constructor() {
    this._id = 0;
  }
  get id() {
    return this._id;
  }
  set id(id) {
    this._id = id;
    this.subscriber.exec(OpenedPlaylistEvents.id);
  }
}
