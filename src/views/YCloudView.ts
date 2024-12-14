import { defineComponent } from "vue";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { User } from "@/utils/api";
import { useStore } from "vuex";
import { ITrack, Tracks } from "@/utils/tracks";
import YPage from "@/components/base/YPage.vue";
import { YPageC } from "@/dual/YPageC";
import { YColor } from "@/utils/color";
import { Message } from "@/dual/YMessageC";

export default defineComponent({
  name: "YCloudView",
  setup() {
    const store = useStore();
    return {
      login: store.state.login,
      download: store.state.download,
      player: store.state.player,
    };
  },
  components: {
    YSongsTable,
    YPage,
  },
  mounted() {
    const color = YColor.stringToHexColor("CLOUD");
    YColor.setBackgroundColorHex2(color);
    this.fetchTracks(true);
  },
  beforeUnmount() {},
  data() {
    return {
      tracks: [] as ITrack[],
      page: new YPageC(1),
    };
  },
  watch: {
    "page.current"() {
      this.fetchTracks();
    },
  },
  methods: {
    fetchTracks(newPage = false) {
      const limit = 100;
      User.getCloudInfo({
        cookie: this.login.cookie,
        limit: limit,
        offset: (this.page.current - 1) * limit,
      }).then((res) => {
        this.tracks = new Tracks({
          url: "/user/cloud",
          tracks: res.data,
        }).tracks;

        if (newPage) {
          this.page = new YPageC(Math.ceil(res.count / limit));
        }
      });
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
