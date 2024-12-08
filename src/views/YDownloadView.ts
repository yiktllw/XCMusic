import { defineComponent } from "vue";
import { useStore } from "vuex";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { ITrack, TrackIds } from "@/utils/tracks";
import { YColor } from "@/utils/color";
import { ITrackWithProgress } from "@/dual/YLocalSongsView";
import { DownloadEvents } from "@/dual/download_renderer";

export default defineComponent({
  name: "YLocalSongsView",
  components: {
    YSongsTable,
  },
  setup() {
    const store = useStore();
    return {
      download: store.state.download,
    };
  },
  data() {
    return {
      tracks: [] as ITrack[],
      downloading: [] as ITrackWithProgress[],
      downloadingKey: 0,
    };
  },
  methods: {
    async getDownloadedTracks() {
      const ids = this.download.downloadedSongIds;
      const temp = new TrackIds(ids);
      await temp.initData();
      this.tracks = temp.tracks;
    },
  },
  mounted() {
    YColor.setBackgroundColorHex2(
      YColor.stringToHexColor("Downloaded Music   "),
    );
    this.getDownloadedTracks();
    this.download.subscriber.on(
      "YLocalSongsView",
      DownloadEvents.Complete,
      async () => {
        await this.getDownloadedTracks();
        this.downloading = this.download.downloading;
        this.downloadingKey += 1;
      },
    );
    this.downloading = this.download.downloading;
    this.download.subscriber.on("YLocalSongsView", DownloadEvents.Doing, () => {
      this.downloading = this.download.downloading;
      this.downloadingKey += 1;
    });
  },
  beforeUnmount() {
    this.download.subscriber.offAll("YLocalSongsView");
  },
});