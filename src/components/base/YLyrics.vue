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

<script src="./YLyrics.ts" lang="ts"></script>

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
