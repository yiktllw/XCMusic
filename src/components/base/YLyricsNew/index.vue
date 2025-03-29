<template>
  <YSmoothScroll
    :duration="500"
    :ease="(t: number) => t * (2 - t)"
    style="overflow-x: hidden; display: flex; flex-direction: row"
    ref="smoothScroll"
  >
    <div
      :style="{
        '--lyrics-font-size': `${preferences.fontSize}px`,
        '--lyrics-font-family': `${preferences.fontFamily}`,
        '--lyrics-padding-top': `${preferences.paddingTop}px`,
        '--lyrics-padding-bottom': `${preferences.paddingTop}px`,
        '--lyrics-font-weight': `${preferences.fontWeight}`,
      }"
    >
      <div style="height: 50%" />
      <div
        ref="container"
        class="font-color-main container lyrics-new-container"
      ></div>
      <div style="height: 50%" />
    </div>
    <div style="width: 25%; height: 100%" />
  </YSmoothScroll>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useStore } from "vuex";
import {
  parseNcmLrc,
  parseNcmYrc,
  TimeSpan,
  type IYrcItem,
} from "@yiktllw/lrc-parser";
import { Lyrics } from "@/utils/api";
import { PlayerEvents } from "@/dual/player";
import { isLocal } from "@/utils/localTracks_renderer";
import YSmoothScroll from "@/components/base/YSmoothScroll/index.vue";
import { defaultPreferences, type ILyricsPreferences } from "./utils";

/** 时间线接口 */
type ITimelineItems = Array<{
  startTime: TimeSpan;
  endTime: TimeSpan | null;
  elementIndex: {
    line: number;
    word: number;
    total: number;
  };
}>;

const smoothScroll = ref<InstanceType<typeof YSmoothScroll>>();

/** 歌词 */
const lyrics = ref<IYrcItem[]>([]);
/** 歌词偏好设置 */
const preferences = ref<ILyricsPreferences>({ ...defaultPreferences });
/** 系统字体 */
const systemFonts = ref<string[]>([]);
if (window.electron?.isElectron) {
  window.electron.ipcRenderer.invoke("get-fonts").then((fonts) => {
    systemFonts.value = fonts;
  });
}
/** 时间线 */
const timeline = ref<ITimelineItems>();
/** 以index为键的时间线的Hash Map */
const timelineMap = ref<Map<number, ITimelineItems[number]>>();
/** 逐字动画 */
const animations = ref<Array<Animation>>([]);
/** 行动画（缩放） */
const lineAnimations = ref<Array<Animation>>([]);
/** 背景行动画 */
const _lineAnimations = ref<Array<Animation>>([]);
/** requestAnimationFrame的id */
const animationFrame = ref<number>();
/** 当前逐字动画的位置 */
const animationIndex = ref<number>(0);
/** 当前行的位置 */
const currentLineIndex = ref<number>(0);
/** 行元素，用于滚动到当前行 */
const lineElements = ref<Array<HTMLElement>>([]);
/** 行元素（背景） */
const _lineElements = ref<Array<HTMLElement>>([]);
/** 在用户滚动后，暂时禁止自动滚动 */
const doNotScrollToCurrentLine = ref(false);
const doNotScrollToCurrentLineTimeout = ref<NodeJS.Timeout>();

/** 主容器 */
const container = ref<HTMLElement>();

const store = useStore();
const player = store.state.player;

