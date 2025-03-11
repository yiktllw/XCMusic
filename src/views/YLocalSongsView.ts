import { defineComponent, toRaw } from "vue";
import { useStore } from "vuex";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { type ITrack, Tracks } from "@/utils/tracks";
import { YColor } from "@/utils/color";
import { type musicFile } from "@/utils/localTracks";
import YLoading from "@/components/base/YLoading.vue";

export default defineComponent({
  name: "YLocalSongsView",
  components: {
    YSongsTable,
    YLoading,
  },
  setup() {
    const store = useStore();
    return {
      setting: store.state.setting,
    };
  },
  computed: {},
  data() {
    return {
      localTracks: [] as ITrack[],
      localPaths: [] as string[],
      loading: true,
    };
  },
  methods: {
    async init() {
      const paths = toRaw(this.setting.download.localPaths);
      let res: musicFile[] = [];
      for (const path of paths)
        res = res.concat(
          await window.electron.ipcRenderer.invoke("get-local-tracks", path),
        );
      this.localTracks = new Tracks({
        url: "local",
        tracks: res,
      }).tracks;
      this.loading = false;
    },
  },
  mounted() {
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("Local Music     "));
    this.init();
    this.localPaths = toRaw(this.setting.download.localPaths);
  },
  beforeUnmount() {},
});
