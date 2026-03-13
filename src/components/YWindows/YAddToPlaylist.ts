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
      selectedPlaylistIds: [] as Array<number | string>,
    };
  },
  methods: {
    togglePlaylist(playlistId: number | string) {
      const index = this.selectedPlaylistIds.findIndex(
        (id) => id === playlistId,
      );
      if (index >= 0) {
        this.selectedPlaylistIds.splice(index, 1);
      } else {
        this.selectedPlaylistIds.push(playlistId);
      }
    },
    async addToSelectedPlaylists() {
      if (this.selectedPlaylistIds.length === 0) return;

      let successCount = 0;
      let duplicateCount = 0;
      let failedCount = 0;

      for (const playlistId of this.selectedPlaylistIds) {
        await Playlist.addTracks(playlistId as number, [...this.ids])
          .then((res) => {
            if (res.status !== 200) {
              failedCount += 1;
              return;
            }
            Playlist.addNeedRefresh(playlistId as number);
            if (res.body.message) {
              duplicateCount += 1;
            } else {
              successCount += 1;
            }
          })
          .catch((error: unknown) => {
            failedCount += 1;
            console.error(
              `Failed to add track to playlist ${playlistId}:`,
              error,
            );
          });
      }

      const summary = `${this.$t("playlist_batch_result_prefix")}${this.$t(
        "playlist_batch_result_success",
      )}: ${successCount}，${this.$t("playlist_batch_result_duplicate")}: ${duplicateCount}，${this.$t("playlist_batch_result_failed")}: ${failedCount}`;

      if (failedCount > 0 && successCount === 0 && duplicateCount === 0) {
        Message.post("error", this.$t("song_added_failed"));
      } else if (failedCount > 0) {
        Message.post("warning", summary);
      } else {
        Message.post("success", summary);
      }

      if (this.login.status) {
        await this.login.reloadLikelist().catch((error: unknown) => {
          console.error("Failed to reload likelist:", error);
        });
      }

      this.selectedPlaylistIds = [];
      this.window?.closeWindow();
      this.login.refreshUserPlaylists();
    },
    cancel() {
      this.selectedPlaylistIds = [];
      this.window?.closeWindow();
    },
    handleNewWindowState(val: boolean) {
      if (val) {
        this.selectedPlaylistIds = [];
      }
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
