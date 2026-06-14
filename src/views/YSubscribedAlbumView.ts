import { defineComponent } from "vue";
import { User } from "@/utils/api";
import { YPageC } from "@/dual/YPageC";
import YPage from "@/components/base/YPage.vue";
import { useStore } from "vuex";
import YPlaylistBiglist from "@/components/list/YPlaylistBiglist.vue";

import { type IBigPlaylist } from "@/dual/YPlaylistList";
import YLoading from "@/components/base/YLoading.vue";

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
    YLoading,
  },
  data() {
    return {
      page: new YPageC(1),
      loading: true,
      albums: [] as IBigPlaylist[],
      albumRequestId: 0,
    };
  },
  mounted() {
    this.bindPageChange();
    void this.getUserSubscribedAlbums(true);
  },
  methods: {
    resolveTotalPages(totalCount: number | undefined, limit: number) {
      return Math.max(1, Math.ceil((totalCount ?? 0) / limit));
    },
    bindPageChange() {
      this.page.onPageChange = () => {
        this.loading = true;
        void this.getUserSubscribedAlbums();
      };
    },
    nextAlbumRequestId() {
      this.albumRequestId += 1;
      return this.albumRequestId;
    },
    isLatestAlbumRequest(requestId: number) {
      return requestId === this.albumRequestId;
    },
    async getUserSubscribedAlbums(newPage = false) {
      const requestId = this.nextAlbumRequestId();
      const LIMIT = 24;
      this.loading = true;

      await User.getSubAlbums(this.page.current, LIMIT)
        .then((res) => {
          if (!this.isLatestAlbumRequest(requestId)) return;
          if (!res) {
            return;
          }

          const totalPages = this.resolveTotalPages(res.count, LIMIT);
          if (newPage) {
            this.page = new YPageC(totalPages);
            this.bindPageChange();
          } else {
            this.page.total = totalPages;
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
          this.loading = false;
        })
        .catch((err) => {
          if (!this.isLatestAlbumRequest(requestId)) return;
          console.error("getUserSubscribedAlbums", err);
          this.loading = false;
        });
    },
  },
});
