<template>
  <!-- markdown预览器(仅限README.md和CHANGELOG.md) -->
  <div class="font-color-main md" ref="md" v-html="markdownContent"></div>
</template>

<script src="./YMarkdownView.ts" lang="ts"></script>

<style lang="scss" scoped>
.md {
  padding: 20px 60px;
  font-size: 18px;
  line-height: 1.6;
  text-align: left;
}
</style>
