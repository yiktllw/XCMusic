<template>
  <div
    class="desktop-lyric-container"
    :class="{ 'is-locked': isLocked, 'is-hover': isHover }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="control-bar-slot" :class="{ 'is-locked': isLocked }">
      <div class="control-bar" :class="{ 'is-visible': isHover && !isLocked }">
        <button @click="control('prev')" :title="$t('playbar.previous')">
          <img class="control-icon g-icon" src="@/assets/previous.svg" />
        </button>
        <button
          @click="control('togglePlay')"
          :title="
            playState === 'pause' ? $t('playbar.play') : $t('playbar.pause')
          "
        >
          <img
            v-if="playState === 'pause'"
            class="control-icon"
            src="@/assets/play.svg"
          />
          <img v-else class="control-icon" src="@/assets/pause.svg" />
        </button>
        <button @click="control('next')" :title="$t('playbar.next')">
          <img class="control-icon g-icon" src="@/assets/next.svg" />
        </button>
        <button
          class="refresh-icon"
          @click="refreshLyrics"
          :title="$t('playbar.refresh_lyrics')"
        >
          ↻
        </button>
        <button
          @click="toggleTranslate"
          :title="
            showTranslate
              ? $t('playbar.hide_translation')
              : $t('playbar.show_translation')
          "
        >
          <img
            class="control-icon-translate g-icon"
            src="@/assets/translate.svg"
            :style="{ opacity: showTranslate ? 1 : 0.5 }"
          />
        </button>
        <button @click="toggleLock" :title="$t('playbar.lock')">
          <img
            class="control-icon-lock g-icon"
            src="@/assets/code-type/lock.svg"
          />
        </button>
        <button @click="closeWindow" :title="$t('titlebar.close')">✕</button>
      </div>
    </div>

    <div class="lyric-area">
      <div
        class="lyric-content"
        ref="lyricContainer"
        v-show="!showCountdown"
      ></div>

      <div
        class="countdown-container"
        v-if="showCountdown"
        :style="countdownContainerStyle"
      >
        <div
          v-for="n in countdownCircles"
          :key="n"
          class="countdown-circle"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
} from "vue";
import { PlayerEvents } from "@/dual/player";
import { type LrcItem, type LrcItem2, type YrcItem } from "@/utils/lyric";
import { useStore } from "vuex";
import * as Api from "@/utils/api";
import {
  defaultPreferences as defaultLyricsPreferences,
  type ILyricsPreferences,
} from "@/components/base/YLyricsNew/utils";
import { getStorage, StorageKey } from "@/utils/render_storage";

