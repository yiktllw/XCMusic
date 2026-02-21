<template>
  <div
    class="desktop-lyric-container"
    :class="{ 'is-locked': isLocked, 'is-hover': isHover }"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div class="lyric-content" ref="lyricContainer" v-show="!showCountdown">
      <!-- Dynamic content will be generated here -->
    </div>

    <!-- Countdown circles (KTV-style) -->
    <div class="countdown-container" v-if="showCountdown">
      <div
        v-for="n in countdownCircles"
        :key="n"
        class="countdown-circle"
      ></div>
    </div>

    <!-- Control Bar (Visible on Hover) -->
    <div class="control-bar" v-show="isHover">
      <div class="drag-handle" title="Drag to move">✥</div>
      <button @click="control('prev')" title="Previous">⏮</button>
      <button @click="control('togglePlay')" title="Play/Pause">
        <span v-if="playState === 'pause'">▶</span>
        <span v-else>⏸</span>
      </button>
      <button @click="control('next')" title="Next">⏭</button>
      <button @click="refreshLyrics" title="Refresh Lyrics">↻</button>
      <button
        @click="toggleTranslate"
        :title="showTranslate ? 'Hide Translation' : 'Show Translation'"
      >
        <span :style="{ opacity: showTranslate ? 1 : 0.5 }">译</span>
      </button>
      <button @click="toggleLock" title="Lock">
        <span v-if="isLocked">🔒</span>
        <span v-else>🔓</span>
      </button>
      <button @click="closeWindow" title="Close">✕</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { PlayerEvents } from "@/dual/player";
import { type LrcItem, type LrcItem2, type YrcItem } from "@/utils/lyric";
import { useStore } from "vuex";
import * as Api from "@/utils/api";

