<template>
  <!-- 自定义主题窗口 -->
  <div class="y-custom-window">
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("create_custom_theme.title") }}
        </span>
      </template>
      <div class="main">
        <div class="main-content">
          <YScroll style="max-height: 440px; width: 300px">
            <div class="checks">
              <div class="check-item preset">
                <div class="label">
                  {{ $t("create_custom_theme.preset") }}
                </div>
                <div class="check">
                  <select v-model="preset" @change="handlePresetChange">
                    <option v-for="item in appThemes" :value="item.name">
                      {{
                        [
                          "setting_view.theme_name.dark",
                          "setting_view.theme_name.dark_high_contrast",
                          "setting_view.theme_name.light",
                          "setting_view.theme_name.light_high_contrast",
                        ].includes(item.name)
                          ? $t(item.name)
                          : item.name
                      }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="check-item name">
                <div class="label">
                  {{ $t("create_custom_theme.theme_name") }}
                </div>
                <textarea
                  class="input font-size-large"
                  v-model="name"
                  :maxlength="40"
                  :placeholder="
                    $t('create_custom_theme.theme_name_placeholder')
                  "
                  rows="2"
                ></textarea>
              </div>
              <div class="check-item type">
                <div class="label">
                  {{ $t("create_custom_theme.theme_type") }}
                </div>
                <div class="check">
                  <input type="radio" id="dark" value="dark" v-model="type" />
                  <label for="dark">
                    {{ $t("create_custom_theme.theme_type_dark") }}
                  </label>
                  <input type="radio" id="light" value="light" v-model="type" />
                  <label for="light">
                    {{ $t("create_custom_theme.theme_type_light") }}
                  </label>
                </div>
              </div>
              <div class="check-item background">
                <div class="label">
                  {{ $t("create_custom_theme.theme_background_color") }}
                </div>
                <input class="input-ori" type="color" v-model="background" />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('background')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div class="check-item auto-background">
                <div class="label">
                  {{ $t("create_custom_theme.theme_auto_background_type") }}
                </div>
                <div class="check">
                  <input
                    type="radio"
                    id="_dark"
                    value="dark"
                    v-model="autoBackgroundType"
                  />
                  <label for="_dark">
                    {{ $t("create_custom_theme.theme_type_dark") }}
                  </label>
                  <input
                    type="radio"
                    id="_other"
                    value="other"
                    v-model="autoBackgroundType"
                  />
                  <label for="_other">
                    {{ $t("create_custom_theme.theme_type_other") }}
                  </label>
                </div>
              </div>
              <div class="check-item foreground">
                <div class="label">
                  {{ $t("create_custom_theme.theme_foreground_color") }}
                </div>
                <input class="input-ori" type="color" v-model="foreground" />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('foreground')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div class="check-item panel-background">
                <div class="label">
                  {{ $t("create_custom_theme.theme_panel_color") }}
                </div>
                <input
                  class="input-ori"
                  type="color"
                  v-model="panelBackground"
                />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('panelBackground')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div class="check-item highlight-color">
                <div class="label">
                  {{ $t("create_custom_theme.highlight_color") }}
                </div>
                <input
                  class="input-ori"
                  type="color"
                  v-model="highlightColor"
                />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('highlightColor')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div class="check-item font-color-type">
                <div class="label">
                  {{ $t("create_custom_theme.font_color_type") }}
                </div>
                <div class="check">
                  <input
                    type="radio"
                    id="fontColorAll"
                    value="single"
                    v-model="fontColorType"
                  />
                  <label for="fontColorAll">
                    {{ $t("create_custom_theme.font_color_type_single") }}
                  </label>
                  <input
                    type="radio"
                    id="fontColor"
                    value="various"
                    v-model="fontColorType"
                  />
                  <label for="fontColor">
                    {{ $t("create_custom_theme.font_color_type_various") }}
                  </label>
                </div>
              </div>
              <div
                class="check-item font-color-all"
                v-if="fontColorType === 'single'"
              >
                <div class="label">
                  {{ $t("create_custom_theme.font_color") }}
                </div>
                <input
                  class="input-ori"
                  type="color"
                  v-model="(fontColors as Theme.IFontColorAll).fontColorAll"
                />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('fontColorAll')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div
                class="check-item font-color-primary"
                v-if="fontColorType === 'various'"
              >
                <div class="label">
                  {{ $t("create_custom_theme.font_color_primary") }}
                </div>
                <input
                  class="input-ori"
                  type="color"
                  v-model="(fontColors as Theme.IFontColor).fontColorMain"
                />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('fontColorMain')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div
                class="check-item font-color-high"
                v-if="fontColorType === 'various'"
              >
                <div class="label">
                  {{ $t("create_custom_theme.font_color_secondary") }}
                </div>
                <input
                  class="input-ori"
                  type="color"
                  v-model="(fontColors as Theme.IFontColor).fontColorHigh"
                />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('fontColorHigh')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div
                class="check-item font-color-standard"
                v-if="fontColorType === 'various'"
              >
                <div class="label">
                  {{ $t("create_custom_theme.font_color_tertiary") }}
                </div>
                <input
                  class="input-ori"
                  type="color"
                  v-model="(fontColors as Theme.IFontColor).fontColorStandard"
                />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('fontColorStandard')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div
                class="check-item font-color-low"
                v-if="fontColorType === 'various'"
              >
                <div class="label">
                  {{ $t("create_custom_theme.font_color_quaternary") }}
                </div>
                <input
                  class="input-ori"
                  type="color"
                  v-model="(fontColors as Theme.IFontColor).fontColorLow"
                />
                <img
                  src="@/assets/paste.svg"
                  class="paste-img g-icon"
                  @click="paste('fontColorLow')"
                  :title="$t('copy.click_to_paste')"
                />
              </div>
              <div class="check-item">
                <div class="label">
                  {{ $t("create_custom_theme.color_from_str") }}
                </div>
                <textarea
                  class="input"
                  :spellcheck="false"
                  @input="setColorFromStr"
                  v-model="str"
                />
              </div>
              <div class="color-display">
                <div
                  class="color-block"
                  :style="{
                    backgroundColor: colorFromStr,
                  }"
                />
                <div class="color-display-text">
                  {{ colorFromStr }}
                </div>
                <img
                  src="@/assets/copy.svg"
                  class="copy-img g-icon"
                  @click="copy(colorFromStr)"
                  :title="$t('copy.click_to_copy')"
                />
              </div>
            </div>
          </YScroll>
          <div
            class="preview"
            :style="{
              background: `linear-gradient(180deg, ${nowBackgroundStyle} 0%, ${background} 300px, ${background} 100%)`,
            }"
          >
            <div class="up">
              <div
                class="left"
                :style="{
                  backgroundColor: foregroundColor,
                }"
              >
                <img src="@/assets/logo.svg" class="logo" />
                <div
                  class="font-size-preview sidebar-item"
                  :style="{
                    color: fontColorHigh,
                  }"
                >
                  这是预览界面
                </div>
                <div
                  class="font-size-preview sidebar-item"
                  :style="{
                    color: fontColorHigh,
                  }"
                >
                  这是侧边栏
                </div>
                <div
                  class="font-size-preview sidebar-item"
                  :style="{
                    color: fontColorHigh,
                  }"
                >
                  侧边栏背景为5%透明度的前景色
                </div>
                <div
                  class="font-size-preview sidebar-item"
                  :style="{
                    color: fontColorHigh,
                  }"
                >
                  字体颜色为次主要字体颜色
                </div>
                <div
                  class="font-size-preview sidebar-item"
                  :style="{
                    color: fontColorHigh,
                  }"
                >
                  这是一个图标
                </div>
                <img
                  src="@/assets/thumb.svg"
                  class="logo"
                  :style="{
                    filter: `invert(${type === 'dark' ? '0' : '1'})`,
                    opacity: '.8',
                  }"
                />
                <div
                  class="font-size-preview sidebar-item"
                  :style="{
                    color: fontColorHigh,
                  }"
                >
                  图标颜色会随主题类型变化
                </div>
              </div>
              <div class="right">
                <div
                  class="content-img"
                  @click="nextIndex()"
                  :style="{
                    border: '1px solid ' + foreground,
                  }"
                >
                  <div
                    class="font-size-preview"
                    :style="{
                      color: fontColorMain,
                    }"
                  >
                    这是内容区域
                  </div>
                  <div
                    class="font-size-preview"
                    :style="{
                      color: fontColorMain,
                    }"
                  >
                    内容颜色会影响背景色
                  </div>
                  <div
                    class="font-size-preview"
                    :style="{
                      color: nowBackground,
                    }"
                  >
                    以下为当前内容色
                  </div>
                  <div
                    class="font-size-preview"
                    :style="{
                      color: fontColorMain,
                    }"
                  >
                    {{ nowBackground }}
                  </div>
                  <div
                    class="font-size-preview"
                    :style="{
                      color: fontColorMain,
                    }"
                  >
                    点击切换到下一个内容色
                  </div>
                </div>
                <div class="font-color-display">
                  <div
                    class="display-item"
                    :style="{
                      color: fontColorMain,
                    }"
                  >
                    <div style="font-weight: bold">这是主要字体颜色</div>
                    <div>这是主要字体颜色</div>
                  </div>
                  <div
                    class="display-item"
                    :style="{
                      color: fontColorHigh,
                    }"
                  >
                    <div style="font-weight: bold">这是次主要字体颜色</div>
                    <div>这是次主要字体颜色</div>
                  </div>
                  <div
                    class="display-item"
                    :style="{
                      color: fontColorStandard,
                    }"
                  >
                    <div style="font-weight: bold">这是次要字体颜色</div>
                    <div>这是次要字体颜色</div>
                  </div>
                  <div
                    class="display-item"
                    :style="{
                      color: fontColorLow,
                    }"
                  >
                    <div style="font-weight: bold">这是次次要字体颜色</div>
                    <div>这是次次要字体颜色</div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="down"
              :style="{
                backgroundColor: panelBackground,
              }"
            >
              <div
                class="font-size-preview"
                :style="{
                  color: fontColorStandard,
                }"
              >
                <span> 这是底部栏 </span>
                <span> 字体颜色为次要字体颜色 </span>
              </div>
              <div
                class="font-size-preview"
                :style="{
                  color: fontColorStandard,
                }"
              >
                <button
                  :tabindex="-1"
                  class="play-button"
                  :style="{
                    backgroundColor: highlightColor,
                  }"
                >
                  <img src="@/assets/play.svg" class="play-img" />
                </button>
              </div>
              <div
                class="font-size-preview"
                :style="{
                  color: fontColorStandard,
                }"
              >
                <span> 特殊按钮等颜色为强调色 </span>
                <span> 其内容固定为白色 </span>
              </div>
            </div>
          </div>
        </div>
        <button
          :tabindex="-1"
          class="create font-size-large"
          @click="createTheme"
        >
          {{ $t("create_playlist.create") }}
        </button>
      </div>
    </YWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import YScroll from "@/components/base/YScroll.vue";
