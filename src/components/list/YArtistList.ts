import { defineComponent } from "vue";
import { IArtist } from "@/dual/YArtistList";

export default defineComponent({
  name: "YArtistList",
  props: {
    // 歌手列表
    artists: {
      type: Array as () => IArtist[],
      default: () => [],
    },
    // 类型
    type: {
      type: String,
      default: "artist", // artist: 歌手, user: 用户
    },
  },
  methods: {
    openUserPage(id: number | string) {
      if (this.type === "artist") {
        console.log("open artist page :", id);
        this.$router.push({ path: `/artist/${id}` });
      } else if (this.type === "user") {
        console.log("open user page :", id);
        this.$router.push({ path: `/user/${id}` });
      }
    },
  },
});
