<template>
  <!--欢迎界面-->
  <div class="container">
    <img src="@/assets/xc-up.svg" class="up-img g-icon" />
    <img src="@/assets/xc.svg" class="full-width-image g-icon" />
    <img src="@/assets/xc-down.svg" class="down-img g-icon" />
  </div>
</template>

<script lang="ts">
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
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  // background-color: #cc77bf;

  .up-img {
    top: 20px;
    position: absolute;
    width: calc(100% - 40px);
    max-width: calc(100% - 40px);
    max-height: 10%;
  }

  .down-img {
    bottom: 20px;
    position: absolute;
    width: calc(100% - 40px);
    max-width: calc(100% - 40px);
    max-height: 10%;
  }

  .full-width-image {
    opacity: 0.9;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
