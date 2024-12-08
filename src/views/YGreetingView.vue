<template>
  <!-- 欢迎(首页)界面 -->
  <div class="container">
    <img src="@/assets/xc-up.svg" class="up-img g-icon" />
    <img src="@/assets/xc.svg" class="full-width-image g-icon" />
    <img src="@/assets/xc-down.svg" class="down-img g-icon" />
  </div>
</template>

<script src="./YGreetingView.ts" lang="ts"></script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  // background-color: #cc77bf;

  .up-img {
    top: 20px;
    position: absolute;
    width: calc(100% - 40px);
    max-width: calc(100% - 40px);
    max-height: 10%;
  }

  .down-img {
    bottom: 20px;
    position: absolute;
    width: calc(100% - 40px);
    max-width: calc(100% - 40px);
    max-height: 10%;
  }

  .full-width-image {
    opacity: 0.9;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
