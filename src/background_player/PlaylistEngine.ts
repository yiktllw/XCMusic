/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * PlaylistEngine.ts — 播放列表管理
 *---------------------------------------------------------------*/

import { PlayerEvents } from "@/dual/player";
import { type ITrack } from "@/utils/tracks";
import type { Subscriber } from "@/utils/subscribe";
import type { PlayerEventCallbacks } from "./types";

export class PlaylistEngine {
  _playlist: ITrack[] = [];
  _playlistId: number | string = 0;
  _current: number = 0;
  private subscriber: Subscriber<PlayerEventCallbacks>;

  constructor(subscriber: Subscriber<PlayerEventCallbacks>) {
    this.subscriber = subscriber;
  }

  get playlist(): ITrack[] {
    return this._playlist;
  }
  set playlist(value: ITrack[]) {
    this._playlist = value;
  }

  get playlistCount(): number {
    return this._playlist.length;
  }

  get currentTrack(): ITrack | undefined {
    return this._playlist[this._current];
  }

  get currentTrackName(): string | undefined {
    return this.currentTrack?.name;
  }

  get currentTrackArtists(): ITrack["ar"] | undefined {
    return this.currentTrack?.ar;
  }

  currentTrackName_at(index: number): string | undefined {
    return this._playlist[index]?.name;
  }

  currentTrackArtists_at(index: number): ITrack["ar"] | undefined {
    return this._playlist[index]?.ar;
  }

  findIndexById(id: number | string): number {
    return this._playlist.findIndex((t) => t.id === id);
  }

  addTrack(track: ITrack) {
    this._playlist.push(track);
    this.subscriber.exec(PlayerEvents.playlist);
  }

  deleteTrack(index: number) {
    this._playlist.splice(index, 1);
    this.subscriber.exec(PlayerEvents.playlist);
  }

  clearPlaylist() {
    this._current = 0;
    this._playlist = [];
    this.subscriber.exec(PlayerEvents.playlist);
  }

  nextPlay(track: ITrack) {
    const next = this._current + 1;
    this._playlist.splice(next, 0, track);
    this.subscriber.exec(PlayerEvents.playlist);
  }

  playAll(tracks: ITrack[]) {
    this._playlist = tracks;
    this._current = 0;
    this.subscriber.exec(PlayerEvents.playlist);
  }

  addPlaylist(tracks: ITrack[]) {
    for (const track of tracks) {
      this._playlist.push(track);
    }
    this.subscriber.exec(PlayerEvents.playlist);
  }

  sortByOriginalIndex(): ITrack | undefined {
    const ot = this._playlist[this._current];
    this._playlist = this._playlist.sort(
      (a, b) => a.originalIndex - b.originalIndex,
    );
    if (ot) this._current = this.findIndexById(ot.id);
    return ot;
  }

  shuffleRandom(): ITrack | undefined {
    const ot = this._playlist[this._current];
    this._playlist = this._playlist.sort(() => Math.random() * 2 - 1);
    if (ot) this._current = this.findIndexById(ot.id);
    return ot;
  }
}
