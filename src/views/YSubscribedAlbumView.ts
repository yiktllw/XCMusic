import { defineComponent } from "vue";
import { User } from "@/utils/api";
import { YPageC } from "@/dual/YPageC";
import YPage from "@/components/base/YPage.vue";
import { useStore } from "vuex";
import YPlaylistBiglist from "@/components/list/YPlaylistBiglist.vue";
import { YColor } from "@/utils/color";
import { IBigPlaylist } from "@/dual/YPlaylistList";

export default defineComponent({
  name: "YSubscribedAlbumView",
  setup() {
    const store = useStore();
    return {
      login: store.state.login,
    };
  },
  components: {
    YPage,
    YPlaylistBiglist,
  },
  data() {
    return {
      page: new YPageC(1),
      albums: [] as IBigPlaylist[],
    };
  },
  mounted() {
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("收藏的专辑     "));
    this.getUserSubscribedAlbums(true);
  },
  watch: {
    "page.current"() {
      this.getUserSubscribedAlbums();
    },
  },
  methods: {
    async getUserSubscribedAlbums(newPage = false) {
      const LIMIT = 24;
      await User.getSubAlbums(this.page.current, LIMIT)
        .then((res) => {
          if (!res) {
            return;
          }
          if (newPage) {
            this.page = new YPageC(Math.ceil(res.count / LIMIT));
          }
          this.albums = res.albums.map((album) => {
            return {
              id: album.id,
              _bigPicUrl: album.picUrl + "?param=200y200",
              playCount: 0,
              name: album.name,
              size: album.size,
            };
          });
        })
        .catch((err) => {
          console.error("getUserSubscribedAlbums", err);
        });
    },
  },
});
