<template>
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

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    trigger: {
      type: HTMLElement,
      default: null,
    },
    defaultShow: {
      type: Boolean,
      default: false,
    },
    slideDirection: {
      type: Number,
      default: 1,
    },
    slideDistance: {
      type: Number,
      default: 20,
    },
    animationTime: {
      type: Number,
      default: 0.15,
    },
    zIndex: {
      type: Number,
      default: 100,
    },
    hideMode: {
      type: String,
      default: "if",
      validator: function (value) {
        return value === "if" || value === "show";
      },
    },
  },
  setup() {
    const panel = ref<HTMLElement | null>(null);
    return {
      panel,
    };
  },
  name: "YPanel",
  data() {
    return {
      showPanel: false,
      timeout: null as NodeJS.Timeout | null,
    };
  },
  emits: ["update:modelValue", "show-panel", "close-panel", "mounted"],
  computed: {
    _animationTime() {
      return this.animationTime + "s";
    },
    slideDistanceXY() {
      return (this.slideDistance * Math.sqrt(2)) / 2;
    },
    slideTransform() {
      const directions = [
        `translateY(-${this.slideDistance}px)`,
        `translate(${this.slideDistanceXY}px, -${this.slideDistanceXY}px)`,
        `translateX(${this.slideDistance}px)`,
        `translate(${this.slideDistanceXY}px, ${this.slideDistanceXY}px)`,
        `translateY(${this.slideDistance}px)`,
        `translate(-${this.slideDistanceXY}px, ${this.slideDistanceXY}px)`,
        `translateX(-${this.slideDistance}px)`,
        `translate(-${this.slideDistanceXY}px, -${this.slideDistanceXY}px)`,
        "",
        "",
      ];
      return directions[this.slideDirection - 1];
    },
  },
  watch: {
    showPanel(val) {
      if (val) {
        window.addEventListener("click", this.handleClickOutside);
        this.$emit("show-panel");
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.$emit("mounted");
        }, this.animationTime * 1000);
      } else {
        window.removeEventListener("click", this.handleClickOutside);
        this.$emit("close-panel");
      }
    },
  },
  methods: {
    tooglePanel() {
      this.showPanel = !this.showPanel;
    },
    _showPanel() {
      this.showPanel = true;
    },
    closePanel() {
      this.showPanel = false;
    },
    handleClickOutside(event: MouseEvent) {
      const panelDom = this.panel?.querySelector("#panel");

      if (this.trigger && panelDom) {
        let { top, left, right, bottom } = panelDom.getBoundingClientRect();
        let {
          top: top2,
          left: left2,
          right: right2,
          bottom: bottom2,
        } = this.trigger.getBoundingClientRect();
        const isContained =
          panelDom?.contains(event.target as Node) ||
          (top <= event.clientY &&
            event.clientY <= bottom &&
            left <= event.clientX &&
            event.clientX <= right);
        const isTriggerContained =
          this.trigger.contains(event.target as Node) ||
          (top2 <= event.clientY &&
            event.clientY <= bottom2 &&
            left2 <= event.clientX &&
            event.clientX <= right2);
        if (
          this.panel &&
          !isContained &&
          !isTriggerContained &&
          this.showPanel
        ) {
          this.showPanel = false;
          console.log("handleClickOutside and close panel");
        }
      } else if (panelDom) {
        if (
          this.panel &&
          !this.panel.contains(event.target as Node) &&
          this.showPanel
        ) {
          this.showPanel = false;
          console.log("No trigger, handleClickOutside and close panel");
        }
      }
    },
  },
  mounted() {
    if (this.defaultShow) {
      this.showPanel = true;
    }
  },
  beforeUnmount() {
    window.removeEventListener("click", this.handleClickOutside);
    this.panel = null;
    if (this.timeout) clearTimeout(this.timeout);
  },
});
</script>

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
