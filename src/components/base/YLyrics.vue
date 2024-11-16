<!---------------------------------------------------------------
- YiktLLW .. 2025-03-21 .. Johannes Brahms
- YLyrics.vue是用纯ts和canvas实现的歌词组件
- 为了更高效、可控地绘制歌词，同时也为了避免创建大量dom节点。
- ts部分较复杂，待优化
--------------------------------------------------------------->
<template>
  <div class="main" ref="main">
    <canvas id="lyrics-canvas" class="canvas" />
  </div>
</template>

<script lang="ts">
import { LrcItem, LrcItem2, YrcItem } from "@/utils/lyric";
import { getStorage } from "@/utils/render_storage";
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";

// 获取设备像素比
let scale = window.devicePixelRatio * (getStorage("setting.display.zoom") ?? 1);
// 行高
let lineHeight = 59 * scale;
let smallLineHeight = 30 * scale;
let MAX_LINE_WIDTH = 350 * scale; // 一行歌词的最大宽度

/** 缓动函数 */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
let now = {
  /** 现在的位置 */
  y: 0,
  /** 现在的动画进行比例 */
  t: 0,
};

/** 滚动动画 */
let scrollAnime = {
  /** 滚动动画的ID */
  anime: 0,
  /** 要求滚动到的位置 */
  scrollY: 0,
};
/** 更新时间的动画ID */
let timeAnime = 0;

interface ILyric {
  lines: Array<string>;
  /** 用于yrc，记录换行发生的index */
  breakLineOn: Array<number>;
}

let wheelLastY = 0;
let wheelTimeout: NodeJS.Timeout | null = null;

const fontColor = "#ffffff";
const fontColor2 = "rgba(255, 255, 255, 0.3)";

