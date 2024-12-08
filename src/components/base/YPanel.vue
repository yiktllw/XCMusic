<template>
  <!-- 面板组件，在外部点击时自动关闭，可以设置滑动动画的方向和时间 -->
  <div>
    <transition
      name="slide-fade"
      v-bind:style="{
        '--slide-transform': slideTransform,
        '--animation-time': _animationTime,
        '--z-indez': zIndex,
      }"
      v-if="hideMode === 'if'"
    >
      <div class="panel" v-if="showPanel" ref="panel">
        <slot></slot>
      </div>
    </transition>
    <transition
      name="slide-fade"
      v-bind:style="{
        '--slide-transform': slideTransform,
        '--animation-time': _animationTime,
        '--z-indez': zIndex,
      }"
      v-if="hideMode === 'show'"
    >
      <div class="panel" v-show="showPanel" ref="panel">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script src="./YPanel.ts" lang="ts"></script>

<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all var(--animation-time) ease-out;
}

.slide-fade-leave-active {
  transition: all var(--animation-time) cubic-bezier(1, 0.5, 0.8, 1);
  z-index: var(--z-indez);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: var(--slide-transform);
  opacity: 0;
  z-index: var(--z-indez);
}

.panel {
  position: relative;
  margin: 0;
  padding: 0;
  background-color: transparent;
  z-index: var(--z-indez);
}
</style>
