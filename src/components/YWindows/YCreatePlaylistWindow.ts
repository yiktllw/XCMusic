import { defineComponent, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import { Playlist } from "@/utils/api";
import { Message } from "@/dual/YMessageC";
import { useStore } from "vuex";

export default defineComponent({
  name: "YCreatePlaylistWindow",
  components: {
    YWindow,
  },
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();
    const store = useStore();

    return {
      window,
      login: store.state.login,
    };
  },
  beforeUnmount() {
    this.window = null;
  },
  data() {
    return {
      inputValue: "",
      isPrivate: false,
    };
  },
  emits: ["new-window-state"],
  methods: {
    switchPrivate() {
      this.isPrivate = !this.isPrivate;
    },
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    async createPlaylist() {
      if (this.inputValue.length === 0) {
        Message.post("error", this.$t("create_playlist.no_name"));
        return;
      }
      await Playlist.create(this.inputValue, this.isPrivate ? 10 : 0)
        .then((res) => {
          if (res.code !== 200) {
            Message.post("error", this.$t("create_playlist.error"));
            return;
          } else {
            Message.post("success", this.$t("create_playlist.success"));
          }
          this.login.refreshUserPlaylists();
        })
        .catch((err) => {
          console.error(err);
          Message.post("error", this.$t("create_playlist.error"));
        });
      this.window?.closeWindow();
    },
  },
});
