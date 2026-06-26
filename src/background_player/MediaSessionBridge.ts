/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * MediaSessionBridge.ts — 媒体会话 (Media Session API) 管理
 *---------------------------------------------------------------*/

import { PlayerEvents } from "@/dual/player";
import type { ITrack } from "@/utils/tracks";
import type { Subscriber } from "@/utils/subscribe";
import type { PlayerEventCallbacks } from "./types";

export class MediaSessionBridge {
  private _mediaSessionInit: boolean = false;

  init(
    subscriber: Subscriber<PlayerEventCallbacks>,
    getCurrentTrack: () => ITrack | null,
    getCurrentTrackName: () => string | undefined,
    getCurrentTrackArtists: () => ITrack["ar"] | undefined,
    getPlayState: () => "play" | "pause",
    playStateSetter: (v: "play" | "pause") => void,
    previousFnArg: () => void,
    nextFnArg: () => void,
    currentTimeSetter: (v: number) => void,
    getCurrentTime: () => number,
    getDuration: () => number,
  ) {
    subscriber.on("mediaSession", PlayerEvents.track, () => {
      const track = getCurrentTrack();
      const imgSrc = track?.al?.picUrl;
      const metaData = {
        title: getCurrentTrackName() ?? "未知歌曲",
        artist: getCurrentTrackArtists()
          ? getCurrentTrackArtists()!
              .map((a) => a.name)
              .join(" / ")
          : "未知歌手",
        album: track?.al?.name ?? "未知专辑",
        artwork: [
          {
            src: imgSrc ? imgSrc + "?param=96y96" : "",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: imgSrc ? imgSrc + "?param=128y128" : "",
            sizes: "128x128",
            type: "image/png",
          },
        ],
      };
      navigator.mediaSession.metadata = new window.MediaMetadata(metaData);
      navigator.mediaSession.setActionHandler("play", () =>
        playStateSetter("play"),
      );
      navigator.mediaSession.setActionHandler("pause", () =>
        playStateSetter("pause"),
      );
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        previousFnArg(),
      );
      navigator.mediaSession.setActionHandler("nexttrack", () => nextFnArg());
      navigator.mediaSession.setActionHandler("stop", () =>
        playStateSetter("pause"),
      );
      navigator.mediaSession.setActionHandler("seekto", (event) =>
        currentTimeSetter(Math.floor(event.seekTime ?? 0)),
      );
      navigator.mediaSession.setActionHandler("seekbackward", (event) =>
        currentTimeSetter(getCurrentTime() - (event.seekOffset ?? 10)),
      );
      navigator.mediaSession.setActionHandler("seekforward", (event) =>
        currentTimeSetter(getCurrentTime() + (event.seekOffset ?? 10)),
      );
      navigator.mediaSession.playbackState = "playing";
      this._mediaSessionInit = true;
    });

    subscriber.on("mediaSession", PlayerEvents.playState, () => {
      if (this._mediaSessionInit) {
        navigator.mediaSession.playbackState =
          getPlayState() === "pause" ? "paused" : "playing";
      }
    });

    subscriber.on("mediaSession", PlayerEvents.time, () => {
      if (this._mediaSessionInit) {
        navigator.mediaSession.setPositionState({
          position: getCurrentTime(),
          duration: (getDuration() as number) ?? 0,
        });
      }
    });
  }

  get mediaSessionInit(): boolean {
    return this._mediaSessionInit;
  }
}