export default defineComponent({
  name: "YLyrics",
  setup() {
    const store = useStore();
    const main = ref<HTMLElement | null>(null);
    return {
      main,
      player: store.state.player,
    };
  },
  data() {
    return {
      timeNow: 0,
      lyrics: [] as Array<LrcItem | LrcItem2 | YrcItem>,
      formattedLyrics: [] as Array<ILyric>,
      ctx: null as CanvasRenderingContext2D | null,
      canvas: null as HTMLCanvasElement | null,
      /** 当前歌词的索引 */
      currentLyricIndex: -1,
      lastLyricIndex: -1,
      lineY: [] as Array<number>,
      noScroll: false,
      noScrollTimeout: null as NodeJS.Timeout | null,
    };
  },
  mounted() {
    this.initLyricsAnimation();

    this.main!.addEventListener("wheel", this.handleWheel);

    this.$nextTick(() => {
      now.y = 0;
      this.drawLyrics(0);
      this.formattedLyrics = this.formatLyrics(this.lyrics);
      this.handleLyricsChange(this.lyrics);
    });

    this.lyrics = this.player.lyrics;
    this.player.subscriber.on({
      id: "YLyrics",
      type: "lyrics",
      func: () => {
        this.lyrics = this.player.lyrics;
      },
    });
    
    this.setScale();
  },
  beforeUnmount() {
    this.main!.removeEventListener("wheel", this.handleWheel);
    this.main = null;

    this.player.subscriber.offAll("YLyrics");

    cancelAnimationFrame(scrollAnime.anime);
    cancelAnimationFrame(timeAnime);

    if (wheelTimeout) clearTimeout(wheelTimeout);
    if (this.noScrollTimeout) clearTimeout(this.noScrollTimeout);
    
  },
  watch: {
    lyrics(newVal: Array<LrcItem | LrcItem2 | YrcItem>) {
      this.handleLyricsChange(newVal);
    },
    currentLyricIndex() {
      if (this.noScroll) return;
      this.scrollTo(this.lineY[this.currentLyricIndex], 600);
      this.lastLyricIndex = this.currentLyricIndex;
    },
  },
  methods: {
    setScale() {
      scale =
        window.devicePixelRatio * (getStorage("setting.display.zoom") ?? 1);
      // 行高
      lineHeight = 59 * scale;
      smallLineHeight = 30 * scale;
      MAX_LINE_WIDTH = 350 * scale; // 一行歌词的最大宽度
      
      this.canvas!.width = 600 * scale;
      this.canvas!.height = 600 * scale;
    },
    /** 处理鼠标滚动事件 */
    handleWheel(e: WheelEvent) {
      // 在用户操作的2秒内，不再自动滚动
      if (this.noScrollTimeout) clearTimeout(this.noScrollTimeout);
      this.noScroll = true;
      this.noScrollTimeout = setTimeout(() => {
        this.noScroll = false;
        this.scrollTo(this.lineY[this.currentLyricIndex], 600);
      }, 2000);

      // 滚动的时间
      const t = 300;

      if (wheelTimeout) clearTimeout(wheelTimeout);

      // 计算滚动的位置
      let y;
      if (wheelLastY === 0) y = now.y;
      else y = wheelLastY;
      y += e.deltaY / 2;

      if (
        this.canvas &&
        y > this.lineY[0] &&
        y < this.lineY[this.lineY.length - 1]
      ) {
        // 如果滚动位置在歌词范围内，滚动
        wheelLastY = y;
        this.scrollTo(y, t);
        wheelTimeout = setTimeout(() => {
          wheelLastY = 0;
        }, t);
      }
    },
    /** 处理歌词变动事件 */
    handleLyricsChange(newVal: Array<LrcItem | LrcItem2 | YrcItem>) {
      this.formattedLyrics = this.formatLyrics(newVal);
      // 计算每行歌词的Y坐标
      this.lineY = new Array(this.formattedLyrics.length, 0);
      for (let i = 0; i < this.formattedLyrics.length - 1; i++) {
        if (this.formattedLyrics[i].lines.length === 1) {
          if (this.formattedLyrics[i].lines[0] === "") {
            // 如果是空行，行高更小
            this.lineY[i + 1] = (this.lineY[i] ?? 0) + smallLineHeight;
          } else {
            // 正常行高
            this.lineY[i + 1] = (this.lineY[i] ?? 0) + lineHeight;
          }
        } else if (this.formattedLyrics[i].lines.length > 1) {
          // 如果歌词需要分行，行高更小
          this.lineY[i + 1] =
            (this.lineY[i] ?? 0) +
            lineHeight +
            smallLineHeight * (this.formattedLyrics[i].lines.length - 1);
        }
      }
      this.$nextTick(() => {
        now.y = 0;
        this.drawLyrics(now.y);
      });
    },
    /** 从现在歌曲的播放时间获取歌词的索引，更高效 */
    getIndex(time: number): number {
      if (this.lyrics.length === 0) return -1;
      if (
        this.lyrics[this.lastLyricIndex]?.startTime < time &&
        this.lyrics[this.lastLyricIndex + 1]?.startTime > time
      ) {
        return this.lastLyricIndex;
      } else if (
        this.lyrics[this.lastLyricIndex + 2]?.startTime > time &&
        this.lyrics[this.lastLyricIndex + 1]?.startTime < time
      ) {
        return this.lastLyricIndex + 1;
      } else {
        // 遍历查找
        for (let i = 0; i < this.lyrics.length; i++)
          if (this.lyrics[i].startTime > time) return i - 1;
        return this.lyrics.length - 1;
      }
    },
    /** 初始化画板 */
    initLyricsAnimation() {
      this.canvas = this.main!.querySelector(
        "#lyrics-canvas"
      ) as HTMLCanvasElement;
      this.canvas.width = 600 * scale;
      this.canvas.height = 600 * scale;
      this.ctx = this.canvas.getContext("2d");

      /** 开始更新时间 */
      const time = () => {
        this.timeNow = this.player._audio.currentTime;

        // 获取当前歌词的索引，如果不是当前歌词，更新歌词
        const index = this.getIndex(this.timeNow * 1000);
        if (index !== this.currentLyricIndex) {
          this.currentLyricIndex = index;
          this.drawLyrics(now.y);
        } else if (this.lyrics[0]?.type === "yrc") {
          // 逐字歌词每一帧都要更新
          this.drawLyrics(now.y);
        }
        timeAnime = requestAnimationFrame(time);
      };
      time();
    },

    /**
     * 滚动到指定位置的函数
     * 滚动是可以取消的，如果有新的请求，会取消之前的请求
     * @param scrollY 滚动到的位置
     * @param scrollDuration 滚动动画的时间
     */
    scrollTo(scrollY: number, scrollDuration: number) {
      // 如果有未完成的动画，取消此动画
      if (scrollAnime.anime) cancelAnimationFrame(scrollAnime.anime);
      // 获取滚动的距离
      const dY = scrollY - now.y;
      if (dY === 0) return;
      /** 开始动画的位置 */
      const startY = now.y;
      /** 动画已经完成的时间 */
      let animationOffset = 0;
      if (now.t !== 0) {
        /** 开始动画的时间段 */
        scrollDuration = scrollDuration / (1 - now.t);
        animationOffset = scrollDuration * now.t;
      }
      const startTime = Date.now();

      // 开始动画循环
      const animate = () => {
        // 更新时间（可以通过播放器的 currentTime 获取当前时间）
        this.timeNow = this.player._audio.currentTime;

        // 计算时间比例
        now.t = Math.max(
          Math.min(
            1,
            (Date.now() - startTime + animationOffset) / scrollDuration
          ),
          0
        );

        // 计算滚动位置
        now.y =
          startY +
          dY * easeInOutCubic(now.t) -
          dY * easeInOutCubic(animationOffset / scrollDuration);

        // 每一帧更新歌词
        this.drawLyrics(now.y);

        // 判断是否结束动画
        if (now.t < 1) {
          // 请求下一帧
          scrollAnime.anime = requestAnimationFrame(animate);
        } else {
          now.t = 0;
        }
      };

      // 启动动画
      animate();
    },

    /** 在scrollY处绘制歌词的函数 */
    drawLyrics(scrollY: number) {
      if (!this.ctx || !this.canvas || this.lyrics.length === 0) return;

      const fontSize = 20 * scale; // 字体大小

      // 设置字体样式
      this.ctx.font = `bold ${fontSize}px Avenir, Helvetica, Arial, sans-serif`;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // 清除画布

      // // 绘制已显示的歌词

      for (let i = 0; i < this.formattedLyrics.length; i++) {
        // 跳过不在显示范围内的歌词
        const dist = this.lineY[i] - now.y;
        if (Math.abs(dist) > this.canvas.height / 2 + lineHeight) continue;

        // 开始绘制的位置
        const startY = this.lineY[i] - scrollY + this.canvas.height / 2;

        if (this.formattedLyrics[i].lines.length === 1) {
          // 绘制无分行的歌词
          const text = this.formattedLyrics[i].lines[0];

          // 颜色动画和字体大小动画
          this.ctx.fillStyle = this.dyToColor(dist);
          this.ctx.font = `bold ${this.dyToSize(dist)}px Avenir, Helvetica, Arial, sans-serif`;

          let drawDone = false;

          if (this.lyrics[i].type === "yrc" && this.currentLyricIndex === i) {
            // 逐字歌词动画
            this.ctx.save();
            this.ctx.fillStyle = fontColor2;
            const data = this.lyrics[i] as YrcItem;

            if (data.duration) {
              // 找到当前时间所在的词
              let index = -1;
              // 拼接这一行的歌词
              let tmpLine = "";
              for (let j = 0; j < data.words.length; j++) {
                const word = data.words[j];
                tmpLine += word.text;
                if (
                  this.timeNow * 1000 > word.startTime &&
                  this.timeNow * 1000 < word.duration + word.startTime
                ) {
                  index = j;
                  break;
                }
              }

              if (index !== -1) {
                // 计算当前词的宽度
                const wordWidth = this.ctx.measureText(
                  data.words[index].text
                ).width;
                // 计算当前行的宽度
                const tmpLineWidth = this.ctx.measureText(tmpLine).width;
                // 计算当前词的进度
                const progress =
                  (this.timeNow * 1000 - data.words[index].startTime) /
                  data.words[index].duration;
                // 计算当前词的位置
                const x = tmpLineWidth - wordWidth + wordWidth * progress;

                // 绘制被裁剪的白色文字
                this.ctx.save();

                // 裁剪
                this.ctx.beginPath();
                this.ctx.rect(
                  0,
                  startY - lineHeight,
                  x,
                  startY + lineHeight + 10
                );
                this.ctx.clip();

                // 绘制
                this.ctx.fillStyle = this.dyToColor(dist);
                this.ctx.fillText(text, 0, startY);
                drawDone = true;

                this.ctx.restore();

                // 绘制被裁剪的底色文字
                this.ctx.beginPath();
                this.ctx.rect(
                  x,
                  startY - lineHeight,
                  this.canvas.height,
                  startY + lineHeight + 10
                );
                this.ctx.clip();
                this.ctx.fillText(text, 0, startY);
              }
            }
            this.ctx.restore();
          }
          // 绘制这一行歌词
          if (!drawDone) this.ctx.fillText(text, 0, startY);
        } else {
          // 绘制有分行(过长)的逐字歌词
          for (let j = 0; j < this.formattedLyrics[i].lines.length; j++) {
            const text = this.formattedLyrics[i].lines[j];

            // 颜色动画和字体大小动画
            this.ctx.fillStyle = this.dyToColor(dist);
            this.ctx.font = `bold ${this.dyToSize(dist)}px Avenir, Helvetica, Arial, sans-serif`;

            let drawDone = false;

            if (this.lyrics[i].type === "yrc" && this.currentLyricIndex === i) {
              // 逐字歌词动画
              this.ctx.save();
              this.ctx.fillStyle = fontColor2;
              const data = this.lyrics[i] as YrcItem;
              if (data.duration) {
                // 找到当前时间所在的词
                let index = -1;
                // 拼接这一行的歌词
                let tmpLine = "";
                for (let k = 0; k < data.words.length; k++) {
                  const word = data.words[k];

                  if (
                    k <=
                      (this.formattedLyrics[i].breakLineOn[j] ??
                        data.words.length) &&
                    k >= (this.formattedLyrics[i].breakLineOn[j - 1] ?? 0)
                  ) {
                    // 如果是这一分行的词
                    tmpLine += word.text;
                  }
                  if (
                    this.timeNow * 1000 > word.startTime &&
                    this.timeNow * 1000 < word.duration + word.startTime
                  ) {
                    // 找到当前词在YrcItem中的索引
                    index = k;
                    break;
                  }
                }
                // 如果找到了当前词
                if (index !== -1) {
                  // 计算当前词的宽度
                  const wordWidth = this.ctx.measureText(
                    data.words[index].text
                  ).width;
                  // 计算当前行的宽度
                  const tmpLineWidth = this.ctx.measureText(tmpLine).width;
                  // 计算当前词的进度
                  const progress =
                    (this.timeNow * 1000 - data.words[index].startTime) /
                    data.words[index].duration;
                  // 计算当前词的位置
                  let x = tmpLineWidth - wordWidth + wordWidth * progress;

                  // 如果已经换到下一行，x 重置为最大
                  if (index >= this.formattedLyrics[i].breakLineOn[j]) {
                    x = tmpLineWidth;
                  }

                  // 绘制被裁剪的白色文字
                  this.ctx.save();

                  // 裁剪
                  this.ctx.beginPath();
                  this.ctx.rect(
                    0,
                    startY - smallLineHeight + j * smallLineHeight,
                    x,
                    startY + smallLineHeight * j
                  );
                  this.ctx.clip();

                  // 绘制
                  this.ctx.fillStyle = this.dyToColor(dist);
                  this.ctx.fillText(text, 0, startY + j * smallLineHeight);
                  drawDone = true;

                  this.ctx.restore();

                  // 绘制被裁剪的底色文字
                  this.ctx.beginPath();
                  this.ctx.rect(
                    x,
                    startY - smallLineHeight + j * smallLineHeight,
                    this.canvas.height,
                    startY + smallLineHeight * j
                  );
                  this.ctx.clip();
                  this.ctx.fillText(text, 0, startY + j * smallLineHeight);
                }
              }
              this.ctx.restore();
            }
            // 绘制这一行歌词
            if (!drawDone)
              this.ctx.fillText(text, 0, startY + j * smallLineHeight);
          }
        }
      }
    },

    /** 根据与中间位置的差值计算颜色 */
    dyToColor(dy: number) {
      const ratio = Math.abs(dy) / smallLineHeight;
      // 如果超过2倍行高，颜色为灰色
      if (ratio > 1) return fontColor2;
      // 如果小于0.1倍行高，颜色为白色
      else if (ratio < 0.1) return fontColor;
      // 否则，颜色渐变
      let alpha = 1.07 - ratio * 0.77;

      return `rgba(255, 255, 255, ${alpha})`;
    },

    /** 根据与中间位置的差值计算字体大小 */
    dyToSize(dy: number) {
      const ratio = Math.abs(dy) / lineHeight;
      // 如果超过1倍行高，字体大小为20
      if (ratio > 1) return 20 * scale;
      // 如果小于0.1倍行高，字体大小为25
      else if (ratio < 0.1) return 25 * scale;
      // 否则，字体大小渐变
      return 25 * scale - ratio * 5 * scale;
    },

    // 格式化歌词内容
    formatLyrics(lyrics: Array<LrcItem | LrcItem2 | YrcItem>): Array<ILyric> {
      let res = [] as Array<ILyric>;

      for (const lyric of lyrics) {
        // 遍历歌词，根据歌词类型进行格式化
        if (lyric.type === "lrc" && Array.isArray(lyric.content)) {
          // 如果是 lrc，且content是数组(特殊内容)
          res.push({
            lines: [lyric.content.map((line) => line.tx).join(" ")],
            breakLineOn: [0],
          });
        } else if (lyric.type === "lrc") {
          // 如果是 lrc，且content是字符串
          let content = lyric.content as string;

          /** 用来存储单行的内容 */
          let singleLine = "";

          /** 用来存储原本的单行被分割后的结果 */
          let result = [] as Array<string>;

          // 遍历每个字符，如果当前行的宽度小于500，就继续添加字符，否则就换行
          for (let i = 0; i < content.length; i++) {
            if (this.ctx!.measureText(singleLine).width < MAX_LINE_WIDTH) {
              singleLine += content[i];
            } else {
              singleLine += content[i];
              result.push(singleLine);
              singleLine = "";
            }
          }

          result.push(singleLine);
          // 返回结果
          res.push({
            lines: result,
            breakLineOn: [0],
          });
        }
        if (lyric.type === "yrc") {
          let result = [] as Array<string>;

          let singleLine = "";

          let breakLineOn = [] as Array<number>;

          // 遍历每个词，如果当前行的宽度小于500，就继续添加词，否则就换行
          for (let i = 0; i < lyric.words.length; i++) {
            if (this.ctx!.measureText(singleLine).width < MAX_LINE_WIDTH) {
              singleLine += lyric.words[i].text;
            } else {
              singleLine += lyric.words[i].text;
              breakLineOn.push(i);
              result.push(singleLine);
              singleLine = "";
            }
          }

          result.push(singleLine);
          res.push({
            lines: result,
            breakLineOn,
          });
        }
      }
      return res;
    },
  },
});
</script>

<style lang="scss" scoped>
.main {
  width: 600px;
  height: 600px;

  .canvas {
    width: 600px;
    height: 600px;
  }
}
</style>
