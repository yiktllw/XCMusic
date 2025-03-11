import YWindow from "@/components/base/YWindow.vue";
import YScroll from "@/components/base/YScroll.vue";
import { defineComponent, ref } from "vue";
import { Message } from "@/dual/YMessageC";
import { Playlist } from "@/utils/api";
import { useStore } from "vuex";
import { type IPlaylist } from "@/utils/login";
import { LoginEvents } from "@/dual/login";

export default defineComponent({
  name: "YAddToPlaylist",
  props: {
    ids: {
      type: Array as () => number[],
      required: true,
    },
  },
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();
    return {
      window,
    };
  },
  emits: ["new-window-state"],
  components: {
    YWindow,
    YScroll,
  },
  computed: {
    login() {
      return useStore().state.login;
    },
  },
  data() {
    return {
      userPlaylists: [] as IPlaylist[],
    };
  },
  methods: {
    async addToPlaylist(playlistId: number | string) {
      await Playlist.addTracks(playlistId as number, this.ids)
        .then((res) => {
          if (res.status !== 200) {
            Message.post("error", this.$t("song_added_failed"));
          } else {
            if (res.body.message) {
              Message.post("warning", res.body.message);
            } else {
              Message.post("success", this.$t("song_added_successfully"));
            }
          }
        })
        .catch((error) => {
          Message.post("error", this.$t("song_added_failed") + `${error}`);
          console.error("Failed to add track to playlist:", error);
        });
      this.window?.closeWindow();
      this.login.refreshUserPlaylists();
    },
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
  },
  mounted() {
    this.login.subscriber.on(
      "YAddToPlaylist",
      LoginEvents.userPlaylists,
      () => {
        this.userPlaylists = this.login.userPlaylists;
      },
    );
  },
  beforeUnmount() {
    this.login.subscriber.offAll("YAddToPlaylist");
    this.window = null;
  },
});
