<template>
  <div class="g-scrollable" ref="main">
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
    handleScroll(event: Event) {
      this.disposable.forEach((callback) => callback(event));
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
</style>
