<template>
  <!-- markdown预览器(仅限README.md和CHANGELOG.md) -->
  <div class="font-color-main md" ref="md" v-html="markdownContent"></div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { marked } from "marked";
import README from "@/../README.md";
import CHANGELOG from "@/../CHANGELOG.md";
import { YColor } from "@/utils/color";

let path: null | any = null,
  shell: null | any = null;
if (window.electron?.isElectron) {
  path = window.api.path;
  shell = window.electron.shell;
}

const renderer = new marked.Renderer();
renderer.image = ({
  href,
  title,
  text,
}: {
  href: string;
  title?: string | null | undefined;
  text: string;
}) => {
  return `<img src="${href}" alt="${text}" style="max-width: 100%;"/>`;
};

marked.setOptions({
  renderer: renderer,
});

export default defineComponent({
  name: "YMarkdownView",
  props: {
    file: {
      type: String,
      required: true,
    },
  },
  setup() {
    const md = ref<HTMLElement | null>(null);
    return {
      md,
    };
  },
  computed: {
    markdownContent() {
      if (!this.file) {
        return "";
      }
      if (this.file === "README") {
        return marked.parse(README);
      } else if (this.file === "CHANGELOG") {
        return marked.parse(CHANGELOG);
      }
    },
  },
  methods: {
    handleLinkClick(e: MouseEvent) {
      if (e.target instanceof HTMLAnchorElement) {
        e.preventDefault();
        if (
          shell &&
          e.target.href &&
          e.target.href.startsWith("http") &&
          !e.target.href.startsWith("http://localhost")
        ) {
          shell.openExternal(e.target.href);
        }
      } else if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    },
  },
  mounted() {
    YColor.setBackgroundColorHex2(YColor.stringToHexColor(this.file === "README" ? "README" : "CHANGELOG"));
    this.md?.addEventListener("click", this.handleLinkClick);
  },
  beforeUnmount() {
    this.md?.removeEventListener("click", this.handleLinkClick);
  },
});
</script>

<style lang="scss" scoped>
.md {
  padding: 20px 60px;
  font-size: 18px;
  line-height: 1.6;
  text-align: left;
}
</style>
