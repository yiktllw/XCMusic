<template>
  <!-- 测试界面 -->
  <div class="display">
    <!-- <div
      class="button font-color-main"
      @click="$router.push({ path: '/audio/test' })"
    >
      点击跳转到音频调试界面
    </div>
    <div class="button font-color-main" @click="clearCache">
      点击清除webFrame缓存
    </div> -->
    <!-- <div class="button font-color-main" @click="setEq">
      点击设置EQ
    </div> -->
    <YSongsTableNew :options="options" />
  </div>
</template>

<script src="./YTestView.ts" lang="ts"></script>

<style lang="scss" scoped>
.display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .scrollable {
    width: 100%;
    height: 100%;
  }

  .button {
    cursor: pointer;
  }
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}
</style>
