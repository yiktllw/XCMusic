<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { Doc } from "@/utils/document";
import { getStorage, StorageKey } from "@/utils/render_storage";

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
        parseFloat(this.setting.display.zoom.toString())
      );
      window.electron.ipcRenderer.on(
        "fullscreen-window-size",
        this.handleFullScreen
      );
      window.electron.ipcRenderer.on(
        "leave-fullscreen",
        this.handleLeaveFullScreen
      );
    }
    // 初始化用户自定义主题
    Doc.updateDocumentClassBySetting(this.setting.display.userCustomThemes);
    // 初始化主题
    document.body.className = `theme-${this.setting.display.theme}`;
    // 初始化语言
    this.$i18n.locale = this.setting.display.language;
    // 初始化用来控制滚动位置的全局变量
    window.savedPositions = {};
    // 初始化代理
    const proxy = getStorage(StorageKey.Setting_Tools_Proxy);
    if (proxy && proxy.mode !== "none") {
      console.log("proxy: ", proxy);
      window.electron.ipcRenderer.send("set-proxy", proxy);
    }
  },
  beforeUnmount() {
    if (window.electron?.isElectron) {
      window.electron.ipcRenderer.removeListener(
        "fullscreen-window-size",
        this.handleFullScreen
      );
      window.electron.ipcRenderer.removeListener(
        "leave-fullscreen",
        this.handleLeaveFullScreen
      );
    }
  },
  methods: {
    handleFullScreen(event: { width: number; height: number }) {
      const autoScale = getStorage(
        StorageKey.Setting_Display_FullscreenAutoZoom
      );
      if (!autoScale) return;
      const { width, height } = event;
      const scalex = width / 1177;
      const scaley = height / 777;
      const scale = Math.min(scalex, scaley);
      console.log("fullscreen size: ", width, height, "scale: ", scale);
      window.electron.ipcRenderer.send("zoom", scale);
    },
    handleLeaveFullScreen() {
      window.electron.ipcRenderer.send(
        "zoom",
        parseFloat(this.setting.display.zoom.toString())
      );
    },
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
