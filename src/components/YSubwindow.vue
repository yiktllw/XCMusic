<template>
  <div class="subwindow">
    <div class="subwindow-header">
      <div class="subwindow-controls">
        <button @click="closeSubwindow">X</button>
      </div>
    </div>
    <div class="subwindow-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "YSubwindow",
  methods: {
    closeSubwindow() {
      this.$emit("close-subwindow");
    },
  },
});
</script>

<style lang="scss" scoped></style>
