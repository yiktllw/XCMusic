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
    default: (t: number) => t,
  },
  duration: {
    type: Number,
    default: 1000,
  },
});

const container = ref<HTMLElement>();
let rafId: number | null = null;
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
    rafId = requestAnimationFrame(animate);
  } else {
    rafId = null;
  }
};

const scrollTo = (target: HTMLElement | string, immediate?: boolean) => {
  // 取消正在进行的动画
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  let element;
  if (typeof target === "string") {
    element = document.getElementById(target);
  } else if (target instanceof HTMLElement) {
    element = target;
  }

  if (!element || !container.value) return;

  const containerRect = container.value.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  const elementMiddle =
    elementRect.top - containerRect.top + elementRect.height / 2;
  const containerMiddle = containerRect.height / 2;
  const delta = elementMiddle - containerMiddle;

  let newScrollTop = container.value.scrollTop + delta;
  const maxScrollTop =
    container.value.scrollHeight - container.value.clientHeight;
  newScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));

  targetScrollTop = newScrollTop;
  startScrollTop = container.value.scrollTop;
  startTime = null;

  if (immediate) {
    container.value.scrollTop = targetScrollTop;
    return;
  }

  rafId = requestAnimationFrame(animate);
};

defineExpose({
  scrollTo,
});
</script>

<style scoped>
.scroll-container {
  overflow-y: auto;
  height: 100%;
  position: relative;
}
</style>
