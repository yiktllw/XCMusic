import { defineComponent, ref } from "vue";
import { YColor } from "@/utils/color";
import YHeader from "@/components/base/YHeader.vue";
import { Message } from "@/dual/YMessageC";
import { useStore } from "vuex";
import { themes } from "@/utils/theme";
import packageJson from "@/../package.json";
import {
  exportToJSON,
  importFromJSON,
  qualities,
  type TSideBarItems,
} from "@/utils/setting";
import { type ISaveJSONData } from "@/dual/YSettingView";
import YScroll from "@/components/base/YScroll.vue";
import { GlobalMsgEvents } from "@/dual/globalMsg";
import { type ProxyConfig } from "@/dual/userProxy.interface";

/** 用于生成设置界面的背景色 */
const str = "setting_view";

export default defineComponent({
  name: "YSettingView",
  components: {
    YHeader,
    YScroll,
  },
  setup() {
    const store = useStore();
    const main = ref<HTMLElement | null>(null);
    const scroll = ref<typeof YScroll | null>(null);
    const header = ref<typeof YHeader | null>(null);

    return {
      main,
      scroll,
      header,
      setting: store.state.setting,
      player: store.state.player,
      download: store.state.download,
      globalMsg: store.state.globalMsg,
    };
  },
  computed: {
    version() {
      return packageJson.version;
    },
  },
  watch: {},
  data() {
    return {
      switcher: [
        {
          num: 0,
          showNum: false,
          position: "normal",
          display: "header.setting_view.normal",
        },
        {
          num: 0,
          showNum: false,
          position: "appearance",
          display: "header.setting_view.appearance",
        },
        {
          num: 0,
          showNum: false,
          position: "play",
          display: "header.setting_view.play",
        },
        {
          num: 0,
          showNum: false,
          position: "download",
          display: "header.setting_view.download",
        },
        {
          num: 0,
          showNum: false,
          position: "tools",
          display: "header.setting_view.tools",
        },
        {
          num: 0,
          showNum: false,
          position: "about",
          display: "header.setting_view.about",
        },
      ],
      language: "zh",
      themes: themes,
      theme: "dark",
      zoom: 100,
      closeBehavior: "minimize",
      closeAlwaysAsk: false,
      auto_zoom: false,
      volume_leveling: false,
      spectrum: false,
      dbclick: "all",
      downloadPath: "",
      quality: "standard",
      qualities: qualities,
      devices: [] as MediaDeviceInfo[],
      selectedDevice: "" as string,
      localPaths: [] as string[],
      openAtLogin: false,
      autoPlay: false,
      rememberProgress: false,
      hideInSidebar_favorite: false as boolean,
      hideInSidebar_album: false as boolean,
      hideInSidebar_local: false as boolean,
      hideInSidebar_download: false as boolean,
      hideInSidebar_cloud: false as boolean,
      rectData: [] as number[],
      /** 禁用硬件加速 */
      disableGpu: false,
      /** 代理 */
      proxy: {
        mode: "none",
        server: "",
        username: "",
        password: "",
      } as ProxyConfig,
      /** 代理服务器地址 */
      proxy_host: "",
      /** 代理服务器端口 */
      proxy_port: "",
      allowConsecutiveAlbums: false,
    };
  },
  methods: {
    handleSwitcher(position: string) {
      this.scroll!.scrollToQuery(`#${position}`);
    },
    handleTheme(e: Event) {
      this.switchToTheme((e.target as HTMLInputElement)?.value);
    },
    switchToTheme(theme: string) {
      this.theme = theme;
      document.body.className = `theme-${this.theme}`;
      this.setting.display.theme = this.theme;
      YColor.setBackgroundColorHex2(YColor.stringToHexColor(str));
    },
    setClose(behavior: "minimize" | "quit") {
      this.closeBehavior = behavior;
      this.setting.titleBar.closeButton = behavior;
    },
    setAlwaysAsk(bool: boolean) {
      this.closeAlwaysAsk = bool;
      this.setting.titleBar.closeAlwaysAsk = bool;
    },
    handleZoom() {
      try {
        this.setting.display.zoom = this.zoom / 100;
        if (window.electron?.isElectron) {
          Message.post("success", this.$t("message.setting_view.zoom_applied"));
        } else {
          Message.post("info", this.$t("message.setting_view.only_desktop"));
        }
      } catch {
        Message.post(
          "error",
          this.$t("message.setting_view.zoom_range_50_200"),
        );
      }
    },
    switchToLanguage(language: "zh" | "en") {
      this.language = language;
      this.setting.display.language = language;
      this.$i18n.locale = this.language;
    },
    setDbClick(behavior: "all" | "single") {
      this.dbclick = behavior;
      this.setting.play.dbclick = behavior;
    },
    setAutoZoom(bool: boolean) {
      this.auto_zoom = bool;
      this.setting.display.fullscreenAutoZoom = bool;
      // tbd
      // 全屏时设置自动缩放
    },
    setVolumeLeveling(bool: boolean) {
      this.volume_leveling = bool;
      this.setting.play.volume_leveling = this.volume_leveling;
      this.player.volumeLeveling = bool;
    },
    setSpectrum(bool: boolean) {
      this.spectrum = bool;
      if (this.setting.playui.spectrum !== bool) {
        this.setting.playui.spectrum = this.spectrum;
        if (bool) {
          Message.post("info", "setting_view.work_after_reload_window", true);
        }
      }
    },
    setAllowConsecutiveAlbums(bool: boolean) {
      this.setting.play.allowConsecutiveAlbums = bool;
      this.allowConsecutiveAlbums = this.setting.play.allowConsecutiveAlbums;
    },
    async getFolderPath() {
      if (window.electron?.isElectron) {
        const path = await window.electron.ipcRenderer.invoke("select-folder");
        if (path && typeof path === "string") {
          return path;
        } else {
          throw new Error("No path selected");
        }
      } else {
        throw new Error("Only desktop version supports this feature");
      }
    },
    async addPath() {
      try {
        const path = await this.getFolderPath();
        this.localPaths.push(path);
        this.setting.download.localPaths = this.localPaths;
      } catch {
        return;
      }
    },
    clearPath() {
      this.localPaths = [];
      this.setting.download.localPaths = this.localPaths;
    },
    deletePath(index: number) {
      this.localPaths.splice(index, 1);
      this.setting.download.localPaths = this.localPaths;
    },
    async setPath(index: number) {
      try {
        const path = await this.getFolderPath();
        this.localPaths[index] = path;
        this.setting.download.localPaths = this.localPaths;
      } catch {
        return;
      }
    },
    async selectFile() {
      if (window.electron?.isElectron) {
        const path = await window.electron.ipcRenderer.invoke("select-folder");
        // console.log(path);
        if (path && typeof path === "string") {
          this.setting.download.path = path;
          this.downloadPath = this.setting.download.path;
        }
      } else {
        Message.post(
          "info",
          this.$t("message.setting_view.download.only_desktop"),
        );
      }
    },
    setQuality(quality: string) {
      this.quality = quality;
      this.setting.download.quality = quality;
    },
    openGitRepo(position: "default" | "issues" | "license" = "default") {
      if (!window.electron?.isElectron) return;
      if (position === "default") {
        window.electron.shell.openExternal(
          "https://github.com/yiktllw/XCMusic",
        );
      } else if (position === "issues") {
        window.electron.shell.openExternal(
          "https://github.com/yiktllw/XCMusic/issues",
        );
      } else if (position === "license") {
        window.electron.shell.openExternal(
          "https://github.com/yiktllw/XCMusic/blob/master/LICENSE",
        );
      }
    },
    openAuthor() {
      if (!window.electron?.isElectron) return;
      window.electron.shell.openExternal("https://github.com/yiktllw");
    },
    openReadme() {
      if (!window.electron?.isElectron) return;
      this.$router.push({ path: "/markdown/README" });
    },
    openChangelog() {
      if (!window.electron?.isElectron) return;
      this.$router.push({ path: "/markdown/CHANGELOG" });
    },
    openPrivileges() {
      if (!window.electron?.isElectron) return;
      this.$router.push({ path: "/markdown/PRIVILEGES" });
    },
    async getDevices() {
      // window.test = this.player;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.devices = devices.filter(
          (device) => device.kind === "audiooutput",
        );
        this.selectedDevice = this.player.device;
        // console.log('Audio device Ids:', this.devices.map(device => device.deviceId));
      } catch (err) {
        console.error("Error fetching audio devices:", err);
      }
    },
    async selectAudioOutputDevice(deviceId: string) {
      const audioElement = this.player._audio;
      if (!audioElement) return;

      try {
        // 检查是否支持 setSinkId 方法
        if (typeof audioElement.setSinkId === "function") {
          await this.player.setDevice(deviceId).then(() => {
            this.selectedDevice = deviceId;
            this.setting.play.device = deviceId;
          });
          // this.selectedDevice = audioElement.sinkId;
          // console.log(`Audio output set to device: ${deviceId}`);
        } else {
          console.error("Browser does not support setSinkId.");
        }
      } catch (err) {
        console.error("Error setting audio output device:", err);
      }
    },
    reloadWindow() {
      window.location.reload();
    },
    openCustomWindow() {
      this.globalMsg.post(GlobalMsgEvents.OpenCustomWindow);
      this.globalMsg.subscriber.on(
        "YSettingView",
        GlobalMsgEvents.CloseCustomWindow,
        () => {
          this.fetchThemes();
        },
      );
    },
    fetchThemes() {
      const userCustomThemes = this.setting.display.userCustomThemes.map(
        (item) => {
          return item.data;
        },
      );
      this.themes = themes.concat(userCustomThemes);
    },
    setOpenAtLogin(bool: boolean) {
      this.openAtLogin = bool;
      this.setting.system.openAtLogin = bool;
    },
    setDisableGpu(bool: boolean) {
      this.setting.system.disableGpuAcceleration = bool;
      this.disableGpu = this.setting.system.disableGpuAcceleration;
      Message.post("info", this.$t("setting_view.work_after_restart_app"));
    },
    setAutoPlay(bool: boolean) {
      this.autoPlay = bool;
      this.setting.play.autoPlay = bool;
    },
    setRememberProgress(bool: boolean) {
      this.rememberProgress = bool;
      this.setting.play.rememberTrackProgress = bool;
    },
    setHideInSidebar() {
      const hideInSidebar: TSideBarItems[] = [];
      (
        ["favorite", "album", "local", "download", "cloud"] as TSideBarItems[]
      ).forEach((item: TSideBarItems) => {
        if (this[`hideInSidebar_${item}`]) hideInSidebar.push(item);
      });
      this.setting.display.hideInSidebar = hideInSidebar;
      this.globalMsg.post(GlobalMsgEvents.RefreshSidebar);
    },
    setProxy() {
      if (window.electron?.isElectron) {
        try {
          this.proxy.server = `${this.proxy_host}:${this.proxy_port}`;
          this.setting.tools.proxy = this.proxy;
          Message.post("success", this.$t("setting_view.tools.proxy.success"));
        } catch {
          Message.post("error", this.$t("setting_view.tools.proxy.error"));
        }
      } else {
        Message.post("info", this.$t("setting_view.tools.proxy.only_desktop"));
      }
    },
    async exportToJSON_Setting() {
      if (!window.electron?.isElectron) return;
      const json = exportToJSON(this.setting);
      const data: ISaveJSONData = {
        json: json,
        name: "XCMusic_Setting.json",
      };
      const savedPath = await window.electron.ipcRenderer.invoke(
        "save-json",
        data,
      );
      if (savedPath) {
        Message.post("success", this.$t("setting_view.about.export_success"));
      } else {
        Message.post("error", this.$t("setting_view.about.export_fail"));
      }
    },
    async exportToJSON_Download() {
      if (!window.electron?.isElectron) return;
      const json = this.download.exportToJSON();
      const data: ISaveJSONData = {
        json: json,
        name: "XCMusic_Downloads.json",
      };
      const savedPath = await window.electron.ipcRenderer.invoke(
        "save-json",
        data,
      );
      if (savedPath) {
        Message.post("success", this.$t("setting_view.about.export_success"));
      } else {
        Message.post("error", this.$t("setting_view.about.export_fail"));
      }
    },
    async importFromJSON_Setting() {
      if (!window.electron?.isElectron) return;
      const json = await window.electron.ipcRenderer.invoke("open-json");
      if (json) {
        importFromJSON(this.setting, json);
        Message.post("success", this.$t("setting_view.about.import_success"));
      } else {
        Message.post("error", this.$t("setting_view.about.import_no_file"));
      }
      this.init();
    },
    async importFromJSON_Download() {
      if (!window.electron?.isElectron) return;
      const json = await window.electron.ipcRenderer.invoke("open-json");
      if (json) {
        this.download.importFromJSON(json);
        Message.post("success", this.$t("setting_view.about.import_success"));
      } else {
        Message.post("error", this.$t("setting_view.about.import_no_file"));
      }
    },
    initRectData() {
      this.switcher.forEach((item) => {
        const dom = this.main?.querySelector(`#${item.position}`);
        if (!dom) return;
        this.rectData.push(dom.getBoundingClientRect().top);
      });
    },
    init() {
      YColor.setBackgroundColorHex2(YColor.stringToHexColor(str));
      this.theme = this.setting.display.theme;
      const userCustomThemes = this.setting.display.userCustomThemes.map(
        (item) => {
          return item.data;
        },
      );
      this.themes = this.themes.concat(userCustomThemes);
      this.zoom = this.setting.display.zoom * 100;
      this.language = this.setting.display.language;
      this.closeBehavior = this.setting.titleBar.closeButton;
      this.closeAlwaysAsk = this.setting.titleBar.closeAlwaysAsk;
      this.auto_zoom = this.setting.display.fullscreenAutoZoom;
      this.volume_leveling = this.setting.play.volume_leveling;
      this.spectrum = this.setting.playui.spectrum;
      this.dbclick = this.setting.play.dbclick;
      this.downloadPath = this.setting.download.path;
      this.quality = this.setting.download.quality;
      this.localPaths = this.setting.download.localPaths;
      this.openAtLogin = this.setting.system.openAtLogin;
      this.autoPlay = this.setting.play.autoPlay;
      this.rememberProgress = this.setting.play.rememberTrackProgress;
      this.allowConsecutiveAlbums = this.setting.play.allowConsecutiveAlbums;
      this.setting.display.hideInSidebar.forEach((item: TSideBarItems) => {
        this[`hideInSidebar_${item}`] = true;
      });
      this.disableGpu = this.setting.system.disableGpuAcceleration;
      this.proxy = this.setting.tools.proxy;
      if (this.proxy.mode !== "none") {
        try {
          const proxyurl = new URL(`${this.proxy.mode}://${this.proxy.server}`);
          this.proxy_host = proxyurl.hostname;
          this.proxy_port = proxyurl.port;
        } catch (error) {
          console.warn("Error parsing proxy server:", error);
          this.proxy_host = "";
          this.proxy_port = "";
        }
      }
      this.getDevices();
      this.initRectData();
    },
    handleScroll(event: Event) {
      if (event.type !== "scroll") return;
      let index = 0;
      const scrollTop = this.scroll!.$refs.main.scrollTop;
      for (let i = this.rectData.length - 1; i >= 0; i--) {
        if (scrollTop <= this.rectData[i] - this.rectData[0] + 30) {
          index = i;
        }
      }
      const containerHeight = this.scroll!.$el.clientHeight;
      if (
        scrollTop >=
        this.rectData[this.rectData.length - 1] -
          containerHeight +
          this.rectData[0] -
          30
      ) {
        index = this.rectData.length - 1;
      }
      this.header!.setPosition(this.switcher[index].position);
    },
  },
  mounted() {
    this.init();
    this.scroll!.addScrollEndListener(this.handleScroll);
  },
  beforeUnmount() {
    this.globalMsg.subscriber.offAll("YSettingView");
    this.main = null;
    this.header = null;
  },
});
