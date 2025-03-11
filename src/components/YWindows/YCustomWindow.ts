import { defineComponent, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import YScroll from "@/components/base/YScroll.vue";
import { Theme, type Theme2 } from "@/utils/theme";
import { useStore } from "vuex";
import { YColor } from "@/utils/color";
import { darkThemeColors, hexToRgb } from "@/utils/color";
import { Doc } from "@/utils/document";
import { themes } from "@/utils/theme";
import { Message } from "@/dual/YMessageC";
import themecss from "@/utils/theme.txt";
import { type CSSClass } from "@/dual/YCustomWindow";
import { GlobalMsgEvents } from "@/dual/globalMsg";

export default defineComponent({
  name: "YCustomWindow",
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();
    const store = useStore();
    return {
      window,
      globalMsg: store.state.globalMsg,
      setting: store.state.setting,
    };
  },
  components: {
    YWindow,
    YScroll,
  },
  watch: {
    fontColorType(val) {
      if (val === "single") {
        this.fontColors = { fontColorAll: "#ffffff" };
      } else {
        this.fontColors = {
          fontColorMain: "#ffffff",
          fontColorHigh: "#dddddd",
          fontColorStandard: "#bbbbbb",
          fontColorLow: "#999999",
        };
      }
    },
  },
  data() {
    return {
      preset: "",
      name: "自定义主题",
      type: "dark" as "dark" | "light",
      background: "#000000",
      nowBackgroundIndex: 0,
      autoBackgroundType: "dark" as "dark" | "other",
      foreground: "#ffffff",
      panelBackground: "#333333",
      fontColorType: "single" as "single" | "various",
      fontColors: { fontColorAll: "#ffffff" } as
        | Theme.IFontColor
        | Theme.IFontColorAll,
      backgroundStyle: "",
      highlightColor: "#fe3c5a",
      appThemes: [] as Theme.IThemeCSS[],
      colorFromStr: "#cc77bf",
      str: "xcmusic",
    };
  },
  computed: {
    darkThemeColors() {
      return darkThemeColors;
    },
    foregroundColor() {
      const rgb = hexToRgb(this.foreground);
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
    },
    fontColorMain() {
      if ("fontColorAll" in this.fontColors) {
        return this.fontColors.fontColorAll;
      } else {
        return this.fontColors.fontColorMain;
      }
    },
    fontColorHigh() {
      if ("fontColorAll" in this.fontColors) {
        const rgb = hexToRgb(this.fontColors.fontColorAll);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
      } else {
        return this.fontColors.fontColorHigh;
      }
    },
    fontColorStandard() {
      if ("fontColorAll" in this.fontColors) {
        const rgb = hexToRgb(this.fontColors.fontColorAll);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
      } else {
        return this.fontColors.fontColorStandard;
      }
    },
    fontColorLow() {
      if ("fontColorAll" in this.fontColors) {
        const rgb = hexToRgb(this.fontColors.fontColorAll);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
      } else {
        return this.fontColors.fontColorLow;
      }
    },
    nowBackground() {
      return this.darkThemeColors[this.nowBackgroundIndex];
    },
    nowBackgroundStyle() {
      if (this.autoBackgroundType === "dark") {
        return darkThemeColors[this.nowBackgroundIndex];
      } else {
        return YColor.getLightThemeColor(
          darkThemeColors[this.nowBackgroundIndex],
          this.background,
        );
      }
    },
    highlightColorRgb() {
      return hexToRgb(this.highlightColor);
    },
  },
  emits: ["new-window-state"],
  mounted() {
    this.appThemes = this.getAppThemes();
    this.preset = this.appThemes[0].name;
    this.applyTheme(this.appThemes[0]);
  },
  beforeUnmount() {
    this.window = null;
  },
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    createTheme() {
      const result = Theme.createTheme({
        name: this.name,
        type: this.type,
        background: this.background,
        autoBackgroundType: this.autoBackgroundType,
        foreground: this.foreground,
        panelBackground: this.panelBackground,
        fontColors: this.fontColors,
        highlight: this.highlightColor,
      });
      const userCustomThemes = this.setting.display.userCustomThemes;
      this.setting.display.userCustomThemes = [
        ...userCustomThemes,
        {
          data: result.theme,
          classContent: result.classContent,
        },
      ];
      this.globalMsg.post(GlobalMsgEvents.CloseCustomWindow);
      Doc.updateDocumentClassBySetting(this.setting.display.userCustomThemes);
      this.window!.closeWindow();
    },
    nextIndex() {
      this.nowBackgroundIndex =
        (this.nowBackgroundIndex + 1) % darkThemeColors.length;
    },
    getAppThemes(): Theme.IThemeCSS[] {
      const classes = this.extractThemeClasses(themecss);
      let res: Theme.IThemeCSS[] = [];
      // 遍历所有主题
      for (const key in classes) {
        const _theme = classes[key];
        // 按照分号分割，并去掉空格
        const _theme_lines = _theme
          .split(";")
          .filter((item) => item.trim() !== "")
          .map((item) => item.trim());

        const highlightTxt = "--highlight-color-rgb:";
        const fontColorTxt = "--font-color-rgb:";
        const backgroundTxt = "--background-color:";
        const foregroundTxt = "--foreground-color:";
        const panelBackgroundTxt = "--panel-background-color:";
        const invertTxt = "invert(";

        let display = key;
        let highlight = "#fe3c5a";
        let fontColorAll = "#ffffff";
        let background = "#000000";
        let forground = "#ffffff";
        let panelBackground = "#333333";
        let type: "dark" | "light" = "dark";
        let autoBackgroundType: "dark" | "other" = "dark";

        // 遍历一个类的所有行
        for (const line in _theme_lines) {
          let lineContent = _theme_lines[line];

          // 获取数据
          if (lineContent.startsWith(highlightTxt)) {
            highlight = this.rgbStrToHex(lineContent.replace(highlightTxt, ""));
          } else if (lineContent.startsWith(fontColorTxt)) {
            fontColorAll = this.rgbStrToHex(
              lineContent.replace(fontColorTxt, ""),
            );
          } else if (lineContent.startsWith(backgroundTxt)) {
            background = lineContent.replace(backgroundTxt, "").trim();
          } else if (lineContent.startsWith(foregroundTxt)) {
            forground = lineContent.replace(foregroundTxt, "").trim();
          } else if (lineContent.startsWith(panelBackgroundTxt)) {
            panelBackground = lineContent
              .replace(panelBackgroundTxt, "")
              .trim();
          } else if (lineContent.includes(invertTxt)) {
            if (lineContent.includes("(0)")) type = "dark";
            else type = "light";
          }
        }

        // 判断是否是自动背景，并获取显示名
        for (const index in themes) {
          const theme = themes[index];
          const val = key.substring(6);
          if (theme.value === val) {
            if ((theme as Theme2).background) {
              autoBackgroundType = "other";
            }
            display = theme.display;
          }
        }

        res.push({
          name: display,
          type,
          background,
          foreground: forground,
          panelBackground,
          highlight,
          autoBackgroundType,
          fontColors: {
            fontColorAll,
          },
        });
      }
      return res;
    },
    extractThemeClasses(content: string): CSSClass {
      const themeClasses: CSSClass = {};
      const regex = /\.theme-[\w-]+\s*\{([^}]+)\}/g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        const [fullMatch, _classContent] = match;
        const classContent = _classContent
          .replace(/(\r|\\r)/g, "")
          .replace(/(\n|\\n)/g, "")
          .trim();
        const classNameMatch = fullMatch.match(/\.theme-[\w-]+/);
        if (classNameMatch) {
          const className = classNameMatch[0].substring(1); // 去掉前面的 "."
          themeClasses[className] = classContent.trim(); // 去除多余的空格
        }
      }

      return themeClasses;
    },
    rgbStrToHex(rgbStr: string) {
      const rgb = rgbStr.split(",").map((item) => parseInt(item));
      return YColor.rgbToHex(rgb[0], rgb[1], rgb[2]);
    },
    applyTheme(theme: Theme.IThemeCSS) {
      this.type = theme.type;
      this.background = theme.background;
      this.foreground = theme.foreground;
      this.panelBackground = theme.panelBackground;
      this.highlightColor = theme.highlight;
      this.autoBackgroundType = theme.autoBackgroundType;
      this.$nextTick(() => {
        this.fontColors = theme.fontColors;
      });
    },
    handlePresetChange() {
      this.fontColorType = "single";
      const theme = this.appThemes.find((item) => item.name === this.preset);
      if (theme) {
        this.applyTheme(theme);
      }
    },
    setColorFromStr() {
      this.colorFromStr = YColor.stringToHexColor(this.str);
    },
    copy(text: string) {
      navigator.clipboard.writeText(text).then(
        () => {
          Message.post("success", `${this.$t("copy.copied")}${text}`);
        },
        () => {
          Message.post("error", `${this.$t("copy.copy_failed")}${text}`);
        },
      );
    },
    paste(
      target:
        | "background"
        | "foreground"
        | "panelBackground"
        | "highlightColor"
        | "fontColorAll"
        | "fontColorMain"
        | "fontColorHigh"
        | "fontColorStandard"
        | "fontColorLow",
    ) {
      navigator.clipboard.readText().then(
        (text) => {
          if (YColor.isHexColor(text.trim())) {
            if (target === "fontColorAll") {
              this.fontColors = { fontColorAll: text.trim() };
            } else if (
              target === "fontColorMain" ||
              target === "fontColorHigh" ||
              target === "fontColorStandard" ||
              target === "fontColorLow"
            ) {
              (this.fontColors as Theme.IFontColor)[target] = text.trim();
            } else {
              this[target] = text.trim();
            }
          } else {
            Message.post(
              "error",
              `${this.$t("copy.paste_failed_invalid_data")}${text}`,
            );
          }
        },
        () => {
          Message.post("error", this.$t("copy.paste_failed"));
        },
      );
    },
  },
});
