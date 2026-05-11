import { defineComponent, ref } from "vue";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { User } from "@/utils/api";
import { useStore } from "vuex";
import { type ITrack, Tracks } from "@/utils/tracks";
import YPage from "@/components/base/YPage.vue";
import { YPageC } from "@/dual/YPageC";
import { YColor } from "@/utils/color";
import { Message } from "@/dual/YMessageC";
import YSongsTableSkeleton from "@/components/list/YSongsTableSkeleton.vue";

export default defineComponent({
  name: "YCloudView",
  setup() {
    const store = useStore();
    const top_ref = ref<HTMLElement | null>(null);
    return {
      login: store.state.login,
      download: store.state.download,
      player: store.state.player,
      top_ref: top_ref,
    };
  },
  components: {
    YSongsTable,
    YPage,
    YSongsTableSkeleton,
  },
  mounted() {
    const color = YColor.stringToHexColor("CLOUD");
    YColor.setBackgroundColorHex2(color);
    this.bindPageChange();
    void this.fetchTracks(true);
  },
  beforeUnmount() {},
  data() {
    return {
      loading: true,
      tracks: [] as ITrack[],
      page: new YPageC(1),
      cloudRequestId: 0,
    };
  },
  methods: {
    resolveTotalPages(totalCount: number | undefined, limit: number) {
      return Math.max(1, Math.ceil((totalCount ?? 0) / limit));
    },
    bindPageChange() {
      this.page.onPageChange = () => {
        this.loading = true;
        void this.fetchTracks();
      };
    },
    nextCloudRequestId() {
      this.cloudRequestId += 1;
      return this.cloudRequestId;
    },
    isLatestCloudRequest(requestId: number) {
      return requestId === this.cloudRequestId;
    },
    async fetchTracks(newPage = false) {
      const requestId = this.nextCloudRequestId();
      const limit = 100;
      this.loading = true;

      await User.getCloudInfo({
        cookie: this.login.cookie,
        limit: limit,
        offset: (this.page.current - 1) * limit,
      })
        .then((res) => {
          if (!this.isLatestCloudRequest(requestId)) return;

          this.tracks = new Tracks({
            url: "/user/cloud",
            tracks: res.data,
          }).tracks;

          const totalPages = this.resolveTotalPages(res.count, limit);
          if (newPage) {
            this.page = new YPageC(totalPages);
            this.bindPageChange();
          } else {
            this.page.total = totalPages;
          }

          this.loading = false;
        })
        .catch((error) => {
          if (this.isLatestCloudRequest(requestId)) {
            this.loading = false;
          }
          console.error("fetchTracks error", error);
        });

      return;
    },
    async downloadAll() {
      Message.post("info", "message.getting_playlist_tracks", true);
      await User.getAllCloudTracks().then((res) => {
        const allTracks = new Tracks({
          url: "/user/cloud",
          tracks: res,
        }).tracks;

        this.download.addList(allTracks);
        Message.post("success", "localsongs.downloading", true);
      });
    },
    downloadCurrentPage() {
      this.download.addList(this.tracks);
      Message.post("success", "localsongs.downloading", true);
    },
    playAll() {
      User.getAllCloudTracks().then((res) => {
        const allTracks = new Tracks({
          url: "/user/cloud",
          tracks: res,
        }).tracks;

        this.player.playAll(allTracks);
        Message.post("success", "context.playAll", true);
      });
    },
    addToQueue() {
      User.getAllCloudTracks().then((res) => {
        const allTracks = new Tracks({
          url: "/user/cloud",
          tracks: res,
        }).tracks;

        this.player.addPlaylist(allTracks);
        Message.post(
          "success",
          "message.playlist_view.added_to_playlist",
          true,
        );
      });
    },
  },
});
