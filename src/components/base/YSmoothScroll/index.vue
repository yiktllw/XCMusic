<template>
  <div ref="container" class="scroll-container g-scrollable">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  ease: {
    type: Function,
    default: (t: number) => t, // 默认线性动画
  },
  duration: {
    type: Number,
    default: 1000, // 默认动画时长1秒
  },
});

const container = ref<HTMLElement>();
let isAnimating = false;
let startTime: number | null = null;
let startScrollTop = 0;
let targetScrollTop = 0;

const animate = (timestamp: number | null) => {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp! - startTime!;
  const progress = Math.min(elapsed / props.duration, 1);

  const easedProgress = props.ease(progress);
  const currentScroll =
    startScrollTop + (targetScrollTop - startScrollTop) * easedProgress;

  container.value!.scrollTop = currentScroll;

  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    isAnimating = false;
  }
};

const scrollTo = (target: HTMLElement, immediate?: boolean) => {
  if (isAnimating) return;

  let element;
  if (typeof target === "string") {
    element = document.getElementById(target);
  } else if (target instanceof HTMLElement) {
    element = target;
  }

  if (!element || !container.value) return;

  const containerRect = container.value.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  // 计算元素中间位置和容器中间位置的差值
  const elementMiddle =
    elementRect.top - containerRect.top + elementRect.height / 2;
  const containerMiddle = containerRect.height / 2;
  const delta = elementMiddle - containerMiddle;

  // 计算目标滚动位置并限制范围
  let newScrollTop = container.value.scrollTop + delta;
  const maxScrollTop =
    container.value.scrollHeight - container.value.clientHeight;
  newScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));

  targetScrollTop = newScrollTop;

  startScrollTop = container.value.scrollTop;
  isAnimating = true;
  startTime = null;

  if (immediate) {
    container.value.scrollTop = targetScrollTop;
    isAnimating = false;
    return;
  }
  requestAnimationFrame(animate);
};

defineExpose({
  scrollTo,
});
</script>

<style scoped>
.scroll-container {
  overflow-y: auto;
  height: 100%; /* 根据实际需求调整容器高度 */
  position: relative;
}
</style>