/** 计算歌词dom和动画 */
const computeLyricsElements = () => {
  // 清空原有的元素和动画
  container.value!.innerHTML = "";
  lineElements.value = [];
  animations.value.forEach((item) => item.cancel());
  animations.value = [];
  lineAnimations.value.forEach((item) => item.cancel());
  lineAnimations.value = [];
  _lineAnimations.value.forEach((item) => item.cancel());
  _lineAnimations.value = [];

  // 生成新的元素，并计算动画
  animations.value = lyrics.value.flatMap((line) => {
    const lineKeyframes = [
      { transform: "scale(1)", opacity: 0 },
      { transform: "scale(1.3)", opacity: 1 },
    ];
    const _lineKeyframes = [
      { transform: "scale(1)" },
      { transform: "scale(1.3)" },
    ];
    // eslint-disable-next-line no-undef
    const lineOptions: KeyframeAnimationOptions = {
      duration: 200,
      easing: "ease-out",
      fill: "forwards",
    };

    // 生成行元素
    const lineElement = document.createElement("div");
    lineElement.className = "lyrics-new-line";
    lineElement.style.transformOrigin = "left center";
    container.value?.appendChild(lineElement);
    lineElements.value.push(lineElement);

    // 生成行动画
    const lineAnimation = lineElement.animate(lineKeyframes, lineOptions);
    lineAnimation.pause();
    lineAnimations.value.push(lineAnimation);

    // 生成背景行元素
    const _lineElement = document.createElement("div");
    _lineElement.className = "lyrics-new-line";
    _lineElement.style.transformOrigin = "left center";
    _lineElement.style.position = "absolute";
    _lineElements.value.push(_lineElement);
    container.value?.appendChild(_lineElement);

    // 生成背景行动画
    const _lineAnimation = _lineElement.animate(_lineKeyframes, lineOptions);
    _lineAnimation.pause();
    _lineAnimations.value.push(_lineAnimation);

    // 返回逐字动画
    return line.words.map((word) => {
      // 生成逐字元素
      const wordElement = document.createElement("span");
      wordElement.innerText = word.text;
      lineElement.appendChild(wordElement);

      // 生成逐字背景元素
      const _wordElement = document.createElement("span");
      _wordElement.innerText = word.text;
      _wordElement.className = "font-color-standard";
      _lineElement.appendChild(_wordElement);

      // 生成逐字动画
      const animateKeyframes = [
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0 0 0)" },
      ];
      const animate = wordElement.animate(animateKeyframes, {
        duration: word.duration.ms || 1,
        easing: "linear",
        fill: "backwards",
      });
      animate.pause();

      return animate;
    });
  });
};

/** 处理歌词元素 */
const processLyricsElements = () => {
  _lineElements.value.forEach((item) => {
    item.style.marginTop = -item.offsetHeight + "px";
  });
};

/** 计算时间线 */
const computeTimeLine = () => {
  // 生成时间线
  timeline.value = lyrics.value
    .flatMap((line, lineIndex) =>
      line.words.map((word, wordIndex) => ({
        startTime: word.startTime as TimeSpan,
        elementIndex: { line: lineIndex, word: wordIndex },
      })),
    )
    .map((item, index, arr) => ({
      ...item,
      endTime: arr[index + 1]?.startTime ?? null,
      elementIndex: { ...item.elementIndex, total: index },
    }));

  // 生成时间线的Hash Map
  timelineMap.value = new Map(
    timeline.value!.map((item) => [item.elementIndex.total, item]),
  );
};

/** 开始从audio更新时间 */
const startTimeUpdate = () => {
  if (animationFrame.value) cancelAnimationFrame(animationFrame.value);

  const update = () => {
    const currentTime = player._audio.currentTime * 1000;
    animationIndex.value = timeline.value!.findIndex(
      (item) =>
        currentTime >= item.startTime.ms &&
        (item.endTime === null || currentTime < item.endTime.ms),
    );
    requestAnimationFrame(update);
  };

  animationFrame.value = requestAnimationFrame(update);
};

/** 用户滚动时禁止自动滚动 */
const handleUserScroll = () => {
  doNotScrollToCurrentLineTimeout.value &&
    clearTimeout(doNotScrollToCurrentLineTimeout.value);

  doNotScrollToCurrentLine.value = true;
  doNotScrollToCurrentLineTimeout.value = setTimeout(() => {
    doNotScrollToCurrentLine.value = false;
    scrollToCurrentLine();
  }, 3000);
};

/** 滚动到当前行 */
const scrollToCurrentLine = (immediate?: boolean) => {
  if (doNotScrollToCurrentLine.value) return;
  smoothScroll.value!.scrollTo(
    lineElements.value[currentLineIndex.value],
    immediate,
  );
};

const no_lyrics_element = {
  startTime: new TimeSpan(0, "ms"),
  duration: new TimeSpan(0, "ms"),
  words: [
    {
      startTime: new TimeSpan(0, "ms"),
      duration: new TimeSpan(0, "ms"),
      text: "暂无歌词",
    },
  ],
};

