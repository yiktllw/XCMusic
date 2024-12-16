import YSongsTable from "@/components/list/YSongsTable.vue";
import YPlaylistList from "@/components/list/YPlaylistList.vue";
import YArtistList from "@/components/list/YArtistList.vue";
import YSearchLyrics from "@/components/list/YSearchLyrics.vue";
import YScroll from "@/components/base/YScroll.vue";
import YPage from "@/components/base/YPage.vue";
import YLoading from "@/components/base/YLoading.vue";
import { ITrack } from "@/utils/tracks";
import { YPageC } from "@/dual/YPageC";
import { YColor } from "@/utils/color";
import { Search } from "@/utils/api";
import { markRaw, defineComponent } from "vue";
import { IPlaylist } from "@/dual/YPlaylistList";
import { IArtist } from "@/dual/YArtistList";

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
    };
  },
  methods: {
    // 切换搜索位置
    handleSwitcher(position: string) {
      console.log("switch position", position);
      this.$router.push({ path: `/search/${this.search}/${position}` });
    },
    // 搜索歌曲
    async fetchTracks(newPageInstance = true) {
      this.Loading.songs = true;
      await Search.songs(this.search, this.songsPage.current)
        .then((result) => {
          this.switcher[0].tracks = markRaw(result.songs);
          this.switcher[0].total = result.songCount;
          if (newPageInstance) {
            this.songsPage = new YPageC(Math.ceil(result.songCount / 100));
          }
          this.songsPage.onPageChange = () => {
            this.fetchTracks(false);
          };
        })
        .catch((err) => {
          console.log("fetchTracks", err);
        });
      this.Loading.songs = false;
    },
    // 搜索歌单
    async fetchPlaylists(newPageInstance = true) {
      this.Loading.playlists = true;
      await Search.playlists(this.search, this.playlistsPage.current)
        .then((result) => {
          this.switcher[2].playlists = result.playlists?.map((playlist) => {
            return {
              ...playlist,
              _picUrl: playlist.coverImgUrl + "?param=80y80",
            };
          });
          this.switcher[2].total = result.playlistCount;
          if (newPageInstance) {
            this.playlistsPage = new YPageC(
              Math.ceil(result.playlistCount / 100)
            );
          }
          this.playlistsPage.onPageChange = () => {
            this.fetchPlaylists(false);
          };
        })
        .catch((err) => {
          console.log("fetchPlaylists", err);
        });
      this.Loading.playlists = false;
    },
    // 搜索专辑
    async fetchAlbums(newPageInstance = true) {
      this.Loading.albums = true;
      await Search.albums(this.search, this.albumsPage.current)
        .then((result) => {
          this.switcher[1].playlists = result.albums?.map((album) => {
            return {
              ...album,
              _picUrl: album.picUrl + "?param=80y80",
            };
          });
          this.switcher[1].total = result.albumCount;
          if (newPageInstance) {
            this.albumsPage = new YPageC(Math.ceil(result.albumCount / 100));
          }
          this.albumsPage.onPageChange = () => {
            this.fetchAlbums(false);
          };
        })
        .catch((err) => {
          console.log("fetchAlbums", err);
        });
      this.Loading.albums = false;
    },
    // 搜索歌手
    async fetchArtists(newPageInstance = true) {
      this.Loading.artists = true;
      await Search.artists(this.search, this.artistsPage.current)
        .then((result) => {
          this.switcher[3].artists = result.artists?.map((artist) => {
            return {
              ...artist,
              _picUrl: artist.picUrl + "?param=130y130",
            };
          });
          this.switcher[3].total = result.artistCount;
          if (newPageInstance) {
            this.artistsPage = new YPageC(Math.ceil(result.artistCount / 100));
          }
          this.artistsPage.onPageChange = () => {
            this.fetchArtists(false);
          };
        })
        .catch((err) => {
          console.log("fetchArtists", err);
        });
      this.Loading.artists = false;
    },
    // 搜索歌词
    async fetchLyrics(newPageInstance = true) {
      this.Loading.lyrics = true;
      await Search.songsWithLyrics(this.search, this.lyricsPage.current)
        .then((result) => {
          this.switcher[4].lyricsList = markRaw(result.songs);
          this.switcher[4].total = result.songCount;
          if (newPageInstance) {
            this.lyricsPage = new YPageC(Math.ceil(result.songCount / 100));
          }
          this.lyricsPage.onPageChange = () => {
            this.fetchLyrics(false);
          };
        })
        .catch((err) => {
          console.log("fetchLyrics", err);
        });
      this.Loading.lyrics = false;
    },
    // 搜索用户
    async fetchUsers(newPageInstance = true) {
      this.Loading.users = true;
      await Search.users(this.search, this.usersPage.current)
        .then((result) => {
          this.switcher[5].users = result.userprofiles?.map((user) => {
            return {
              ...user,
              _picUrl: user.avatarUrl + "?param=130y130",
            };
          });
          this.switcher[5].total = result.userprofileCount;
          if (newPageInstance) {
            this.usersPage = new YPageC(
              Math.ceil(result.userprofileCount / 100)
            );
          }
          this.usersPage.onPageChange = () => {
            this.fetchUsers(false);
          };
        })
        .catch((err) => {
          console.log("fetchUsers", err);
        });
      this.Loading.users = false;
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
    // 设置背景颜色
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("Searchview"));
    // 当前位置为默认位置时, 跳转到上次搜索位置
    this.position === "default"
      ? this.$router.push({
          path: `/search/${this.search}/${this.lastPosition}`,
        })
      : null;
  },
});
