import { YColor } from "@/utils/color";
import { Theme1, Theme2 } from "@/utils/theme";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YGreetingView",
  setup() {
    const store = useStore();
    return {
      setting: store.state.setting,
    };
  },
  mounted() {
    // YColor.setBackgroundColorTheme();
    try {
      const theme = YColor.findTheme(this.setting.display.theme);
      YColor.setBackgroundColorHex(
        YColor.getColorFromThreeLetters("hello"),
        (theme as Theme1).type,
        (theme as Theme2).background,
      );
    } catch (error) {
      console.error("YGreetingView", error);
    }
  },
});
