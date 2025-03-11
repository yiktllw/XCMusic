import { defineComponent } from "vue";
import type { IBigPlaylist, IPlaylist } from "@/dual/YPlaylistList";
export default defineComponent({
  name: "YPlaylistBiglist",
  props: {
    playlists: {
      type: Array as () => Array<IBigPlaylist | IPlaylist>,
      default: () => [],
    },
    type: {
      type: String,
      default: "playlist",
      validator(value: string) {
        return ["playlist", "album"].includes(value);
      },
    },
    stickyTop: {
      type: String,
      default: "0px",
    },
  },
  methods: {
    openPlaylist(id: number | string) {
      if (typeof id === "string" && id.startsWith("user-record-")) {
        let uid = id.split("user-record-")[1];
        this.$router.push({ path: `/user_songs_rank/${uid}` });
        // console.log('open user record page: ', uid);
        return;
      }
      this.type === "playlist"
        ? this.$router.push({ path: `/playlist/${id}` })
        : this.$router.push({ path: `/album/${id}` });
    },
  },
});
