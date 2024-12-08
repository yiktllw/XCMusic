<template>
  <!-- 频谱图组件 -->
  <canvas ref="canvas" class="canvas" v-if="showSpectrum"></canvas>
</template>

<script src="./YSpecCanvas.ts" lang="ts"></script>

<style lang="scss" scoped>
.canvas {
  width: 100%;
  height: 100%;
}
</style>
