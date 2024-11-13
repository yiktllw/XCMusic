<template>
  <div class="scrollable" ref="main">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
export default defineComponent({
  name: "YScroll",
  setup() {
    const main = ref<HTMLElement | null>(null);
    return { main };
  },
  props: {
    needListener: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      disposable: [] as ((e: Event) => void)[],
      scrollTimeout: null as NodeJS.Timeout | null,
    };
  },
  methods: {
    scrollToTop() {
      this.main!.scrollTop = 0;
    },
    scrollToBottom() {
      this.main!.scrollTop = this.main!.scrollHeight;
    },
    scrollToQuery(query: string) {
      try {
        const el = this.main!.querySelector(query);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } catch (error) {
        console.error(error);
      }
    },
    handleScrollEnd(event: Event) {
      this.disposable.forEach((callback) => callback(event));
    },
    handleScroll(event: Event) {
      // if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
      // this.scrollTimeout = setTimeout(() => {
      this.handleScrollEnd(event);
      // }, 18);
    },
    addScrollEndListener(callback: (e: Event) => void) {
      this.disposable.push(callback);
    },
  },
  mounted() {
    if (this.needListener)
      this.main!.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    this.main?.removeEventListener("scroll", this.handleScroll);
    this.main = null;
  },
});
</script>

<style lang="scss" scoped>
.scrollable {
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
  -webkit-user-drag: none;
  // scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 6px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(var(--foreground-color-rgb), 0.1);
    /* 滚动条滑块背景 */
  }

  &:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgba(var(--foreground-color-rgb), 0.2);
    /* 滚动条滑块悬停背景 */
  }
}
</style>
