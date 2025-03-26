import { defineComponent } from "vue";
import { formatDate_yyyymmdd } from "@/utils/time";
import { type IPlaylist } from "@/dual/YPlaylistList";

export default defineComponent({
  name: "YPlaylistList",
  props: {
    playlists: {
      type: Array as () => IPlaylist[],
      default: () => [],
    },
    type: {
      type: String,
      default: "playlist",
    },
    stickyTop: {
      type: String,
      default: "0px",
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    openPlaylist(id: number | string) {
      if (typeof id === "string" && id.startsWith("user-record-")) {
        let uid = id.split("user-record-")[1];
        this.$router.push({ path: `/user_songs_rank/${uid}` });
        return;
      }
      this.type === "playlist"
        ? this.$router.push({ path: `/playlist/${id}` })
        : this.$router.push({ path: `/album/${id}` });
    },
    openUserPage(id: number | string) {
      const mode = this.type === "playlist" ? "user" : "artist";
      this.$router.push({ path: `/${mode}/${id}` });
    },
    formatedPlayCount(count: number) {
      return count > 10000 ? `${(count / 10000).toFixed(1)}万` : count;
    },
    formatedTime(time: number) {
      return formatDate_yyyymmdd(time);
    },
  },
});
