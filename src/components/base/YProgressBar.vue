<template>
  <!-- 横版进度条 -->
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
          transform: `translateX(clamp(0px, calc(${mouseProgress * 100}vw - 30px), calc(100vw - 50px))`,
        }"
      >
        {{ formatDuration(mouseProgress) }}
        <span class="lyric" v-if="currentLyric.length > 0">
          &nbsp;{{ currentLyric }}
        </span>
      </div>
      <div class="progress-track" v-if="showTrack"></div>
    </div>
  </div>
</template>

<script src="./YProgressBar.ts" lang="ts"></script>

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
      color: var(--font-color-high);
      font-size: 14px;
      font-weight: bold;
      padding: 5px 10px;
      border-radius: 5px;
      z-index: 2;
      box-shadow: rgba($color: #000, $alpha: 0.4) 0 0 3px 0;

      display: flex;
      flex-wrap: nowrap;

      .lyric {
        height: 20px;
        max-width: 160px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      &::after {
        content: "";
        position: absolute;
        bottom: -10px;
        /* 控制尖角距离矩形的距离 */
        left: 30px;
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
