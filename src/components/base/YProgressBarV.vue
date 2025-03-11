<script setup lang="js">
const progress = defineModel();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits(["update:modelValue", "set-progress-end"]);
</script>

<template>
  <!-- 纵版进度条 -->
  <div class="progress-bigframe">
    <div class="progress-bar" @click="onClick" ref="progress_bar">
      <div
        class="progress-fill"
        :style="{
          clipPath: `inset( ${100 - progress * 100}% 0 0 0 round 20px)`,
        }"
      ></div>
      <div
        class="progress-pointer"
        :style="{ top: 'calc(100% - ' + progress * 100 + '%' + ' - 5px )' }"
        @mousedown="startSetProgress"
        @mouseup="endSetProgress"
      />
      <div class="progress-track" />
    </div>
  </div>
</template>

<script lang="js">
export default {
  name: "YProgressBar",
  watch: {
    progress(newValue) {
      this.key = newValue > 0.5 ? 1 : 0;
    },
  },
  methods: {
    updateProgress(y) {
      const rect = this.$refs.progress_bar.getBoundingClientRect();
      const dy = y - rect.top;
      let progress = 1 - dy / rect.height;
      if (progress < 0) {
        progress = 0;
      } else if (progress > 1) {
        progress = 1;
      }
      this.$emit("update:modelValue", progress);
    },
    updateProgressEvent(e) {
      this.updateProgress(e.clientY);
    },
    onClick(e) {
      this.updateProgress(e.clientY);
      this.$emit("set-progress-end");
    },
    startSetProgress() {
      window.addEventListener("mousemove", this.updateProgressEvent);
      window.addEventListener("mouseup", this.endSetProgress);
    },
    endSetProgress() {
      window.removeEventListener("mousemove", this.updateProgressEvent);
      this.$emit("set-progress-end");
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-bigframe {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  position: relative;

  .progress-bar {
    width: 5px;
    height: 100%;
    position: relative;
    cursor: pointer;

    .progress-fill {
      width: 100%;
      height: 100%;
      background-color: rgb(var(--highlight-color-rgb));
      border-radius: 10px;
    }

    .progress-pointer {
      width: 13px;
      height: 13px;
      left: -4px;
      background-color: #fff;
      box-shadow: -0px 0px 5px rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      position: absolute;
      z-index: 3;
    }

    .progress-track {
      top: 0;
      position: absolute;
      width: 5px;
      height: 100%;
      background-color: rgba(var(--foreground-color-rgb), 0.21);
      border-radius: 10px;
      z-index: -1;
    }
  }
}
</style>
