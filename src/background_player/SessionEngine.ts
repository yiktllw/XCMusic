/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * SessionEngine.ts — 播放会话追踪（计时、写入播放事件）
 *---------------------------------------------------------------*/

import { type ITrack } from "@/utils/tracks";
import {
  writePlayEvent,
  cacheTrackInfo,
  getHostname,
  type PlayEvent,
} from "@/utils/playEvent";

export class SessionEngine {
  _sessionTrackId: number | string | null = null;
  _sessionTrackSnapshot: ITrack | null = null;
  _sessionStartAt: number = 0;
  _sessionAccumulatedMs: number = 0;
  _sessionLastTickAt: number = 0;
  _sessionCounted: boolean = false;
  _sessionDurationMs: number = 0;

  startPlaybackSession(track: ITrack) {
    this._sessionTrackId = track.id;
    this._sessionTrackSnapshot = { ...track };
    this._sessionStartAt = Date.now();
    this._sessionAccumulatedMs = 0;
    this._sessionLastTickAt = 0;
    this._sessionCounted = false;
    const durationMs = Math.floor((track.dt ?? 0) as number);
    this._sessionDurationMs = Number.isFinite(durationMs) ? durationMs : 0;
  }

  tickPlaybackSession(
    currentTrack: ITrack | null,
    playState: "play" | "pause",
    audioDuration: number,
  ) {
    if (!this._sessionTrackId) return;
    if (!currentTrack || currentTrack.id !== this._sessionTrackId) return;
    if (playState !== "play") return;

    const now = Date.now();
    if (this._sessionLastTickAt > 0) {
      const delta = now - this._sessionLastTickAt;
      if (delta > 0 && delta < 3000) {
        this._sessionAccumulatedMs += delta;
      }
    }
    this._sessionLastTickAt = now;

    const audioDurationMs = Number.isFinite(audioDuration)
      ? Math.floor(audioDuration * 1000)
      : 0;
    if (audioDurationMs > 0) {
      this._sessionDurationMs = audioDurationMs;
    }

    if (!this._sessionCounted) {
      const eightyPercentMs =
        Math.floor((this._sessionDurationMs / 1000) * 0.8) * 1000;
      if (
        this._sessionAccumulatedMs >= 60 * 1000 ||
        (eightyPercentMs > 0 && this._sessionAccumulatedMs >= eightyPercentMs)
      ) {
        this._sessionCounted = true;
      }
    }
  }

  async flushPlaybackSession() {
    if (!this._sessionTrackId || !this._sessionTrackSnapshot) return;

    const trackId = this._sessionTrackId;
    const trackSnapshot = this._sessionTrackSnapshot;
    const sessionStartAt = this._sessionStartAt;
    const sessionAccumulatedMs = Math.max(
      0,
      Math.floor(this._sessionAccumulatedMs),
    );
    const shouldCount = this._sessionCounted;

    if (sessionAccumulatedMs <= 0 && !shouldCount) {
      this.resetPlaybackSession();
      return;
    }

    try {
      const now = Date.now();
      if (shouldCount) {
        const hostname = getHostname();
        const event: PlayEvent = {
          id: `${hostname}-${sessionStartAt}`,
          trackId: trackId as number,
          startedAt: sessionStartAt,
          endedAt: now,
          durationMs: sessionAccumulatedMs,
        };
        await writePlayEvent(event);

        if (trackSnapshot) {
          const ar = (trackSnapshot.ar ?? []).map((a: any) => ({
            id: a.id,
            name: a.name,
          }));
          const al = trackSnapshot.al
            ? {
                id: trackSnapshot.al.id,
                name: trackSnapshot.al.name,
                picUrl: trackSnapshot.al.picUrl,
              }
            : { id: 0, name: "", picUrl: "" };
          await cacheTrackInfo({
            id: trackId as number,
            name: trackSnapshot.name ?? "未知歌曲",
            ar,
            al,
            dt: trackSnapshot.dt ?? 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to flush playback session:", error);
    }

    this.resetPlaybackSession();
  }

  resetPlaybackSession() {
    this._sessionTrackId = null;
    this._sessionTrackSnapshot = null;
    this._sessionStartAt = 0;
    this._sessionAccumulatedMs = 0;
    this._sessionLastTickAt = 0;
    this._sessionCounted = false;
    this._sessionDurationMs = 0;
  }
}
