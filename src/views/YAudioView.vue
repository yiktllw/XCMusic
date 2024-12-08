<template>
  <!-- 音频调试界面 -->
  <div class="main font-color-main">
    <div class="gain">
      <input
        type="range"
        min="0"
        max="3"
        step="0.1"
        v-model="currentGain"
        :style="{
          width: '321px',
        }"
      />
    </div>
    {{ currentGain }}
    <div class="apply" @click="applyGain" style="cursor: pointer">点击应用</div>
  </div>
</template>

<script src="./YAudioView.ts" lang="ts"></script>

<style lang="scss" scoped>
.main {
}
</style>
