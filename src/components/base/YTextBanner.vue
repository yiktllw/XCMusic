<template>
  <!-- 文字轮播组件，用于在播放栏展示歌曲名 -->
  <div class="main" ref="main_ref">
    <div
      class="scroll"
      v-bind:style="{
        '--animation-time': animationTime,
        '--animation-distance': animationDistance,
      }"
    >
      <span ref="scroll_ref" style="padding-right: 100px">
        {{ text }}
      </span>
      <span v-if="showAni">
        {{ text }}
      </span>
    </div>
  </div>
</template>

<script src="./YTextBanner.ts" lang="ts"></script>

<style lang="scss" scoped>
.main {
  display: flex;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
}
</style>
