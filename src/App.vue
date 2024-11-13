<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { Doc } from "./utils/document";

export default defineComponent({
  name: "App",
  computed: {},
  setup() {
    const store = useStore();
    return {
      setting: store.state.setting,
    };
  },
  mounted() {
    this.$router.push({ path: "/greeting" });
    // 初始化缩放
    if (window.electron?.isElectron) {
      window.electron.ipcRenderer.send(
        "zoom",
        parseFloat(this.setting.display.zoom.toString()),
      );
      window.electron.ipcRenderer.on("fullscreen-window-size", (event) => {
        const autoScale =
          localStorage.getItem("setting.display.fullscreenAutoZoom") === "true";
        if (!autoScale) return;
        const { width, height } = event;
        const scalex = width / 1280;
        const scaley = height / 800;
        const scale = Math.min(scalex, scaley);
        console.log("fullscreen size: ", width, height, "scale: ", scale);
        window.electron.ipcRenderer.send("zoom", scale);
      });
      window.electron.ipcRenderer.on("leave-fullscreen", () => {
        window.electron.ipcRenderer.send(
          "zoom",
          parseFloat(this.setting.display.zoom.toString()),
        );
      });
    }
    // 初始化用户自定义主题
    Doc.updateDocumentClassBySetting(this.setting.display.userCustomThemes);
    // 初始化主题
    document.body.className = `theme-${this.setting.display.theme}`;
    // 初始化语言
    this.$i18n.locale = this.setting.display.language;
    // 初始化用来控制滚动位置的全局变量
    window.savedPositions = {};
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
