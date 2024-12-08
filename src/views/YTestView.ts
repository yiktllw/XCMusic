import { YColor } from "@/utils/color";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YTestView",
  components: {},
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
    },
  },
  mounted() {
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("Test  View"));
    window.test = this.player;
  },
  beforeUnmount() {},
});
