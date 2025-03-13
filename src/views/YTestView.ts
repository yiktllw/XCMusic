import { YColor } from "@/utils/color";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import YPlaylistViewNew from "@/views/YPlaylistViewNew/index.vue";

export default defineComponent({
  name: "YTestView",
  components: {
    YPlaylistViewNew,
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
    // Playlist.getAlbum(34588440).then((res) => {
    //   if (!res) return;
    //   this.options.reelOptions = {
    //     showReels: true,
    //     reels: res.showreels,
    //   };
    //   this.options.songs = new Tracks({
    //     url: "/api/album/v3/detail",
    //     tracks: res.songs,
    //     params: {
    //       reels: res.showreels,
    //     },
    //   }).tracks;
    // });
    // this.options.songs = this.player.playlist.slice();
    // window.test = this.player;
  },
  beforeUnmount() {},
});
