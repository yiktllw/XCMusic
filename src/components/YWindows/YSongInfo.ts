import { defineComponent, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import YScroll from "@/components/base/YScroll.vue";
import { Message } from "@/dual/YMessageC";
import { isLocal } from "@/utils/localTracks_renderer";
import { useStore } from "vuex";
import { type ITrack } from "@/utils/tracks";
import { GlobalMsgEvents } from "@/dual/globalMsg";

export default defineComponent({
  name: "YSongInfo",
  props: {
    track: {
      type: Object as () => ITrack,
      required: true,
    },
  },
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();
    const store = useStore();

    return {
      window,
      globalMsg: store.state.globalMsg,
    };
  },
  beforeUnmount() {
    this.window = null;
  },
  components: {
    YWindow,
    YScroll,
  },
  data() {
    return {};
  },
  emits: ["new-window-state"],
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    copy(text: string) {
      navigator.clipboard.writeText(text).then(
        () => {
          console.log("复制成功: ", text);
          Message.post("success", `复制成功: ${text}`);
        },
        () => {
          Message.post("error", `复制失败: ${text}`);
        },
      );
    },
    openArtist(id: number | string) {
      if (!id || isLocal(id)) return;
      this.$router.push(`/artist/${id}`);
      this.globalMsg.post(GlobalMsgEvents.ClosePlayUI);
      this.window?.closeWindow();
    },
    openAlbum(id: number | string) {
      if (!id || isLocal(id)) return;
      this.$router.push(`/album/${id}`);
      this.globalMsg.post(GlobalMsgEvents.ClosePlayUI);
      this.window?.closeWindow();
    },
    isLocal(id: number | string) {
      return isLocal(id);
    },
  },
});