export default defineComponent({
  name: "DesktopLyricView",
  setup() {
    const preferences = useStore().state.setting.playui.lyricsPreferences;

    const lyrics = ref<Array<LrcItem | LrcItem2 | YrcItem>>([]);
    const tlyrics = ref<YrcItem[]>([]);
    const tlyricsMap = ref<Map<number, YrcItem>>(new Map());
    const showTranslate = ref(useStore().state.setting.playui.showTranslate);
    const currentTime = ref(0);
    const playState = ref("pause");
    const isHover = ref(false);
    const isLocked = ref(false);
    const defaultMessage = ref("XCMusic Desktop Lyrics");
    const ipcRenderer = window.electron?.ipcRenderer;
    const lyricContainer = ref<HTMLElement | null>(null);

    // Animation state
    const wordAnimations = ref<Animation[]>([]);
    const backgroundElements = ref<HTMLElement[]>([]);
    const currentLineIndex = ref(-1);
    let animationFrameId: number | null = null;

    // Countdown circles state
    const showCountdown = ref(false);
    const countdownCircles = ref<number>(0); // 0, 1, 2, or 3 circles

    // Time sync
    const localTime = ref(0);
    const lastSyncTime = ref(0);
    const lastSyncTimestamp = ref(0);
    const isPlaying = ref(false);
    let timeSyncListener: ((payload: any) => void) | null = null;

    // Redirect console logs to main process in development
    if (window.env?.isDevelopment && ipcRenderer) {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args) => {
        originalLog(...args);
        ipcRenderer.send("lyric-console-log", args);
      };
      console.error = (...args) => {
        originalError(...args);
        ipcRenderer.send("lyric-console-log", ["ERROR:", ...args]);
      };
      console.warn = (...args) => {
        originalWarn(...args);
        ipcRenderer.send("lyric-console-log", ["WARN:", ...args]);
      };
    }

    /** Generate lyric elements with word-by-word animation */
    const generateLyricElements = () => {
      if (!lyricContainer.value) return;

      // Clear previous content
      lyricContainer.value.innerHTML = "";
      wordAnimations.value.forEach((anim) => anim.cancel());
      wordAnimations.value = [];
      backgroundElements.value = [];

      // Font settings from preferences (desktop lyrics use 2x size)
      const fontSize = preferences.fontSize * 2;
      const fontFamily = preferences.fontFamily.join(",");
      const fontWeight = preferences.is_bold ? "bold" : "900";
      const fontStyle = preferences.isItalic ? "italic" : "normal";

      // If no lyrics or invalid line index, show default message
      if (
        !lyrics.value ||
        lyrics.value.length === 0 ||
        currentLineIndex.value === -1 ||
        currentLineIndex.value >= lyrics.value.length
      ) {
        const lineElement = document.createElement("div");
        lineElement.innerText = defaultMessage.value;
        // Apply styles
        Object.assign(lineElement.style, {
          fontFamily,
          fontWeight,
          fontSize: `${fontSize}px`,
          fontStyle,
          color: "#fff",
          whiteSpace: "nowrap",
          // webkitTextStroke: "1.5px #000",
          textShadow:
            "2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.8)",
        });
        lyricContainer.value.appendChild(lineElement);
        return;
      }

      // 前台歌词元素
      const lineElement = document.createElement("div");
      Object.assign(lineElement.style, {
        fontFamily,
        fontWeight,
        fontSize: `${fontSize}px`,
        fontStyle,
        color: "#fff",
        whiteSpace: "nowrap",
        // webkitTextStroke: "1.5px #000",
        textShadow:
          "2px 2px 4px rgba(0, 0, 0, 0.4), 0 0 8px rgba(0, 0, 0, 0.4)",
        lineHeight: "1.2",
        position: "absolute",
        top: "-1.2em",
      });

      // 背景歌词元素
      const backgroundLine = document.createElement("div");
      Object.assign(backgroundLine.style, {
        fontFamily,
        fontWeight,
        fontSize: `${fontSize}px`,
        fontStyle,
        // color: "rgba(255, 255, 255, 1)",
        whiteSpace: "nowrap",
        // webkitTextStroke: "1.5px #000",
        textShadow:
          "2px 2px 4px rgba(0, 0, 0, 0.4), 0 0 8px rgba(0, 0, 0, 0.4)",
        lineHeight: "1.2",
        // webkitTextFillColor: "#fff",
        position: "absolute",
        top: "0.0em",
      });

      const currentLyric = lyrics.value[currentLineIndex.value];

      // Check if it's YRC with valid animation data (has duration)
      const hasAnimation =
        currentLyric.type === "yrc" &&
        Array.isArray(currentLyric.words) &&
        currentLyric.words.length > 0 &&
        currentLyric.words.some((w: any) => w.duration && w.duration > 0);

      if (hasAnimation) {
        // Generate word-by-word elements
        currentLyric.words.forEach((word: any) => {
          // Foreground word element
          const wordSpan = document.createElement("span");
          wordSpan.innerText = word.text;
          Object.assign(wordSpan.style, {
            display: "inline-block",
            color: "#fff",
            webkitTextFillColor: "#fff",
            clipPath: "inset(0 100% 0 0)",
            whiteSpace: "pre-wrap",
          });
          lineElement.appendChild(wordSpan);

          // Background word element
          const bgWordSpan = document.createElement("span");
          bgWordSpan.innerText = word.text;
          Object.assign(bgWordSpan.style, {
            display: "inline-block",
            color: "rgba(255, 255, 255, 0.4)",
            webkitTextFillColor: "rgba(255, 255, 255, 0.4)",
            whiteSpace: "pre-wrap",
          });
          backgroundLine.appendChild(bgWordSpan);

          // Create clip-path animation (duration is already in ms)
          const animation = wordSpan.animate(
            [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
            {
              duration: word.duration || 1000,
              easing: "linear",
              fill: "both",
            },
          );
          animation.pause();
          wordAnimations.value.push(animation);
        });
      } else {
        // Plain text lyrics
        const text = getLrcContent(currentLyric);
        lineElement.innerText = text;
        backgroundLine.innerText = text;
      }

      lyricContainer.value.appendChild(backgroundLine);
      lyricContainer.value.appendChild(lineElement);
      backgroundElements.value.push(backgroundLine);

      // Generate translation line element if exists
      if (showTranslate.value && tlyrics.value.length > 0) {
        let tnsText = tlyricsMap.value.get(currentLyric.startTime)?.words[0]
          .text;

        // If no direct match, search in interval
        if (!tnsText) {
          const tnsLyricsKeys = Array.from(tlyricsMap.value.keys()).sort(
            (a, b) => a - b,
          );
          const _key = tnsLyricsKeys.find((key) => {
            if (key >= currentLyric.startTime) {
              const nextLyric = lyrics.value[currentLineIndex.value + 1];
              if (nextLyric && key < nextLyric.startTime) {
                return true;
              } else if (!nextLyric) {
                return true;
              }
            }
            return false;
          });
          if (_key) {
            tnsText = tlyricsMap.value.get(_key)?.words[0].text;
          }
        }

        if (tnsText) {
          const tlineElement = document.createElement("div");
          tlineElement.innerText = tnsText;
          Object.assign(tlineElement.style, {
            fontFamily,
            fontWeight: preferences.tns_is_bold ? "bold" : "normal",
            fontSize: `${preferences.tns_fontSize * 2}px`,
            fontStyle: preferences.tns_isItalic ? "italic" : "normal",
            color: "rgba(255, 255, 255, 1)",
            whiteSpace: "prewrap",
            textShadow:
              "2px 2px 4px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 0, 0, 0.6)",
            lineHeight: "1.2",
            position: "absolute",
            top: "0.0em",
            marginTop: `${preferences.distance_l_t}px`,
          });
          lyricContainer.value.appendChild(tlineElement);
        }
      }

      // Position background line to overlap with foreground
      requestAnimationFrame(() => {
        if (backgroundLine && lineElement) {
          backgroundLine.style.marginTop = `-${lineElement.offsetHeight}px`;
        }
      });
    };

    const getLrcContent = (item: any) => {
      if (typeof item.content === "string") {
        return item.content;
      } else if (Array.isArray(item.content)) {
        return item.content.map((c: any) => c.tx).join("");
      } else if (Array.isArray(item.words)) {
        return item.words.map((w: any) => w.text).join("");
      }
      return "";
    };

    /** Update time and control animations */
    const startTimeUpdate = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      const update = () => {
        if (isPlaying.value) {
          const elapsed = (performance.now() - lastSyncTimestamp.value) / 1000;
          localTime.value = lastSyncTime.value + elapsed;
        }

        currentTime.value = localTime.value;

        // Find current line
        const timeMs = localTime.value * 1000;
        const newLineIndex = lyrics.value.findIndex((item, index) => {
          const nextItem = lyrics.value[index + 1];
          return (
            timeMs >= item.startTime &&
            (!nextItem || timeMs < nextItem.startTime)
          );
        });

        if (newLineIndex !== currentLineIndex.value && newLineIndex !== -1) {
          currentLineIndex.value = newLineIndex;
        }

        // Check for countdown display (KTV-style countdown)
        if (
          lyrics.value &&
          lyrics.value.length > 0 &&
          (newLineIndex === -1 || timeMs < lyrics.value[0].startTime)
        ) {
          // Before first lyric or no current lyric
          const nextLyric = lyrics.value[0];
          const timeUntilNext = nextLyric.startTime - timeMs;

          if (timeUntilNext > 10000) {
            // More than 10 seconds until next lyric
            if (timeUntilNext <= 3000) {
              // Show countdown in last 3 seconds
              showCountdown.value = true;
              countdownCircles.value = Math.ceil(timeUntilNext / 1000);
            } else {
              showCountdown.value = false;
            }
          } else {
            showCountdown.value = false;
          }
        } else if (
          newLineIndex !== -1 &&
          newLineIndex < lyrics.value.length - 1
        ) {
          // Between lyrics
          const nextLyric = lyrics.value[newLineIndex + 1];
          const currentLyric = lyrics.value[newLineIndex];
          const gap = nextLyric.startTime - currentLyric.startTime;
          const timeUntilNext = nextLyric.startTime - timeMs;

          // Calculate current lyric end time
          let currentLyricEndTime = currentLyric.startTime;
          if (
            currentLyric.type === "yrc" &&
            Array.isArray(currentLyric.words) &&
            currentLyric.words.length > 0
          ) {
            // Check if it has animation (duration > 0)
            const hasAnimation = currentLyric.words.some(
              (w: any) => w.duration && w.duration > 0,
            );
            if (hasAnimation) {
              // For animated lyrics, calculate end time from last word
              const lastWord =
                currentLyric.words[currentLyric.words.length - 1];
              if (lastWord && lastWord.duration) {
                currentLyricEndTime = lastWord.startTime + lastWord.duration;
              }
            } else {
              // For non-animated lyrics (like composer info), consider it ends immediately
              currentLyricEndTime = currentLyric.startTime;
            }
          } else {
            // For plain text lyrics, consider it ends immediately
            currentLyricEndTime = currentLyric.startTime;
          }

          if (gap > 10000 && timeMs > currentLyricEndTime) {
            // Gap longer than 10 seconds and current lyric animation finished
            if (timeUntilNext <= 3000 && timeUntilNext > 0) {
              showCountdown.value = true;
              countdownCircles.value = Math.ceil(timeUntilNext / 1000);
            } else {
              showCountdown.value = false;
            }
          } else {
            showCountdown.value = false;
          }
        } else {
          showCountdown.value = false;
        }

        // Control word animations - only if current line has animation data
        if (wordAnimations.value.length > 0 && currentLineIndex.value !== -1) {
          const currentLyric = lyrics.value[currentLineIndex.value];
          const hasAnimation =
            currentLyric &&
            currentLyric.type === "yrc" &&
            Array.isArray(currentLyric.words) &&
            currentLyric.words.length > 0 &&
            currentLyric.words.some((w: any) => w.duration && w.duration > 0) &&
            currentLyric.words.length === wordAnimations.value.length;

          if (hasAnimation) {
            currentLyric.words.forEach((word: any, index: number) => {
              const animation = wordAnimations.value[index];
              if (!animation) return;

              if (!isPlaying.value) {
                // 暂停时：暂停所有动画
                if (animation.playState === "running") {
                  animation.pause();
                }
              } else if (timeMs < word.startTime) {
                // 时间轴之前：进度0
                animation.cancel();
              } else if (timeMs >= word.startTime + (word.duration || 0)) {
                // 时间轴之后：保持完成
                animation.finish();
              } else {
                // 当前词：播放动画
                if (animation.playState !== "running") {
                  animation.play();
                }
              }
            });
          }
        }

        animationFrameId = requestAnimationFrame(update);
      };

      animationFrameId = requestAnimationFrame(update);
    };

    // Watch for line changes
    watch(currentLineIndex, () => {
      if (!lyricContainer.value) return;

      // Fade out
      lyricContainer.value.style.transition = "opacity 0.2s ease-out";
      lyricContainer.value.style.opacity = "0";

      setTimeout(() => {
        generateLyricElements();
        // Fade in
        if (lyricContainer.value) {
          lyricContainer.value.style.opacity = "1";
        }
      }, 200);
    });

    const handlePlayerEvent = (payload: any) => {
      if (!payload || !payload.event) return;

      switch (payload.event) {
        case PlayerEvents.playState:
          playState.value = payload.data;
          isPlaying.value = payload.data === "play";
          break;
        case PlayerEvents.lyrics:
          lyrics.value = payload.data || [];
          currentLineIndex.value = -1;
          generateLyricElements();
          break;
        case PlayerEvents.track:
          if (payload.data) {
            defaultMessage.value = `${payload.data.name} - ${payload.data.ar.map((a: any) => a.name).join("/")}`;

            // Fetch translation lyrics
            tlyrics.value = [];
            tlyricsMap.value.clear();
            if (payload.data.id) {
              Api.Lyrics.getLyricsTns(payload.data.id).then(
                (res: string | null) => {
                  if (!res) return;
                  // Parse translation lyrics
                  const lines = res.split("\n");
                  lines.forEach((line: string) => {
                    const match = line.match(/\[(\d+):(\d+)\.(\d+)\](.*)/);
                    if (match) {
                      const minutes = parseInt(match[1]);
                      const seconds = parseInt(match[2]);
                      const milliseconds = parseInt(match[3]);
                      const text = match[4].trim();
                      const startTimeMs =
                        minutes * 60000 + seconds * 1000 + milliseconds;

                      const tlyricItem: YrcItem = {
                        type: "yrc",
                        startTime: startTimeMs,
                        duration: 0,
                        words: [
                          {
                            startTime: startTimeMs,
                            duration: 0,
                            text: text,
                          },
                        ],
                      };
                      tlyrics.value.push(tlyricItem);
                      tlyricsMap.value.set(startTimeMs, tlyricItem);
                    }
                  });
                  // Regenerate lyrics elements to show translation
                  generateLyricElements();
                },
              );
            }
          } else {
            defaultMessage.value = "XCMusic Desktop Lyrics";
            lyrics.value = [];
            tlyrics.value = [];
            tlyricsMap.value.clear();
          }
          break;
      }
    };

    const closeWindow = () => {
      ipcRenderer?.send("close-desktop-lyric");
    };

    const toggleLock = () => {
      isLocked.value = !isLocked.value;
      ipcRenderer?.send("lock-desktop-lyric", isLocked.value);
    };

    const control = (command: string) => {
      ipcRenderer?.send("player-command", { command });
    };

    const refreshLyrics = () => {
      ipcRenderer?.send("player-command", { command: "getState" });
    };

    const toggleTranslate = () => {
      showTranslate.value = !showTranslate.value;
      generateLyricElements();
    };

    onMounted(() => {
      document.body.style.backgroundColor = "transparent";

      // Initialize display with default message
      generateLyricElements();

      // Setup time sync listener
      if (ipcRenderer) {
        timeSyncListener = (payload: any) => {
          if (payload?.event === "timeSync") {
            lastSyncTime.value = payload.data.currentTime;
            lastSyncTimestamp.value = performance.now();
            localTime.value = payload.data.currentTime;
            isPlaying.value = payload.data.playState === "play";
          }
        };
        ipcRenderer.on("player-event", timeSyncListener);
        ipcRenderer.on("player-event", handlePlayerEvent);
      }

      // Initialize
      lastSyncTime.value = 0;
      lastSyncTimestamp.value = performance.now();
      localTime.value = 0;

      startTimeUpdate();
      ipcRenderer?.send("player-command", { command: "getState" });
    });

    onBeforeUnmount(() => {
      if (ipcRenderer && timeSyncListener) {
        ipcRenderer.removeListener("player-event", timeSyncListener);
        ipcRenderer.removeListener("player-event", handlePlayerEvent);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      wordAnimations.value.forEach((anim) => anim.cancel());
    });

    return {
      lyricContainer,
      currentTime,
      isHover,
      isLocked,
      defaultMessage,
      playState,
      showCountdown,
      countdownCircles,
      closeWindow,
      toggleLock,
      control,
      refreshLyrics,
      toggleTranslate,
      showTranslate,
    };
  },
});
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  /* overflow: hidden !important; */
  /* background: transparent !important; */
}
</style>

