<template>
  <div class="display">
    <div class="button font-color-main" @click="$router.push({ path: '/audio/test' })">
      点击跳转到音频调试界面
    </div>
    <div class="button font-color-main" @click="clearCache">
      点击清除webFrame缓存
    </div>
  </div>
</template>

<script lang="ts">
import { YColor } from "@/utils/color";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YTestView",
  components: {
  },
  setup() {
    const store = useStore();

    return {
      player: store.state.player,
      setting: store.state.setting,
      download: store.state.download,
    };
  },
  computed: {},
  data() {
    return {};
  },
  methods: {
    clearCache() {
      window.electron.clearCache();
      console.log("clearCache");
      const usage = window.electron.getResourceUsage();
      const test = window.electron.getProcessInfo();
      console.log(JSON.stringify(test, null, 4));
    }
  },
  mounted() {
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("Test  View"));
    window.test = this.player;
  },
  beforeUnmount() {},
});
</script>

<style lang="scss" scoped>
.display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .scrollable {
    width: 100%;
    height: 100%;
  }
  
  .button {
    cursor: pointer;
  }
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}
</style>
