/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * HistoryEngine.ts — 播放历史管理
 *---------------------------------------------------------------*/

import { PlayerEvents } from "@/dual/player";
import { type ITrack } from "@/utils/tracks";
import type { Subscriber } from "@/utils/subscribe";
import type { PlayerEventCallbacks } from "./types";

export class HistoryEngine {
  _history: ITrack[] = [];
  _historyIndex: number = 0;
  private subscriber: Subscriber<PlayerEventCallbacks>;

  constructor(subscriber: Subscriber<PlayerEventCallbacks>) {
    this.subscriber = subscriber;
  }

  appendToHistory(track: ITrack) {
    this._history.push(track);
    this._historyIndex = this._history.length - 1;
    this.subscriber.exec(PlayerEvents.history);
  }

  insertToHistory(track: ITrack) {
    this._history.splice(0, 0, track);
    this._historyIndex = 0;
    this.subscriber.exec(PlayerEvents.history);
  }

  clearHistory() {
    this._history = [];
    this._historyIndex = 0;
    this.subscriber.exec(PlayerEvents.history);
  }
}