export default defineComponent({
  name: "DesktopLyricView",
  setup() {
    const store = useStore();
    const preferences = ref<ILyricsPreferences>({
      ...defaultLyricsPreferences,
      ...store.state.setting.playui.lyricsPreferences,
    });

    const lyrics = ref<Array<LrcItem | LrcItem2 | YrcItem>>([]);
    const tlyrics = ref<YrcItem[]>([]);
    const tlyricsMap = ref<Map<number, YrcItem>>(new Map());
    const showTranslate = ref(store.state.setting.playui.showTranslate);
    const currentTime = ref(0);
    const playState = ref("pause");
    const isHover = ref(false);
    const HOVER_HIDE_DELAY_MS = 3000;
    const RESIZE_HOVER_GUARD_MS = 400;
    let hoverLeaveTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeGuardTimer: ReturnType<typeof setTimeout> | null = null;
    let pointerInContainer = false;
    const isLocked = ref(false);
    const defaultMessage = ref("XCMusic Desktop Lyrics");
    const ipcRenderer = window.electron?.ipcRenderer;
    const lyricContainer = ref<HTMLElement | null>(null);

    const wordAnimations = ref<Animation[]>([]);
    const backgroundElements = ref<HTMLElement[]>([]);
    const currentLineIndex = ref(-1);
    let animationFrameId: number | null = null;

    const showCountdown = ref(false);
    const countdownCircles = ref<number>(0);
    const countdownLineBoxHeightPx = ref(40);
    const countdownContainerStyle = computed(() => {
      const lineBoxHeight = countdownLineBoxHeightPx.value;
      const countdownTop = 10 + lineBoxHeight / 2;

      const align = ["left", "center", "right"].includes(
        preferences.value.desktop_align,
      )
        ? preferences.value.desktop_align
        : "left";

      if (align === "center") {
        return {
          top: `${countdownTop}px`,
          left: "50%",
          right: "auto",
          transform: "translate(-50%, -50%)",
          paddingLeft: "0",
          paddingRight: "0",
        };
      }

      if (align === "right") {
        return {
          top: `${countdownTop}px`,
          left: "auto",
          right: "0",
          transform: "translateY(-50%)",
          paddingLeft: "0",
          paddingRight: "40px",
        };
      }

      return {
        top: `${countdownTop}px`,
        left: "0",
        right: "auto",
        transform: "translateY(-50%)",
        paddingLeft: "40px",
        paddingRight: "0",
      };
    });

    const localTime = ref(0);
    const lastSyncTime = ref(0);
    const lastSyncTimestamp = ref(0);
    const isPlaying = ref(false);
    let timeSyncListener: ((payload: any) => void) | null = null;
    let desktopLyricStateListener: ((payload: any) => void) | null = null;

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

    const loadLatestLyricsPreferences = () => {
      const stored = getStorage(StorageKey.Setting_PlayUI_LyricsPreference);
      const merged = {
        ...defaultLyricsPreferences,
        ...(stored || store.state.setting.playui.lyricsPreferences),
      } as ILyricsPreferences;
      preferences.value = merged;
      try {
        store.state.setting.playui.lyricsPreferences = merged;
      } catch (error) {
        console.warn(
          "Failed to sync lyric preferences into setting proxy",
          error,
        );
      }
    };

    const generateLyricElements = () => {
      if (!lyricContainer.value) return;

      const currentPreferences = preferences.value;

      lyricContainer.value.innerHTML = "";
      wordAnimations.value.forEach((anim) => anim.cancel());
      wordAnimations.value = [];
      backgroundElements.value = [];

      const fontSize =
        currentPreferences.desktop_fontSize ?? currentPreferences.fontSize * 2;
      const tnsFontSize =
        currentPreferences.desktop_tns_fontSize ??
        currentPreferences.tns_fontSize * 2;
      const mainLineHeightPx = Math.ceil(fontSize * 1.2);
      const mainShadowSafePx = Math.max(14, Math.round(fontSize * 0.36));
      const mainLineBoxHeightPx = mainLineHeightPx + mainShadowSafePx * 2;
      countdownLineBoxHeightPx.value = mainLineBoxHeightPx;
      const tnsLineHeightPx = Math.ceil(tnsFontSize * 1.2);
      const tnsShadowSafePx = Math.max(12, Math.round(tnsFontSize * 0.36));
      const tnsLineBoxHeightPx = tnsLineHeightPx + tnsShadowSafePx * 2;
      const clipPathStart = "inset(-1em 100% -1em -1em)";
      const clipPathEnd = "inset(-1em 0 -1em -1em)";
      const translateTopPx = mainLineBoxHeightPx;

      const fontFamily = currentPreferences.fontFamily.join(",");
      const tnsFontFamily = currentPreferences.tns_fontFamily.join(",");
      const fontWeight = currentPreferences.is_bold ? "bold" : "900";
      const fontStyle = currentPreferences.isItalic ? "italic" : "normal";
      const desktopAlign = ["left", "center", "right"].includes(
        currentPreferences.desktop_align,
      )
        ? currentPreferences.desktop_align
        : "left";

      if (!lyrics.value || lyrics.value.length === 0) {
        const lineElement = document.createElement("div");
        lineElement.innerText = defaultMessage.value;
        Object.assign(lineElement.style, {
          fontFamily,
          fontWeight,
          fontSize: `${fontSize}px`,
          fontStyle,
          color: "#eee",
          whiteSpace: "nowrap",
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: `${mainLineHeightPx}px`,
          height: `${mainLineBoxHeightPx}px`,
          paddingTop: `${mainShadowSafePx}px`,
          paddingBottom: `${mainShadowSafePx}px`,
          boxSizing: "border-box",
          width: "100%",
          textAlign: desktopAlign,
          textShadow:
            "4px 4px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.8)",
        });
        lyricContainer.value.appendChild(lineElement);
        return;
      }

      const safeLineIndex = Math.min(
        Math.max(currentLineIndex.value, 0),
        lyrics.value.length - 1,
      );

      const lineElement = document.createElement("div");
      Object.assign(lineElement.style, {
        fontFamily,
        fontWeight,
        fontSize: `${fontSize}px`,
        fontStyle,
        color: "#eee",
        whiteSpace: "nowrap",
        textShadow:
          "4px 4px 4px rgba(0, 0, 0, 0.4), 0 0 8px rgba(0, 0, 0, 0.4)",
        lineHeight: `${mainLineHeightPx}px`,
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        height: `${mainLineBoxHeightPx}px`,
        paddingTop: `${mainShadowSafePx}px`,
        paddingBottom: `${mainShadowSafePx}px`,
        boxSizing: "border-box",
        display: "block",
        textAlign: desktopAlign,
      });

      const backgroundLine = document.createElement("div");
      Object.assign(backgroundLine.style, {
        fontFamily,
        fontWeight,
        fontSize: `${fontSize}px`,
        fontStyle,
        whiteSpace: "nowrap",
        textShadow:
          "4px 4px 4px rgba(0, 0, 0, 0.4), 0 0 8px rgba(0, 0, 0, 0.4)",
        lineHeight: `${mainLineHeightPx}px`,
        position: "absolute",
        top: "0.0em",
        left: "0",
        right: "0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        height: `${mainLineBoxHeightPx}px`,
        paddingTop: `${mainShadowSafePx}px`,
        paddingBottom: `${mainShadowSafePx}px`,
        boxSizing: "border-box",
        display: "block",
        textAlign: desktopAlign,
      });

      const currentLyric = lyrics.value[safeLineIndex];

      const hasAnimation =
        currentLyric.type === "yrc" &&
        Array.isArray(currentLyric.words) &&
        currentLyric.words.length > 0 &&
        currentLyric.words.some((w: any) => w.duration && w.duration > 0);

      if (hasAnimation) {
        currentLyric.words.forEach((word: any) => {
          const wordSpan = document.createElement("span");
          wordSpan.innerText = word.text;
          Object.assign(wordSpan.style, {
            display: "inline-block",
            color: "#eee",
            webkitTextFillColor: "#eee",
            clipPath: clipPathStart,
            whiteSpace: "pre",
          });
          lineElement.appendChild(wordSpan);

          const bgWordSpan = document.createElement("span");
          bgWordSpan.innerText = word.text;
          Object.assign(bgWordSpan.style, {
            display: "inline-block",
            color: "rgba(255, 255, 255, 0.5)",
            webkitTextFillColor: "rgba(255, 255, 255, 0.5)",
            whiteSpace: "pre",
          });
          backgroundLine.appendChild(bgWordSpan);

          const animation = wordSpan.animate(
            [{ clipPath: clipPathStart }, { clipPath: clipPathEnd }],
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
        const text = getLrcContent(currentLyric);
        lineElement.innerText = text;
        backgroundLine.innerText = text;
      }

      lyricContainer.value.appendChild(backgroundLine);
      lyricContainer.value.appendChild(lineElement);
      backgroundElements.value.push(backgroundLine);

      if (showTranslate.value && tlyrics.value.length > 0) {
        let tnsText = tlyricsMap.value.get(currentLyric.startTime)?.words[0]
          .text;

        if (!tnsText) {
          const tnsLyricsKeys = Array.from(tlyricsMap.value.keys()).sort(
            (a, b) => a - b,
          );
          const _key = tnsLyricsKeys.find((key) => {
            if (key >= currentLyric.startTime) {
              const nextLyric = lyrics.value[safeLineIndex + 1];
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
            fontFamily: tnsFontFamily,
            fontWeight: currentPreferences.tns_is_bold ? "bold" : "normal",
            fontSize: `${tnsFontSize}px`,
            fontStyle: currentPreferences.tns_isItalic ? "italic" : "normal",
            color: "rgba(255, 255, 255, 1)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textShadow:
              "4px 4px 4px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 0, 0, 0.6)",
            lineHeight: `${tnsLineHeightPx}px`,
            position: "absolute",
            top: `${translateTopPx}px`,
            left: "0",
            right: "0",
            height: `${tnsLineBoxHeightPx}px`,
            paddingTop: `${tnsShadowSafePx}px`,
            paddingBottom: `${tnsShadowSafePx}px`,
            boxSizing: "border-box",
            textAlign: desktopAlign,
          });
          lyricContainer.value.appendChild(tlineElement);
        }
      }
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

    const startTimeUpdate = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      const update = () => {
        if (isPlaying.value) {
          const elapsed = (performance.now() - lastSyncTimestamp.value) / 1000;
          localTime.value = lastSyncTime.value + elapsed;
        }

        currentTime.value = localTime.value;

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

        if (
          lyrics.value &&
          lyrics.value.length > 0 &&
          (newLineIndex === -1 || timeMs < lyrics.value[0].startTime)
        ) {
          const nextLyric = lyrics.value[0];
          const timeUntilNext = nextLyric.startTime - timeMs;

          if (timeUntilNext > 10000) {
            if (timeUntilNext <= 3000) {
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
          const nextLyric = lyrics.value[newLineIndex + 1];
          const currentLyric = lyrics.value[newLineIndex];
          const gap = nextLyric.startTime - currentLyric.startTime;
          const timeUntilNext = nextLyric.startTime - timeMs;

          let currentLyricEndTime = currentLyric.startTime;
          if (
            currentLyric.type === "yrc" &&
            Array.isArray(currentLyric.words) &&
            currentLyric.words.length > 0
          ) {
            const hasAnimation = currentLyric.words.some(
              (w: any) => w.duration && w.duration > 0,
            );
            if (hasAnimation) {
              const lastWord =
                currentLyric.words[currentLyric.words.length - 1];
              if (lastWord && lastWord.duration) {
                currentLyricEndTime = lastWord.startTime + lastWord.duration;
              }
            } else {
              currentLyricEndTime = currentLyric.startTime;
            }
          } else {
            currentLyricEndTime = currentLyric.startTime;
          }

          if (gap > 10000 && timeMs > currentLyricEndTime) {
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
                if (animation.playState === "running") {
                  animation.pause();
                }
              } else if (timeMs < word.startTime) {
                animation.cancel();
              } else if (timeMs >= word.startTime + (word.duration || 0)) {
                animation.finish();
              } else {
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

    watch(currentLineIndex, () => {
      if (!lyricContainer.value) return;

      lyricContainer.value.style.transition = "opacity 0.2s ease-out";
      lyricContainer.value.style.opacity = "0";

      setTimeout(() => {
        generateLyricElements();
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
          if (lyrics.value.length === 0) {
            currentLineIndex.value = -1;
          } else if (
            currentLineIndex.value < 0 ||
            currentLineIndex.value >= lyrics.value.length
          ) {
            currentLineIndex.value = 0;
          }
          generateLyricElements();
          break;
        case PlayerEvents.track:
          if (payload.data) {
            tlyrics.value = [];
            tlyricsMap.value.clear();
            if (payload.data.id) {
              Api.Lyrics.getLyricsTns(payload.data.id).then(
                (res: string | null) => {
                  if (!res) return;
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

    const applyLockMouseState = () => {
      if (!isLocked.value) {
        ipcRenderer?.send("lock-desktop-lyric", {
          locked: false,
          ignoreMouse: false,
        });
        return;
      }
      ipcRenderer?.send("lock-desktop-lyric", {
        locked: true,
        ignoreMouse: true,
      });
    };

    const toggleLock = () => {
      isLocked.value = !isLocked.value;
      if (isLocked.value) {
        clearHoverLeaveTimer();
        isHover.value = false;
      } else {
        isHover.value = true;
      }
      applyLockMouseState();
    };

    const control = (command: string) => {
      ipcRenderer?.send("player-command", { command });
    };

    const refreshLyrics = () => {
      loadLatestLyricsPreferences();
      generateLyricElements();
      ipcRenderer?.send("player-command", { command: "getState" });
    };

    const toggleTranslate = () => {
      showTranslate.value = !showTranslate.value;
      generateLyricElements();
    };

    const clearHoverLeaveTimer = () => {
      if (hoverLeaveTimer) {
        clearTimeout(hoverLeaveTimer);
        hoverLeaveTimer = null;
      }
    };

    const clearResizeGuardTimer = () => {
      if (resizeGuardTimer) {
        clearTimeout(resizeGuardTimer);
        resizeGuardTimer = null;
      }
    };

    const scheduleHoverHide = () => {
      clearHoverLeaveTimer();
      hoverLeaveTimer = setTimeout(() => {
        isHover.value = false;
        applyLockMouseState();
        hoverLeaveTimer = null;
      }, HOVER_HIDE_DELAY_MS);
    };

    const syncLockStateFromMain = (payload: any) => {
      if (!payload || typeof payload !== "object") {
        return;
      }
      const locked = (payload as { locked?: boolean }).locked === true;
      isLocked.value = locked;
      if (locked) {
        clearHoverLeaveTimer();
        isHover.value = false;
      }
    };

    const handleMouseEnter = () => {
      if (isLocked.value) return;
      pointerInContainer = true;
      clearHoverLeaveTimer();
      isHover.value = true;
      applyLockMouseState();
    };

    const handleMouseLeave = () => {
      if (isLocked.value) return;
      pointerInContainer = false;
      if (resizeGuardTimer) {
        return;
      }
      scheduleHoverHide();
    };

    const handleWindowResize = () => {
      if (isLocked.value) return;
      clearResizeGuardTimer();
      clearHoverLeaveTimer();

      isHover.value = true;
      applyLockMouseState();

      resizeGuardTimer = setTimeout(() => {
        resizeGuardTimer = null;
        if (!pointerInContainer) {
          scheduleHoverHide();
        }
      }, RESIZE_HOVER_GUARD_MS);
    };

    onMounted(() => {
      document.body.style.backgroundColor = "transparent";
      window.addEventListener("resize", handleWindowResize);

      generateLyricElements();

      if (ipcRenderer) {
        timeSyncListener = (payload: any) => {
          if (payload?.event === "timeSync") {
            lastSyncTime.value = payload.data.currentTime;
            lastSyncTimestamp.value = performance.now();
            localTime.value = payload.data.currentTime;
            isPlaying.value = payload.data.playState === "play";
          }
        };
        desktopLyricStateListener = (payload: any) => {
          syncLockStateFromMain(payload);
        };
        ipcRenderer.on("desktop-lyric-state", desktopLyricStateListener);
        ipcRenderer.invoke("get-desktop-lyric-state").then((payload: any) => {
          syncLockStateFromMain(payload);
        });
        ipcRenderer.on("player-event", timeSyncListener);
        ipcRenderer.on("player-event", handlePlayerEvent);
      }

      lastSyncTime.value = 0;
      lastSyncTimestamp.value = performance.now();
      localTime.value = 0;

      startTimeUpdate();
      ipcRenderer?.send("player-command", { command: "getState" });
    });

    onBeforeUnmount(() => {
      clearHoverLeaveTimer();
      clearResizeGuardTimer();
      window.removeEventListener("resize", handleWindowResize);
      if (ipcRenderer && timeSyncListener) {
        ipcRenderer.removeListener("player-event", timeSyncListener);
        ipcRenderer.removeListener("player-event", handlePlayerEvent);
      }
      if (ipcRenderer && desktopLyricStateListener) {
        ipcRenderer.removeListener(
          "desktop-lyric-state",
          desktopLyricStateListener,
        );
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
      countdownContainerStyle,
      closeWindow,
      toggleLock,
      handleMouseEnter,
      handleMouseLeave,
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
}
</style>

<style lang="scss" scoped>
.desktop-lyric-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  user-select: none;
  transition: background-color 0.3s;
  overflow: hidden;
  position: relative;
  cursor: pointer;

  &.is-hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  &.is-locked {
    background-color: transparent !important;
    -webkit-app-region: no-drag;
    cursor: default;

    .control-bar,
    .control-bar button,
    .control-bar-slot {
      cursor: default !important;
    }
  }

  .control-bar-slot {
    height: 58px;
    flex-shrink: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 8px;
    box-sizing: border-box;
    -webkit-app-region: drag;
    cursor: move;

    &.is-locked {
      -webkit-app-region: no-drag;
      cursor: default;
    }
  }

  .lyric-area {
    flex: 1;
    position: relative;
    display: flex;
    padding-top: 0;
    padding-left: 10px;
    box-sizing: border-box;
    // align-items: center;
  }

  .lyric-content {
    text-align: left;
    width: 100%;
    padding: 10px 40px 56px;
    position: relative;
    overflow: visible;
    box-sizing: border-box;
  }

  .control-bar {
    display: flex;
    background: rgba(0, 0, 0, 0.65);
    border-radius: 24px;
    padding: 6px 18px;
    gap: 12px;
    -webkit-app-region: no-drag;
    backdrop-filter: blur(8px);
    opacity: 0;
    transform: translateY(-4px);
    pointer-events: none;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
    cursor: default;

    &.is-visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .refresh-icon {
      font-size: 26px !important;
      margin-bottom: 4px !important;
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
        // color: #409eff;
        background: rgba(64, 158, 255, 0.15);
      }

      .control-icon {
        width: 19px;
        height: 19px;
        display: block;
      }

      .control-icon-translate {
        width: 24px;
        height: 24px;
        display: block;
      }

      .control-icon-lock {
        width: 30px;
        display: block;
        margin-bottom: 4px;
      }
    }
  }

  .countdown-container {
    position: absolute;
    top: 30px;
    left: 0;
    right: auto;
    transform: translateY(-50%);
    display: flex;
    gap: 20px;
    align-items: center;
    padding-left: 40px;
    padding-right: 0;
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
