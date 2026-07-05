<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { Doc } from "@/utils/document";
import { getStorage, StorageKey } from "@/utils/render_storage";
import { setProxyUrl } from "@/utils/api";
import type { FontList } from "font-list";
import { PlayerEvents } from "@/dual/player";
import {
  applyFluidBackground,
  clearFluidBackground,
} from "@/utils/fluidBackground";

export default defineComponent({
  name: "App",
  computed: {},
  setup() {
    const store = useStore();
    /** 系统字体 */
    if (window.electron?.isElectron) {
      window.electron.ipcRenderer
        .invoke("get-fonts")
        .then((fonts: FontList) => {
          window.fonts = fonts.reverse();
        });
    }
    const player = store.state.player;
    return {
      setting: store.state.setting,
      player,
    };
  },
  mounted() {
    if (!window.location.hash.includes("desktop-lyrics")) {
      this.$router.push({ path: "/greeting" });
    }
    // 初始化缩放
    if (window.electron?.isElectron) {
      window.electron.ipcRenderer.send(
        "zoom",
        parseFloat(this.setting.display.zoom.toString()),
      );
      window.electron.ipcRenderer.on(
        "fullscreen-window-size",
        this.handleFullScreen,
      );
      window.electron.ipcRenderer.on(
        "leave-fullscreen",
        this.handleLeaveFullScreen,
      );
      window.electron.ipcRenderer.on(
        "navigate-to-setting",
        this.handleNavigateToSetting,
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
      // console.log("proxy: ", proxy);
      setProxyUrl(proxy);
      window.electron.ipcRenderer.send("set-proxy", proxy);
    }

    // 监听歌曲变化，更新主界面流体背景
    this.player.subscriber.on("app-fluid", PlayerEvents.track, () => {
      void this.updateFluidBackground();
    });
    // palette 延迟加载完成后自动刷新
    this.player.subscriber.on("app-fluid", PlayerEvents.fluidPalette, () => {
      void this.updateFluidBackground();
    });
    // 初始更新
    if (this.player.currentTrack) {
      void this.updateFluidBackground();
    } else {
      this.clearMainBackground();
    }
  },
  beforeUnmount() {
    if (window.electron?.isElectron) {
      window.electron.ipcRenderer.removeListener(
        "fullscreen-window-size",
        this.handleFullScreen,
      );
      window.electron.ipcRenderer.removeListener(
        "leave-fullscreen",
        this.handleLeaveFullScreen,
      );
      window.electron.ipcRenderer.removeListener(
        "navigate-to-setting",
        this.handleNavigateToSetting,
      );
    }
    this.player.subscriber.offAll("app-fluid");
  },
  methods: {
    handleFullScreen(event: { width: number; height: number }) {
      const autoScale = getStorage(
        StorageKey.Setting_Display_FullscreenAutoZoom,
      );
      if (!autoScale) return;
      const { width, height } = event;
      const scalex = width / 1177;
      const scaley = height / 777;
      const scale = Math.min(scalex, scaley);
      // console.log("fullscreen size: ", width, height, "scale: ", scale);
      window.electron.ipcRenderer.send("zoom", scale);
    },
    handleLeaveFullScreen() {
      window.electron.ipcRenderer.send(
        "zoom",
        parseFloat(this.setting.display.zoom.toString()),
      );
    },
    handleNavigateToSetting() {
      console.log("TEST_MULTI_MATCH");
      if (this.$route.path === "/setting") return;
      this.$router.push({ path: "/setting" }).catch(() => {});
    },
    clearMainBackground() {
      const container = document.getElementById("mainContainer");
      if (container) clearFluidBackground(container);
    },
    async updateFluidBackground() {
      const track = this.player.currentTrack;
      const container = document.getElementById("mainContainer");
      if (!container) return;

      // if (!track?.al?.picUrl) {
      //   this.clearMainBackground();
      //   return;
      // }

      const palette = this.player.fluidPalette;
      if (!palette) return;
      applyFluidBackground(container, palette.primary, palette.secondary);
    },
  },
});
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
