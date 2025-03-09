import { YColor } from "@/utils/color";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import YSongsTableNew from "@/components/list/YSongsTableNew/index.vue";
import {
  getDefaultColumns,
  type ISongsTableProps,
} from "@/components/list/YSongsTableNew/types";

export default defineComponent({
  name: "YTestView",
  components: {
    YSongsTableNew,
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
    let columnsOptions = getDefaultColumns();
    columnsOptions.popularity = false;
    return {
      options: {
        id_for_subscribe: "test",
        songs: [],
        mode: "playlist",
        columns: columnsOptions,
        editable: false,
        allow_play_all: true,
      } as ISongsTableProps,
    };
  },
  methods: {
    clearCache() {
      window.electron.clearCache();
      console.log("clearCache");
      const usage = window.electron.getResourceUsage();
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
    this.options.songs = this.player.playlist.slice();
    window.test = this.player;
  },
  beforeUnmount() {},
});
