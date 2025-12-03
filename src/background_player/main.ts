import { Player } from "./playerCore";
import { PlayerEvents } from "@/dual/player";

console.log("Player process started");

const player = new Player();
const ipcRenderer = window.electron?.ipcRenderer;

if (ipcRenderer) {
  // Report ready
  ipcRenderer.send("player-ready");

  // Listen for commands
  ipcRenderer.on("player-command", (command: string, args: any) => {
    // console.log("Received command:", command);
    try {
      switch (command) {
        case "play":
          player.playState = "play";
          break;
        case "pause":
          player.playState = "pause";
          break;
        case "togglePlay":
          player.tooglePlayState();
          break;
        case "next":
          player.next();
          break;
        case "prev":
          player.previous();
          break;
        case "playTrack":
          player.playTrack(
            args.track,
            args.autoPlay,
            args.delay,
            args.progress,
          );
          break;
        case "setVolume":
          player.volume = args;
          break;
        case "seek":
          player.currentTime = args;
          break;
        case "setPlaylist":
          player.playlist = args;
          break;
        case "addTrack":
          player.addTrack(args);
          break;
        case "setQuality":
          player.quality = args;
          break;
        case "setDevice":
          player.setDevice(args);
          break;
        case "setEqualizer":
          player.setEqualizer(args);
          break;
        case "setDownloadedSongs":
          player.setDownloadedSongs(args);
          break;
        case "setMode":
          player.mode = args;
          break;
        case "setVolumeLeveling":
          player.volumeLeveling = args;
          break;
        case "playAll":
          player.playAll(args);
          break;
        case "addPlaylist":
          player.addPlaylist(args);
          break;
        case "clearPlaylist":
          player.clearPlaylist();
          break;
        case "deleteTrack":
          player.deleteTrack(args);
          break;
        case "nextPlay":
          player.nextPlay(args);
          break;
        case "getState": {
          const send = (event: string, data: any) => {
            ipcRenderer.send("player-event", {
              event,
              data: data ? JSON.parse(JSON.stringify(data)) : data,
            });
          };
          send(PlayerEvents.playlist, player.playlist);
          send(PlayerEvents.track, player.currentTrack);
          send(PlayerEvents.playState, player.playState);
          send(PlayerEvents.volume, player.volume);
          send(PlayerEvents.quality, player.quality);
          send(PlayerEvents.mode, player.mode);
          send(PlayerEvents.time, {
            currentTime: player.currentTime,
            duration: player.duration,
            progress: player.progress,
            sampleRate: player.sampleRate,
          });
          send(PlayerEvents.history, player.history);
          break;
        }
      }
    } catch (e) {
      console.error("Error executing command:", command, e);
    }
  });

  // Forward events
  const events = Object.values(PlayerEvents);
  events.forEach((event) => {
    player.subscriber.on("ipc", event, () => {
      let data: any = null;
      switch (event) {
        case PlayerEvents.time:
          data = {
            currentTime: player.currentTime,
            duration: player.duration,
            progress: player.progress,
          };
          break;
        case PlayerEvents.playState:
          data = player.playState;
          break;
        case PlayerEvents.track:
          data = player.currentTrack;
          break;
        case PlayerEvents.volume:
          data = player.volume;
          break;
        case PlayerEvents.quality:
          data = player.quality;
          break;
        case PlayerEvents.mode:
          data = player.mode;
          break;
        case PlayerEvents.playlist:
          data = player.playlist;
          break;
        case PlayerEvents.lyrics:
          data = player.lyrics;
          break;
        case PlayerEvents.history:
          data = player.history;
          break;
        case PlayerEvents.gain:
          break;
      }
      ipcRenderer.send("player-event", {
        event,
        data: data ? JSON.parse(JSON.stringify(data)) : data,
      });
    });
  });

  // Spectrum Data Loop
  setInterval(() => {
    if (player.playState === "play") {
      const spectrum = player.getSpectrumData();
      if (spectrum) {
        // Send as regular array to avoid serialization issues, or check if Uint8Array is supported
        // Uint8Array is usually supported in Electron IPC, but let's be safe and efficient
        // Actually, sending buffer is better.
        ipcRenderer.send("player-spectrum", { data: spectrum });
      }
    }
  }, 15); // ~66fps
} else {
  console.error("IPC Renderer not available");
}
