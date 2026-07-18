import YSongsTable from "@/components/list/YSongsTable.vue";
import YPlaylistList from "@/components/list/YPlaylistList.vue";
import YArtistList from "@/components/list/YArtistList.vue";
import YSearchLyrics from "@/components/list/YSearchLyrics.vue";
import YScroll from "@/components/base/YScroll.vue";
import YPage from "@/components/base/YPage.vue";
import YLoading from "@/components/base/YLoading.vue";
import YSongsTableSkeleton from "@/components/list/YSongsTableSkeleton.vue";
import { type ITrack } from "@/utils/tracks";
import { YPageC } from "@/dual/YPageC";

import { Search } from "@/utils/api";
import { markRaw, defineComponent } from "vue";
import { type IPlaylist } from "@/dual/YPlaylistList";
import { type IArtist } from "@/dual/YArtistList";

type SearchPagerKey =
  | "songs"
  | "albums"
  | "playlists"
  | "artists"
  | "lyrics"
  | "users";

export default defineComponent({
  name: "YSearchView",
  props: {
    // 搜索关键字
    search: {
      type: String,
      required: true,
    },
    // 搜索位置
    position: {
      type: String,
      default: "song",
    },
  },
  watch: {
    // 监听搜索位置变化, 切换搜索位置
    position(newPosition) {
      this.fetchData(newPosition);
      if (newPosition !== "default") {
        this.lastPosition = newPosition;
      }
    },
    // 监听搜索关键字变化, 重新搜索
    search() {
      this.fetchData(this.position);
    },
  },
  components: {
    YSongsTable,
    YScroll,
    YPlaylistList,
    YArtistList,
    YSearchLyrics,
    YPage,
    YLoading,
    YSongsTableSkeleton,
  },
  data() {
    return {
      // 导航
      switcher: [
        {
          display: "search_view.switcher.song",
          position: "song",
          tracks: [] as ITrack[],
          total: 0,
        },
        {
          display: "search_view.switcher.album",
          position: "album",
          playlists: [] as IPlaylist[],
          total: 0,
        },
        {
          display: "search_view.switcher.playlist",
          position: "playlist",
          playlists: [] as IPlaylist[],
          total: 0,
        },
        {
          display: "search_view.switcher.artist",
          position: "artist",
          artists: [] as IArtist[],
          total: 0,
        },
        {
          display: "search_view.switcher.lyric",
          position: "lyric",
          lyricsList: [] as ITrack[],
          total: 0,
        },
        {
          display: "search_view.switcher.user",
          position: "user",
          users: [] as IArtist[],
          total: 0,
        },
      ],
      // 上次搜索位置
      lastPosition: "song",
      Loading: {
        songs: true,
        albums: true,
        playlists: true,
        artists: true,
        lyrics: true,
        users: true,
      },
      songsPage: new YPageC(1),
      albumsPage: new YPageC(1),
      playlistsPage: new YPageC(1),
      artistsPage: new YPageC(1),
      lyricsPage: new YPageC(1),
      usersPage: new YPageC(1),
      searchPageSize: 100,
      searchRequestId: {
        songs: 0,
        albums: 0,
        playlists: 0,
        artists: 0,
        lyrics: 0,
        users: 0,
      } as Record<SearchPagerKey, number>,
    };
  },
  methods: {
    // 切换搜索位置
    handleSwitcher(position: string) {
      // console.log("switch position", position);
      this.$router.push({ path: `/search/${this.search}/${position}` });
    },
    resolveSearchTotalPages(totalCount: number | undefined) {
      return Math.max(1, Math.ceil((totalCount ?? 0) / this.searchPageSize));
    },
    nextSearchRequestId(key: SearchPagerKey) {
      this.searchRequestId[key] += 1;
      return this.searchRequestId[key];
    },
    isLatestSearchRequest(key: SearchPagerKey, requestId: number) {
      return this.searchRequestId[key] === requestId;
    },
    bindSearchPager(page: YPageC, fetcher: () => Promise<void>) {
      page.onPageChange = () => {
        void fetcher();
      };
    },
    // 搜索歌曲
    async fetchTracks(newPageInstance = true) {
      const requestId = this.nextSearchRequestId("songs");
      this.Loading.songs = true;
      const currentPage = newPageInstance ? 1 : this.songsPage.current;
      await Search.songs(this.search, currentPage, this.searchPageSize)
        .then((result) => {
          if (!this.isLatestSearchRequest("songs", requestId)) return;

          this.switcher[0].tracks = markRaw(result.songs);
          this.switcher[0].total = result.songCount;
          const totalPages = this.resolveSearchTotalPages(result.songCount);

          if (newPageInstance) {
            this.songsPage = new YPageC(totalPages);
          } else {
            this.songsPage.total = totalPages;
          }

          this.bindSearchPager(this.songsPage, () => this.fetchTracks(false));
        })
        .catch(() => {
          // console.log("fetchTracks", err);
        });
      if (this.isLatestSearchRequest("songs", requestId)) {
        this.Loading.songs = false;
      }
    },
    // 搜索歌单
    async fetchPlaylists(newPageInstance = true) {
      const requestId = this.nextSearchRequestId("playlists");
      this.Loading.playlists = true;
      const currentPage = newPageInstance ? 1 : this.playlistsPage.current;
      await Search.playlists(this.search, currentPage, this.searchPageSize)
        .then((result) => {
          if (!this.isLatestSearchRequest("playlists", requestId)) return;

          this.switcher[2].playlists = result.playlists?.map((playlist) => {
            return {
              ...playlist,
              _picUrl: playlist.coverImgUrl + "?param=80y80",
            };
          });
          this.switcher[2].total = result.playlistCount;
          const totalPages = this.resolveSearchTotalPages(result.playlistCount);

          if (newPageInstance) {
            this.playlistsPage = new YPageC(totalPages);
          } else {
            this.playlistsPage.total = totalPages;
          }

          this.bindSearchPager(this.playlistsPage, () =>
            this.fetchPlaylists(false),
          );
        })
        .catch(() => {
          // console.log("fetchPlaylists", err);
        });
      if (this.isLatestSearchRequest("playlists", requestId)) {
        this.Loading.playlists = false;
      }
    },
    // 搜索专辑
    async fetchAlbums(newPageInstance = true) {
      const requestId = this.nextSearchRequestId("albums");
      this.Loading.albums = true;
      const currentPage = newPageInstance ? 1 : this.albumsPage.current;
      await Search.albums(this.search, currentPage, this.searchPageSize)
        .then((result) => {
          if (!this.isLatestSearchRequest("albums", requestId)) return;

          this.switcher[1].playlists = result.albums?.map((album) => {
            return {
              ...album,
              _picUrl: album.picUrl + "?param=80y80",
            };
          });
          this.switcher[1].total = result.albumCount;
          const totalPages = this.resolveSearchTotalPages(result.albumCount);

          if (newPageInstance) {
            this.albumsPage = new YPageC(totalPages);
          } else {
            this.albumsPage.total = totalPages;
          }

          this.bindSearchPager(this.albumsPage, () => this.fetchAlbums(false));
        })
        .catch(() => {
          // console.log("fetchAlbums", err);
        });
      if (this.isLatestSearchRequest("albums", requestId)) {
        this.Loading.albums = false;
      }
    },
    // 搜索歌手
    async fetchArtists(newPageInstance = true) {
      const requestId = this.nextSearchRequestId("artists");
      this.Loading.artists = true;
      const currentPage = newPageInstance ? 1 : this.artistsPage.current;
      await Search.artists(this.search, currentPage, this.searchPageSize)
        .then((result) => {
          if (!this.isLatestSearchRequest("artists", requestId)) return;

          this.switcher[3].artists = result.artists?.map((artist) => {
            const _picUrl = artist.picUrl
              ? artist.picUrl + "?param=130y130"
              : null;
            return {
              ...artist,
              _picUrl,
            };
          });
          this.switcher[3].total = result.artistCount;
          const totalPages = this.resolveSearchTotalPages(result.artistCount);

          if (newPageInstance) {
            this.artistsPage = new YPageC(totalPages);
          } else {
            this.artistsPage.total = totalPages;
          }

          this.bindSearchPager(this.artistsPage, () =>
            this.fetchArtists(false),
          );
        })
        .catch(() => {
          // console.log("fetchArtists", err);
        });
      if (this.isLatestSearchRequest("artists", requestId)) {
        this.Loading.artists = false;
      }
    },
    // 搜索歌词
    async fetchLyrics(newPageInstance = true) {
      const requestId = this.nextSearchRequestId("lyrics");
      this.Loading.lyrics = true;
      const currentPage = newPageInstance ? 1 : this.lyricsPage.current;
      await Search.songsWithLyrics(
        this.search,
        currentPage,
        this.searchPageSize,
      )
        .then((result) => {
          if (!this.isLatestSearchRequest("lyrics", requestId)) return;

          this.switcher[4].lyricsList = markRaw(result.songs);
          this.switcher[4].total = result.songCount;
          const totalPages = this.resolveSearchTotalPages(result.songCount);

          if (newPageInstance) {
            this.lyricsPage = new YPageC(totalPages);
          } else {
            this.lyricsPage.total = totalPages;
          }

          this.bindSearchPager(this.lyricsPage, () => this.fetchLyrics(false));
        })
        .catch(() => {
          // console.log("fetchLyrics", err);
        });
      if (this.isLatestSearchRequest("lyrics", requestId)) {
        this.Loading.lyrics = false;
      }
    },
    // 搜索用户
    async fetchUsers(newPageInstance = true) {
      const requestId = this.nextSearchRequestId("users");
      this.Loading.users = true;
      const currentPage = newPageInstance ? 1 : this.usersPage.current;
      await Search.users(this.search, currentPage, this.searchPageSize)
        .then((result) => {
          if (!this.isLatestSearchRequest("users", requestId)) return;

          this.switcher[5].users = result.userprofiles?.map((user) => {
            const _picUrl = user.avatarUrl
              ? user.avatarUrl + "?param=130y130"
              : null;
            return {
              ...user,
              _picUrl,
            };
          });
          this.switcher[5].total = result.userprofileCount;
          const totalPages = this.resolveSearchTotalPages(
            result.userprofileCount,
          );

          if (newPageInstance) {
            this.usersPage = new YPageC(totalPages);
          } else {
            this.usersPage.total = totalPages;
          }

          this.bindSearchPager(this.usersPage, () => this.fetchUsers(false));
        })
        .catch(() => {
          // console.log("fetchUsers", err);
        });
      if (this.isLatestSearchRequest("users", requestId)) {
        this.Loading.users = false;
      }
    },
    fetchData(position: string) {
      switch (position) {
        case "song":
          this.fetchTracks();
          break;
        case "album":
          this.fetchAlbums();
          break;
        case "playlist":
          this.fetchPlaylists();
          break;
        case "artist":
          this.fetchArtists();
          break;
        case "lyric":
          this.fetchLyrics();
          break;
        case "user":
          this.fetchUsers();
          break;
        case "default":
          this.$router.push({
            path: `/search/${this.search}/${this.lastPosition}`,
          });
          break;
      }
    },
  },
  mounted() {
    this.fetchData(this.position);
    // 当前位置为默认位置时, 跳转到上次搜索位置
    this.position === "default"
      ? this.$router.push({
          path: `/search/${this.search}/${this.lastPosition}`,
        })
      : null;
  },
});
