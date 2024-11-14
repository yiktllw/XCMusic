<template>
  <div
    class="progress-bigframe ani"
    ref="big_frame"
    @mousemove="handleMousemove"
    @mouseleave="HideInfo"
    @mousedown="onMouseDown"
  >
    <div class="progress-bar" ref="progress_bar">
      <div
        :class="showTrack ? 'progress-fill' : 'progress-no-track'"
        :style="{
          clipPath: `inset( 0 ${100 - progress * 100}% 0 0 round 20px)`,
        }"
        :ref="showTrack ? 'noSelect' : 'progressDOM'"
      ></div>
      <div
        class="progress-pointer"
        v-if="showTrack"
        :style="{
          left: 'calc(' + progress * 100 + '%' + ' - 7px )',
        }"
        @mousedown="startSetProgress"
        @mouseup="endSetProgress"
      ></div>
      <div
        class="play-info"
        v-else-if="showInfo"
        :style="{
          left: 'calc(' + mouseProgress * 100 + '%' + ' - 30px )',
        }"
      >
        {{ formatDuration(mouseProgress) }}
      </div>
      <div class="progress-track" v-if="showTrack"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { formatDuration_mmss } from "@/utils/time";
import { ref, watch } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      default: 0,
      validator: (value: number) => {
        return value >= 0 && value <= 1;
      },
    },
    /** 是否显示轨道 */
    showTrack: {
      type: Boolean,
      default: true,
    },
    totalTime: {
      type: Number,
      default: 100,
    },
  },
  name: "YProgressBar",
  data() {
    return {
      mouseProgress: 0,
      showInfo: false,
    };
  },
  emits: ["update:modelValue", "set-progress-end"],
  setup(props) {
    // progress 的本地状态
    const progress = ref(props.modelValue);

    // 监听 modelValue 的变化
    watch(
      () => props.modelValue,
      (newValue) => {
        progress.value = newValue;
      }
    );

    const progress_bar = ref<HTMLElement | null>(null);
    const big_frame = ref<HTMLElement | null>(null);
    const progressDOM = ref<HTMLElement | null>(null);
    const noSelect = ref<HTMLElement | null>(null);

    return {
      progress,
      progress_bar,
      big_frame,
      progressDOM,
      noSelect,
    };
  },
  beforeUnmount() {
    window.removeEventListener("mousemove", this.updateProgressEvent);
    window.removeEventListener("mouseup", this.endSetProgress);
    this.progress_bar = null;
    this.big_frame = null;
    this.progressDOM = null;
    this.noSelect = null;
  },
  watch: {
    progress(newValue, oldValue) {
      // 在进度条归零(下一首)时，暂时移除动画
      if (newValue === 0) {
        this.big_frame?.classList.remove("ani");
        this.$nextTick(() => {
          setTimeout(() => {
            this.big_frame?.classList.add("ani");
          }, 500);
        });
      }
    },
  },
  methods: {
    updateProgress(x: number) {
      let rect = null;
      rect = this.progress_bar?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const dx = x - rect.left;
      let progress = dx / rect.width;
      if (progress < 0) {
        progress = 0;
      } else if (progress > 1) {
        progress = 1;
      }
      this.$emit("update:modelValue", progress);
    },
    updateProgressEvent(e: MouseEvent) {
      this.updateProgress(e.clientX);
    },
    onMouseDown(e: MouseEvent) {
      this.big_frame?.classList.remove("ani");
      this.updateProgress(e.clientX);
      window.addEventListener("mousemove", this.updateProgressEvent);
      window.addEventListener("mouseup", this.endSetProgress);
    },
    startSetProgress() {
      window.addEventListener("mousemove", this.updateProgressEvent);
      window.addEventListener("mouseup", this.endSetProgress);
    },
    endSetProgress() {
      window.removeEventListener("mousemove", this.updateProgressEvent);
      this.$emit("set-progress-end");
      this.$nextTick(() => {
        setTimeout(() => {
          this.big_frame?.classList.add("ani");
        }, 500);
      });
    },
    formatDuration(progress: number) {
      let duration = Math.floor(progress * this.totalTime * 1000);
      return formatDuration_mmss(duration);
    },
    handleMousemove(event: MouseEvent) {
      this.mouseProgress =
        event.clientX / (this.big_frame?.getBoundingClientRect().width || 100);
      this.showInfo = true;
    },
    HideInfo() {
      this.showInfo = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.ani {
  --transition-track-time: 1s;
}

.progress-bigframe {
  display: flex;
  width: 100%;
  height: 30px;
  align-items: center;
  position: relative;
  cursor: pointer;

  &:hover {
    .progress-bar {
      .progress-no-track {
        height: 115%;
        transform: translateY(-40%);
      }
    }
  }

  .progress-bar {
    width: 100%;
    height: 5px;
    position: relative;
    cursor: pointer;

    .progress-fill {
      width: 100%;
      height: 100%;
      background-color: rgb(var(--highlight-color-rgb));
      border-radius: 10px;
    }

    .progress-no-track {
      height: 75%;
      background: linear-gradient(to right, rgba(200, 135, 165, 0.1), #cc88aa);
      border-radius: 10px;
      transition:
        clip-path var(--transition-track-time) linear,
        height 0.3s ease,
        transform 0.3s ease;
    }

    .progress-pointer {
      width: 14px;
      height: 14px;
      background-color: #fff;
      box-shadow: -0px 0px 5px rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      position: absolute;
      top: -5px;
      z-index: 3;
      opacity: 0;
    }

    .progress-track {
      position: absolute;
      top: 0;
      width: 100%;
      height: 5px;
      background-color: rgba(var(--foreground-color-rgb), 0.21);
      border-radius: 10px;
      z-index: -1;
    }

    .play-info {
      position: absolute;
      top: -38px;
      background-color: var(--panel-background-color);
      color: var(--font-color-main);
      font-size: 14px;
      font-weight: bold;
      padding: 5px 10px;
      border-radius: 5px;
      z-index: 2;
      box-shadow: rgba($color: #000, $alpha: 0.4) 0 0 3px 0;

      &::after {
        content: "";
        position: absolute;
        bottom: -10px;
        /* 控制尖角距离矩形的距离 */
        left: 50%;
        /* 尖角居中对齐 */
        transform: translateX(-50%);
        border-width: 10px 10px 0 10px;
        border-style: solid;
        border-color: var(--panel-background-color) transparent transparent
          transparent;
      }
    }
  }
}

.progress-bigframe:hover .progress-pointer {
  opacity: 1;
}
</style>
