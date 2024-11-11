/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 *  openedPlaylist.ts 用于存储侧边栏打开的歌单
*---------------------------------------------------------------*/

import { Subscriber } from "./subscribe";

export class OpenedPlaylist {
    _id: number;
    subscriber: Subscriber;
    constructor(){
        this._id = 0;
        this.subscriber = new Subscriber(['id']);
    }
    get id(){
        return this._id;
    }
    set id(id){
        this._id = id;
        this.subscriber.exec('id');
    }
}