onMounted(() => {
  player.subscriber.on("YLyricsNew", PlayerEvents.track, () => {
    // 重置索引
    animationIndex.value = 0;
    currentLineIndex.value = 0;
    container.value!.scrollTop = 0;

    player.subscriber.off("YLyricsNew", PlayerEvents.playState);
    if (!player.currentTrack?.id || isLocal(player.currentTrack.id)) return;

    // 获取歌词
    Lyrics.getLyricOriginalStr(player.currentTrack.id).then((res) => {
      if (!res?.data) {
        lyrics.value = [no_lyrics_element];
      } else if (res.type === "lrc") {
        // 解析lrc歌词并转换为yrc歌词
        lyrics.value = parseNcmLrc(res.data).map((item) => ({
          startTime: item.startTime,
          duration: new TimeSpan(0, "ms"),
          words: [
            {
              startTime: item.startTime,
              duration: new TimeSpan(0, "ms"),
              text: item.text,
            },
          ],
        }));
      } else if (res.type === "yrc") {
        // 解析yrc歌词
        lyrics.value = parseNcmYrc(res.data);
      }

      if (lyrics.value.length === 0) lyrics.value = [no_lyrics_element];

      computeTimeLine();
      computeLyricsElements();
      processLyricsElements();
      startTimeUpdate();
      scrollToCurrentLine(true);

      // 播放状态变化时，控制动画
      player.subscriber.on("YLyricsNew", PlayerEvents.playState, () => {
        animations.value[animationIndex.value][player.playState]();
      });
    });
  })?.();

  container.value?.addEventListener("wheel", handleUserScroll);
  container.value?.addEventListener("touchmove", handleUserScroll);
});

onBeforeUnmount(() => {
  player.subscriber.offAll("YLyricsNew");
  animationFrame.value && cancelAnimationFrame(animationFrame.value);

  container.value?.removeEventListener("wheel", handleUserScroll);
  container.value?.removeEventListener("touchmove", handleUserScroll);
});

// 监听动画位置变化
watch(animationIndex, () => {
  if (animationIndex.value === -1) return;

  currentLineIndex.value = timelineMap.value!.get(
    animationIndex.value,
  )!.elementIndex.line;

  animations.value.forEach((item, index) => {
    if (index === animationIndex.value) {
      // 播放当前逐字动画
      item.play();
    } else if (
      index < animationIndex.value &&
      currentLineIndex.value ===
        timelineMap.value!.get(index)!.elementIndex.line
    ) {
      // 当前行之前的逐字动画设为完成
      item.finish();
    } else if (
      currentLineIndex.value ===
      timelineMap.value!.get(index)!.elementIndex.line + 1
    ) {
      item.finish();
      item.pause();
    } else {
      item.onfinish = null;
      // 其他逐字动画暂停
      item.cancel();
      item.pause();
    }
  });
});

// 监听当前行变化
watch(currentLineIndex, () => {
  scrollToCurrentLine();

  // 播放当前行动画
  const _clear = (item: Animation, index: number) => {
    if (index === currentLineIndex.value - 1) {
      item.currentTime = +(item.effect?.getTiming().duration || 0);
      item.playbackRate = -1;
      item.play();
      item.onfinish = () => {
        item.playbackRate = 1;
        item.cancel();
        item.pause();
      };
    } else {
      item.onfinish = null;
      item.playbackRate = 1;
      item.cancel();
      item.pause();
    }
  };
  lineAnimations.value.forEach(_clear);
  lineAnimations.value[currentLineIndex.value].play();

  _lineAnimations.value.forEach(_clear);
  _lineAnimations.value[currentLineIndex.value].play();
});
</script>

<style lang="scss" scoped>
.container {
  position: relative;
}
</style>

<style lang="scss">
.lyrics-new-container {
  .lyrics-new-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 20px;
    text-align: left;
    padding-left: 0;

    font-size: var(--lyrics-font-size);
    font-family: var(--lyrics-font-family);
    padding-top: var(--lyrics-padding-top);
    padding-bottom: var(--lyrics-padding-bottom);
    font-weight: var(--lyrics-font-weight);
  }
}
</style>