import { Theme, Theme2 } from "@/utils/theme";
import { useStore } from "vuex";
import { YColor } from "@/utils/color";
import { darkThemeColors, hexToRgb } from "@/utils/color";
import { Doc } from "@/utils/document";
import { themes } from "@/utils/theme";
import { Message } from "@/dual/YMessageC";
import themecss from "@/utils/theme.txt";
import { CSSClass } from "@/dual/YCustomWindow";
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
</script>

<style lang="scss" scoped>
select {
  width: 143px;
  padding: 2px 2px !important;
  border: 1px solid rgba(var(--foreground-color-rgb), $alpha: 0.3);
  background-color: transparent;
  color: var(--font-color-high);
  font-size: 16px;
  border-radius: 5px;
  padding: 0 10px;
  margin-right: 10px;
  cursor: pointer;

  option {
    color: var(--font-color-high);
    background-color: var(--background-color);
  }

  &:focus {
    outline: none;
  }
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px 10px 10px;
  // width: 432.1px;
  height: 500px;
  max-height: 90vh;
  max-width: 90vw;

  .main-content {
    display: flex;
    flex-direction: row;
    width: 100%;

    .checks {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;

      .check-item {
        display: flex;
        flex-direction: row;
        align-items: first baseline;
        gap: 5px;
        width: 100%;

        .label {
          min-width: 123px;
          max-width: 123px;
          text-align: left;
          color: var(--font-color-main);
          font-weight: bold;
        }

        .input-ori {
          padding: 5px 10px;
        }

        .paste-img {
          width: 16px;
          height: 16px;
          cursor: pointer;
          margin-left: 10px;
          opacity: 0.7;

          &:hover {
            opacity: 1;
          }
        }
      }

      .color-display {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 10px 0 0 130px;

        .color-block {
          width: 40px;
          height: 20px;
          border: 1px solid var(--foreground-color);
        }

        .color-display-text {
          margin-left: 10px;
          color: var(--font-color-high);
          font-weight: bold;
        }

        .copy-img {
          width: 20px;
          height: 20px;
          cursor: pointer;
          margin-left: 10px;
          opacity: 0.7;

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .preview {
      margin: 0 10px 13px 13px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 600px;
      min-height: 440px;
      max-height: 440px;
      background-color: var(--background-color);
      border: 1px solid var(--foreground-color);

      .font-size-preview {
        display: flex;
        flex-direction: column;
        align-items: start;
        font-size: 12px;

        .play-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 50%;

          .play-img {
            margin-left: 3px;
            width: 16px;
          }
        }
      }

      .up {
        height: calc(100% - 50px);
        display: flex;
        flex-direction: row;

        .left {
          display: flex;
          flex-direction: column;
          padding: 10px 0;
          gap: 10px;
          width: 110px;
          height: 100%;
          align-items: center;

          .sidebar-item {
            width: calc(100% - 20px);
            text-align: left;
          }

          .logo {
            width: 100px;
            margin-bottom: 10px;
          }
        }

        .right {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: start;
          padding: 50px 0 0 50px;
          width: calc(100% - 200px);

          .content-img {
            display: flex;
            flex-direction: column;
            cursor: pointer;
            align-items: center;
            justify-content: space-between;
            padding: 15px 0;
            gap: 13px;
            width: 321px;
          }

          .font-color-display {
            display: flex;
            flex-direction: column;
            align-items: start;
            padding-top: 20px;
            gap: 10px;
            width: 100%;

            .display-item {
              display: flex;
              flex-direction: row;
              gap: 5px;
              align-items: center;
              justify-content: center;
            }
          }
        }
      }

      .down {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 10px;
        height: 50px;
        background-color: var(--panel-background-color);
        justify-content: space-between;
      }
    }
  }

  .input {
    padding: 5px 10px;
    resize: none;
    width: 120px;
  }

  .check {
    display: flex;
    align-items: center;
    width: 100%;
    // gap: 5px;

    input {
      cursor: pointer;
    }

    label {
      cursor: pointer;
      color: var(--font-color-high);
    }
  }

  .create {
    width: fit-content;
    border-radius: 20px;
    padding: 5px 20px 8px 20px;
    background-color: rgb(var(--highlight-color-rgb));
    color: #fff;
    border: none;
    cursor: pointer;
  }
}
</style>
