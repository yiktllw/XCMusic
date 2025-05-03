import { YColor } from "@/utils/color";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import YFontsSelect from "@/components/base/YFontsSelect.vue";

export default defineComponent({
  name: "YTestView",
  components: {
    YFontsSelect,
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
      const test = window.electron.getProcessInfo();
      console.log(JSON.stringify(test, null, 4));
    },
    setEq() {
      this.player.setEqualizer({
        _32Hz: 12,
        _64Hz: 8,
        _125Hz: 4,
        _250Hz: 0,
        _500Hz: -2,
        _1kHz: -4,
        _2kHz: -6,
        _4kHz: -8,
        _8kHz: -10,
        _16kHz: -12,
      });
    },
  },
  mounted() {
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("Test  View"));
  },
  beforeUnmount() {},
});
