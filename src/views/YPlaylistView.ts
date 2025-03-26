import YSongsTable from "@/components/list/YSongsTable.vue";
import YLoading from "@/components/base/YLoading.vue";
import YComment from "@/components/list/YComment.vue";
import { Message } from "@/dual/YMessageC";
import { type ITrack, Tracks } from "@/utils/tracks";
import { Playlist, User } from "@/utils/api";
import { formatDate_yyyymmdd } from "@/utils/time";
import { YColor } from "@/utils/color";
import { type Theme1, type Theme2 } from "@/utils/theme";
import { useStore } from "vuex";
import { preparePlaylist } from "@/utils/playlist";
import { markRaw, ref, defineComponent } from "vue";
import { type AlReels } from "@/dual/YSongsTable";
import { type IArtist } from "@/dual/YPlaylistView";
import {
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from "vue-router";
import { GlobalMsgEvents } from "@/dual/globalMsg";
import { LoginEvents } from "@/dual/login";

export default defineComponent({
  name: "YPlaylist",
  components: {
    YSongsTable,
    YLoading,
    YComment,
  },
  props: {
    // 传入的歌单 ID
    playlistId: {
      type: Number,
      required: true,
    },
    // 传入的歌单类型
    type: {
      type: String,
      default: "playlist", // playlist, album
    },
  },
  setup() {
    const store = useStore();
    const playlist_songstable = ref<typeof YSongsTable | null>(null);
    const album_songstable = ref<typeof YSongsTable | null>(null);

    return {
      player: store.state.player,
      login: store.state.login,
      openedPlaylist: store.state.openedPlaylist,
      setting: store.state.setting,
      download: store.state.download,
      playlist_songstable,
      album_songstable,
      globalMsg: store.state.globalMsg,
    };
  },
  computed: {
    likelist() {
      return this.login.likelist;
    },
  },
  data() {
    return {
      playlist: {
        name: "", // 歌单名称
        transName: "", // 歌单翻译名称
        coverImgUrl: "", // 封面图片 URL
        artists: [] as IArtist[], // 歌单歌手
        playCount: 0, // 播放次数
        createTime: "", // 创建时间
        createrId: 0, // 创建者 ID
        createrName: "", // 创建者名称
        createrAvatarUrl: "", // 创建者头像 URL
        trackCount: 0, // 歌曲数量
        alReels: [] as AlReels[], // 专辑信息
        tracks: [] as ITrack[], // 歌曲列表
      },
      isLoading: true, // 是否正在加载
      searchQuery: "", // 搜索关键字
      filteredTracks: [] as ITrack[], // 搜索过滤后的歌曲列表
      orient: "songs", // 歌曲列表或评论列表
      page: 1, // 歌单页数
      userSubscribeIds: [] as number[], // 用户订阅的歌单ID
      userSubscribeAlbumIds: [] as number[], // 用户订阅的专辑ID
      userCreateIds: [] as number[], // 用户创建的歌单ID
    };
  },
  watch: {
    // 监听 playlistId 的变化，当 playlistId 变化时重新获取歌单信息
    playlistId: {
      immediate: true,
      handler(newVal) {
        this.fetchPlaylist(newVal);
        this.isLoading = true;
        this.orient = "songs";
        if (this.type === "playlist") {
          this.openedPlaylist.id = newVal;
        }
        this.searchQuery = "";
      },
    },
    // 监听 playlist.coverImgUrl 的变化，当 coverImgUrl 变化时重新设置背景颜色
    "playlist.coverImgUrl": function () {
      this._setBackgroundColor();
    },
    // 监听 searchQuery 的变化，当 searchQuery 变化时重新过滤歌曲列表
    searchQuery: {
      handler() {
        this.updateTracks();
      },
    },
    isLoading(val) {
      if (!val) {
        this.$nextTick(() => {
          let mainScroll = document.getElementById("yscroll-display-area");
          if (window.savedPositions[this.$route.path] && mainScroll) {
            mainScroll.scrollTop = window.savedPositions[this.$route.path]
              .top as number;
          }
          mainScroll = null;
        });
      }
    },
    $route(to, from) {
      const mainScroll = document.getElementById("yscroll-display-area");
      window.savedPositions[from.path] = {
        top: mainScroll?.scrollTop ?? 0,
        left: 0,
      };
    },
  },
  beforeRouteLeave(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) {
    const mainScroll = document.getElementById("yscroll-display-area");
    window.savedPositions[from.path] = {
      top: mainScroll?.scrollTop ?? 0,
      left: 0,
    };
    next();
  },
  methods: {
    // 获取歌单
    async fetchPlaylist(id: number, refresh = false) {
      try {
        let requests = [];
        if (this.type === "playlist") {
          // 获取歌单详情
          requests = [
            Playlist.getDetail(id)
              .then((response) => {
                if (id !== this.playlistId) {
                  return;
                }
                // 歌单名称
                this.playlist.name = response.playlist.name;
                // 歌单翻译名称
                this.playlist.transName = "";
                // 封面图片 URL
                this.playlist.coverImgUrl = response.playlist.coverImgUrl;
                // 播放次数
                this.playlist.playCount = response.playlist.playCount;
                // 创建时间
                this.playlist.createTime = formatDate_yyyymmdd(
                  response.playlist.createTime,
                );
                // 创建者ID
                this.playlist.createrId = response.playlist.userId;
                // 创建者名称
                this.playlist.createrName = response.playlist.creator.nickname;
                // 创建者头像 URL
                this.playlist.createrAvatarUrl =
                  response.playlist.creator.avatarUrl;
                // 歌曲数量
                this.playlist.trackCount = response.playlist.trackCount;
                this.page = Math.floor(response.playlist.trackCount / 1000) + 1;
                return response;
              })
              .catch((error) => {
                console.error("Failed to fetch playlist:", error);
                throw error;
              }),
            this.login.userId
              ? User.getPlaylists(this.login.userId)
                  .then((myFavoriteId) => {
                    // 如果是我喜欢的音乐
                    if (myFavoriteId[0].id == id) {
                      return myFavoriteId[0].id;
                    }
                  })
                  .catch((error) => {
                    console.error("Failed to fetch myFavoriteId:", error);
                    throw error;
                  })
              : null,
            this.fetchTracks(id, 1, refresh)
              .then((getTracks) => {
                // 第一页的歌曲列表
                if (id !== this.playlistId) {
                  return;
                }
                this.playlist.tracks = getTracks;
                this.updateTracks();
                this.isLoading = false;
                return getTracks;
              })
              .catch((error) => {
                console.error("Failed to fetch tracks:", error);
                throw error;
              }),
          ];
        } else {
          requests = [
            Playlist.getAlbum(id)
              .then((response) => {
                // 专辑名称
                if (id !== this.playlistId || !response) {
                  return;
                }
                this.playlist.name = response.album.name;
                // 专辑翻译名称
                this.playlist.transName = response.album.transNames
                  ? " (" + response.album.transNames + ")"
                  : "";
                // 封面图片 URL
                this.playlist.coverImgUrl = response.album.picUrl;
                // 创建时间
                this.playlist.createTime = formatDate_yyyymmdd(
                  response.album.publishTime,
                );
                // 创建者ID
                this.playlist.artists = response.album.artists;
                // 歌曲数量
                this.playlist.trackCount = response.album.size;
                // 添加专辑信息
                this.playlist.tracks = markRaw(
                  new Tracks({
                    url: "/api/album/v3/detail",
                    tracks: response.songs,
                    params: {
                      needIndex: true,
                      reels: response.showreels,
                    },
                  }).tracks,
                );
                this.playlist.alReels = response.showreels;
                // 更新歌曲列表
                this.updateTracks();
                // 加载完成
                this.isLoading = false;
                return response;
              })
              .catch((error) => {
                console.error("Failed to fetch album:", error);
                throw error;
              }),
            this.login.userId
              ? User.getPlaylists(this.login.userId as unknown as number)
                  .then((myFavoriteId) => {
                    // 我喜欢的音乐
                    if (myFavoriteId[0].id == id) {
                      this.playlist.name = this.$t(
                        "playlist_view.my_favorite_musics",
                      );
                    }
                    return myFavoriteId;
                  })
                  .catch((error) => {
                    console.error("Failed to fetch myFavoriteId:", error);
                    throw error;
                  })
              : null,
          ];
        }

        // 使用Promise.allSettled来处理可能出现的null值（避免报错）
        let result = await Promise.allSettled(requests).catch((error) => {
          console.error("Failed to fetch playlist or tracks:", error);
          throw error;
        });
        if (
          this.type === "playlist" &&
          result[1].status === "fulfilled" &&
          result[1].value === id
        ) {
          // 我喜欢的音乐
          this.playlist.name = this.$t("playlist_view.my_favorite_musics");
        }

        // 处理fetchTracks获取的多个页面的track
        if (this.page > 1 && this.type === "playlist") {
          const promises = [];

          for (let i = 2; i <= this.page; i++) {
            promises.push(this.fetchTracks(id, i, refresh));
          }

          const addedTracksArray = await Promise.all(promises);
          if (id !== this.playlistId) {
            return;
          }
          this.playlist.tracks = this.playlist.tracks.concat(
            ...addedTracksArray,
          );
          this.updateTracks();
        }
      } catch (error) {
        console.error("Failed to fetch playlist or tracks:", error);
      }
    },
    // 获取当前页的歌曲列表
    async fetchTracks(id: number, page: number, refresh = false) {
      const limit = 1000;
      let result = await Playlist.fetchTracks(id, page, limit, refresh);
      return result;
    },
    // 设置背景颜色
    async _setBackgroundColor() {
      try {
        const theme = YColor.findTheme(this.setting.display.theme);
        YColor.setBkColorFromImg(
          this.playlist.coverImgUrl,
          document,
          (theme as Theme1).type,
          (theme as Theme2).background,
        );
      } catch (error) {
        console.error("Failed to set background color:", error);
      }
    },
    // 处理搜索
    handleSearch(input: string, fromEnter: boolean) {
      // console.log("search", input);
      // 更新搜索关键字
      if (fromEnter) {
        this.searchQuery = input;
      } else if (this.playlist.tracks.length < 500 || input === "") {
        this.searchQuery = input;
      }
    },
    // 更新歌曲列表 搜索过滤
    updateTracks() {
      if (!this.searchQuery) {
        this.filteredTracks = this.playlist.tracks;
        return;
      }
      const query = this.searchQuery.toLowerCase();
      // 否则返回包含搜索关键字的歌曲
      this.filteredTracks = this.playlist.tracks.filter((track) => {
        // 歌曲名称
        const trackName = track.name.toLowerCase();
        // 处理歌曲别名
        let trackNameTns = "";
        if (track.tns) {
          trackNameTns = track.tns[0] ? track.tns[0].toLowerCase() : "";
        }
        // 歌手名称
        const trackArtist = track.ar
          .map((artist) => {
            if (!artist.name) {
              return "";
            }
            artist.name.toLowerCase();
          })
          .join(" / ");
        // 歌手别名
        const trackArtistTns = track.ar
          .map((artist) => (artist.tns[0] ? artist.tns[0].toLowerCase() : ""))
          .join("/");
        // 专辑名称
        const trackAlbum = track.al.name?.toLowerCase();
        // 专辑别名
        const trackAlbumTns = track.al.tns[0]
          ? track.al.tns[0].toLowerCase()
          : "";
        return (
          trackName?.includes(query) ||
          trackNameTns.includes(query) ||
          trackArtistTns.includes(query) ||
          trackArtist.includes(query) ||
          trackAlbum?.includes(query) ||
          trackAlbumTns.includes(query)
        );
      });
    },
    // 播放歌单
    async playAll() {
      // console.log("playAll");
      // 预处理歌单
      let playlist = preparePlaylist(this.playlist.tracks);
      this.player.playAll(playlist);
      this.player.playlistId = this.playlistId;
      Message.post(
        "success",
        this.$t("message.playlist_view.added_to_playlist"),
      );
      if (this.type === "playlist") {
        await this.updatePlayCount();
      }
    },
    // 添加到播放列表
    async addPlaylistToQueue() {
      this.player.addPlaylist(this.playlist.tracks);
      this.player.playlistId = this.playlistId;
      Message.post(
        "success",
        this.$t("message.playlist_view.added_to_playlist"),
      );
    },
    // 播放歌曲
    async playSongs(track: ITrack) {
      // console.log("playSongs");
      await this.player.playTrack(track);
      this.player.playlistId = this.playlistId;
      this.player.playState = "play";
      if (this.type === "playlist") {
        await this.updatePlayCount();
      }
    },
    // 更新歌单播放次数
    async updatePlayCount() {
      await Playlist.updatePlaycount(this.playlistId);
    },
    // 处理歌手点击
    handleArtistClick(artistId: number | string) {
      this.$router.push({
        path: "/artist/" + artistId,
      });
    },
    scrollToCurrentTrack() {
      let songstable =
        this.playlist_songstable ?? this.album_songstable ?? null;
      if (songstable) {
        songstable.scrollToCurrentTrack();
      }
    },
    downloadPlaylist() {
      this.download.addList(this.filteredTracks);
      Message.post("success", this.$t("playlist_view.list_added_to_download"));
    },
    async subscribe() {
      let type: "on" | "off" = "on";
      if (
        (this.userSubscribeIds.includes(this.playlistId) &&
          this.type === "playlist") ||
        (this.userSubscribeAlbumIds.includes(this.playlistId) &&
          this.type === "album")
      ) {
        type = "off";
      }
      if (this.type === "playlist") {
        await Playlist.subPlaylist(this.playlistId, type);
        this.login.refreshUserPlaylists();
      } else {
        await Playlist.subAlbum(this.playlistId, type);
        this.login.refreshUserAlbums();
      }
      // console.log(type, res);
    },
    multiChoice() {
      Message.post("info", "功能暂未实现");
    },
  },
  mounted() {
    this.globalMsg.subscriber.on(
      `YPlaylistView`,
      GlobalMsgEvents.RefreshPlaylist,
      () => {
        // console.log("refresh-playlist");
        this.fetchPlaylist(this.playlistId, true);
      },
    );
    this.userSubscribeIds = this.login.userSubscribeIds.slice();
    this.userCreateIds = this.login.userPlaylists.map(
      (playlist) => playlist.id,
    );
    this.userSubscribeAlbumIds = this.login.userSubscribeAlbumIds.slice();
    this.login.subscriber.on("YPlaylistView", LoginEvents.userPlaylists, () => {
      this.userSubscribeIds = this.login.userSubscribeIds.slice();
      this.userSubscribeAlbumIds = this.login.userSubscribeAlbumIds.slice();
      this.userCreateIds = this.login.userPlaylists.map(
        (playlist) => playlist.id,
      );
    });
  },
  beforeUnmount() {
    // 组件销毁时发送消息
    this.globalMsg.subscriber.offAll(`YPlaylistView`);
    this.login.subscriber.offAll("YPlaylistView");
    this.openedPlaylist.id = 0;
    this.playlist_songstable = null;
    this.album_songstable = null;
  },
});