<style lang="scss" scoped>
.desktop-lyric-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  // justify-content: center;
  align-items: center;
  user-select: none;
  transition: background-color 0.3s;
  overflow: hidden;
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  &.is-locked {
    background-color: transparent !important;
    pointer-events: none; /* Let clicks pass through */
    -webkit-app-region: no-drag;
  }

  .lyric-content {
    text-align: center;
    width: 100%;
    padding: 0 40px;
    position: relative;
  }

  .control-bar {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    background: rgba(0, 0, 0, 0.65);
    border-radius: 24px;
    padding: 6px 18px;
    gap: 12px;
    z-index: 100;
    -webkit-app-region: no-drag;
    backdrop-filter: blur(8px);

    .drag-handle {
      display: none;
    }

    button {
      background: none;
      border: none;
      color: #eee;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.2s ease;
      -webkit-app-region: no-drag;
      border-radius: 8px;

      &:hover {
        color: #409eff;
        background: rgba(64, 158, 255, 0.15);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .countdown-container {
    position: absolute;
    top: calc(50% + 5px);
    left: 0;
    transform: translateY(-50%);
    display: flex;
    gap: 20px;
    align-items: center;
    padding-left: 40px;
    z-index: 50;

    .countdown-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgb(31, 247, 211);
      box-shadow: 0 0 10px rgb(142, 222, 197);
      animation: countdown-pulse 1s ease-in-out infinite;
    }
  }
}

@keyframes countdown-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.9;
  }
}
</style>
