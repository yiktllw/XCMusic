import YScroll from "@/components/base/YScroll.vue";
import YPlaylistList from "@/components/list/YPlaylistList.vue";
import YPlaylistBiglist from "@/components/list/YPlaylistBiglist.vue";
import YSongsTable from "@/components/list/YSongsTable.vue";
import YLoading from "@/components/base/YLoading.vue";
import YPage from "@/components/base/YPage.vue";
import YSongsTableSkeleton from "@/components/list/YSongsTableSkeleton.vue";
import { ContentLoader } from "vue-content-loader";
import { User } from "@/utils/api";
import { YColor } from "@/utils/color";
import { useStore } from "vuex";
import { YPageC } from "@/dual/YPageC";
import { markRaw, defineComponent } from "vue";
import songsRank from "@/assets/songsrank.svg";
import { type Theme1, type Theme2 } from "@/utils/theme";
import { type IArtist, type IUser } from "@/dual/YUserView";

export default defineComponent({
  name: "YUserView",
  props: {
    // 用户 id
    userId: {
      type: Number,
      default: 0,
    },
    // 用户/歌手
    type: {
      type: String,
      default: "user", // user, artist
    },
  },
  watch: {
    // id变化时，重新获取用户信息
    userId() {
      this.fetchUser();
    },
  },
  components: {
    YScroll,
    YPlaylistList,
    YPlaylistBiglist,
    YSongsTable,
    YLoading,
    YPage,
    ContentLoader,
    YSongsTableSkeleton,
  },
  data() {
    return {
      // 用户/歌手信息
      user: null as IUser | IArtist | null,
      page: new YPageC(1),
    };
  },
  setup() {
    const store = useStore();
    return {
      login: store.state.login,
      setting: store.state.setting,
    };
  },
  computed: {
    // 是否显示右侧切换视图
    showRightSwitcher() {
      return (
        this.type === "user" ||
        (this.type === "artist" && this.user!.position === "album")
      );
    },
  },
  methods: {
    // 切换导航位置，并获取对应的数据
    handleSwitcher(
      position:
        | "createdPlaylist"
        | "subscribedPlaylist"
        | "song"
        | "album"
        | "detail",
    ) {
      // console.log("switch position", position);
      this.user!.position = position;
      switch (position) {
        case "createdPlaylist":
          this.fetchUserPlaylist();
          break;
        case "subscribedPlaylist":
          this.fetchUserPlaylist();
          break;
        case "song":
          this.fetchArtistWorks(0, true);
          break;
        case "album":
          this.fetchArtistAlbums();
          break;
        case "detail":
          this.fetchArtistIntro();
          break;
        default:
          break;
      }
    },
    // 获取 用户/歌手 信息
    async fetchUser() {
      const mainScroll = document.getElementById("yscroll-display-area");
      if (mainScroll) mainScroll.scrollTop = 0;
      // 如果 userId 为 0，返回
      if (this.userId === 0) {
        // console.log("invalid userId");
        return;
      }
      if (this.type === "user") {
        // 如果 type 为 user，获取用户信息
        // console.log("fetch user");
        let response = await User.detail(this.userId);
        if (!response) return;
        // 处理用户信息
        this.user = {
          id: response.profile.userId,
          name: response.profile.nickname,
          picUrl: response.profile.avatarUrl + "?param=160y160",
          followeds: response.profile.followeds,
          follows: response.profile.follows,
          playlistCount: response.profile.playlistCount,
          level: response.level,
          listenSongs: response.listenSongs,
          listType: false,
          userPlaylists: [],
          userSubscribedPlaylists: [],
          position: "createdPlaylist",
          switcher: [
            {
              display: "sidebar.created_playlist",
              position: "createdPlaylist",
            },
            {
              display: "sidebar.subscribed_playlist",
              position: "subscribedPlaylist",
            },
          ],
        };
        // 获取用户的歌单
        await this.fetchUserPlaylist();
      } else {
        // 如果 type 为 artist，获取歌手信息
        const artist = await User.artistDetail(this.userId);
        if (!artist) return;
        // 处理歌手信息
        this.user = {
          id: artist.id,
          name: artist.name,
          transName: artist.transNames[0],
          picUrl: artist.avatar + "?param=160y160",
          identity: artist.identity,
          briefDesc: artist.briefDesc,
          intro: [],
          musicSize: artist.musicSize,
          albumSize: artist.albumSize,
          tracks: [],
          albums: [],
          // 切换器的初始位置
          position: "song",
          // 歌手界面的切换器
          switcher: [
            {
              display: "user_view.songs",
              position: "song",
            },
            {
              display: "user_view.albums",
              position: "album",
            },
            {
              display: "user_view.detail",
              position: "detail",
            },
          ],
        };
        // 获取歌手的作品，第一页
        await this.fetchArtistWorks(0, true);
      }
    },
    // 获取用户的歌单
    async fetchUserPlaylist() {
      //  如果不是用户界面，返回
      if (this.type !== "user") {
        return;
      }
      // 获取用户的歌单
      // console.log("fetch user playlist");
      const response = await User.getPlaylists(this.userId);
      // 清空用户的歌单
      (this.user as IUser).userPlaylists = [
        {
          name: this.$t("user_view.listen_rank"),
          id: `user-record-${this.userId}`,
          userId: this.userId,
          creator: response[0]?.creator ?? null,
          playCount: 0,
          trackCount:
            this.$t("user_view.total_listen") +
            `${(this.user as IUser)?.listenSongs}`,
          _picUrl: songsRank,
          _bigPicUrl: songsRank,
          artist: {
            name: "",
            id: 0,
          },
          size: 0,
          publishTime: 0,
        },
      ];
      (this.user as IUser).userSubscribedPlaylists = [];
      // 返回处理后的歌单
      response.forEach((item) => {
        if (!item.subscribed) {
          // 用户创建的歌单
          (this.user as IUser).userPlaylists.push({
            ...item,
            _picUrl: item.coverImgUrl + "?param=40y40",
            _bigPicUrl: item.coverImgUrl + "?param=180y180",
          });
        } else {
          // 用户收藏的歌单
          (this.user as IUser).userSubscribedPlaylists.push({
            ...item,
            _picUrl: item.coverImgUrl + "?param=40y40",
            _bigPicUrl: item.coverImgUrl + "?param=180y180",
          });
        }
      });
    },
    // 获取歌手的专辑
    async fetchArtistAlbums() {
      //  如果不是歌手界面，返回
      if (this.type !== "artist") {
        return;
      }
      // 获取歌手的专辑
      (this.user as IArtist)!.albums = await User.getArtistAlbums(this.userId);
    },
    // 按页获取歌手的作品
    async fetchArtistWorks(page: number, newPage = false) {
      const SONGS_PER_PAGE = 100;
      //  如果不是歌手界面，返回
      if (this.type !== "artist") {
        return;
      }
      // 获取歌手的歌曲
      await User.getArtistSongs(this.userId, page + 1, SONGS_PER_PAGE)
        .then(async (response) => {
          if (newPage) {
            this.page.total = Math.ceil(response.total / SONGS_PER_PAGE);
            this.page.onPageChange = () => {
              this.fetchArtistWorks(this.page.current - 1, false);
            };
          }
          (this.user as IArtist).tracks = markRaw(response.songs);
        })
        .catch(() => {
          // console.log("fetch artist songs error:", err);
        });
    },
    async fetchArtistIntro() {
      //  如果不是歌手界面，返回
      if (this.type !== "artist") {
        return;
      }
      // 获取歌手的描述
      User.getArtistDesc(this.userId)
        .then((response) => {
          // 处理歌手的描述
          let desc = [
            {
              ti: `${(this.user as IArtist).name} 简介`,
              txt: (this.user as IArtist).briefDesc,
            },
          ];
          // 添加歌手的描述
          (this.user as IArtist).intro = [...desc, ...response];
        })
        .catch(() => {
          // console.log("fetch artist intro error:", err);
        });
    },
    openUserFollow(id: number, type: string) {
      this.$router.push({ path: `/${type}/${id}` });
    },
  },
  async mounted() {
    // 获取用户信息
    await this.fetchUser();
    try {
      const theme = YColor.findTheme(this.setting.display.theme);
      if (this.user?.picUrl) {
        YColor.setBkColorFromImg(
          this.user.picUrl,
          document,
          (theme as Theme1).type,
          (theme as Theme2).background,
          () => {
            YColor.setBackgroundColorHex2(YColor.stringToHexColor("userview"));
          },
        );
      }
    } catch (error) {
      console.error("YUserView", error);
    }
  },
});
