import { formatDuration_mmss } from "@/utils/time";
import { useStore } from "vuex";
import YPlaying from "@/components/base/YPlaying.vue";
import YPage from "@/components/base/YPage.vue";
import { YPageC } from "@/dual/YPageC";
import { Message } from "@/dual/YMessageC";
import { ref, watch, defineComponent, toRaw } from "vue";
import { Song } from "@/utils/api";
import upArrow from "@/assets/up-arrow.svg";
import downArrow from "@/assets/down-arrow.svg";
import updownArrow from "@/assets/updown-arrow.svg";
import { isLocal } from "@/utils/localTracks_renderer";
import { ITrack } from "@/utils/tracks";
import { AlReels } from "@/dual/YSongsTable";
import { PlayerEvents } from "@/dual/player";
import { DownloadEvents } from "@/dual/download_renderer";

export default defineComponent({
  props: {
    modelValue: {
      type: Array as () => ITrack[],
      required: true,
      default: () => [],
    },
    type: {
      type: String,
      default: "playlist",
    },
    showTrackCounter: {
      type: Boolean,
      default: true,
    },
    showTrackCover: {
      type: Boolean,
      default: true,
    },
    showTrackTitle: {
      type: Boolean,
      default: true,
    },
    showTrackArtist: {
      type: Boolean,
      default: true,
    },
    showTrackAlbum: {
      type: Boolean,
      default: true,
    },
    showTrackLikes: {
      type: Boolean,
      default: true,
    },
    showTrackPopularity: {
      type: Boolean,
      default: true,
    },
    showTrackDuration: {
      type: Boolean,
      default: true,
    },
    showLyrics: {
      type: Boolean,
      default: false,
    },
    showListenCount: {
      type: Boolean,
      default: false,
    },
    resortable: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    showMenu: {
      type: Boolean,
      default: true,
    },
    canSendPlaylist: {
      type: Boolean,
      default: true,
    },
    stickyTop: {
      type: String,
      default: "0px",
    },
    limit: {
      type: Number,
      default: 500,
    },
    /** 用来标记订阅(当前播放的歌曲) */
    id: {
      type: String,
      required: true,
    },
    from: {
      type: Number,
      default: -1,
    },
    alReels: {
      type: Array as () => AlReels[],
      default: () => [],
    },
    scrollToCurrentTrackOnMount: {
      type: Boolean,
      default: false,
    },
  },
  name: "YSongsTable",
  setup(props: { modelValue: Array<ITrack> }) {
    const tracks = ref<Array<ITrack>>(props.modelValue);
    watch(
      () => props.modelValue,
      (newValue) => {
        tracks.value = newValue;
      },
    );

    const main = ref<HTMLElement | null>(null);
    const songs_album_ref = ref<HTMLElement | null>(null);
    const UL = ref<HTMLElement | null>(null);

    const store = useStore();

    return {
      tracks,
      songs_album_ref,
      main,
      download: store.state.download,
      player: store.state.player,
      login: store.state.login,
      setting: store.state.setting,
      UL,
    };
  },
  components: {
    YPlaying,
    YPage,
  },
  emits: ["update:modelValue", "update-display", "play-song-and-playlist"],
  computed: {
    likelist() {
      return this.login.likelist ?? [];
    },
  },
  data() {
    return {
      initialMouseX: 0, // 鼠标初始位置
      initialAlbumWidth: 0, // 初始专辑宽度
      deltaX: 0, // resize控件的鼠标移动距离
      newWidth: 0, // resize控件的新的专辑宽度
      // 歌曲标题栏的排序状态
      sortingStates: [
        { icon: updownArrow, text: "songs_table.sort.default", key: "default" },
        {
          icon: upArrow,
          text: "songs_table.sort.title_ascending",
          key: "titleAsc",
        },
        {
          icon: downArrow,
          text: "songs_table.sort.title_descending",
          key: "titleDesc",
        },
        {
          icon: upArrow,
          text: "songs_table.sort.artist_ascending",
          key: "artistAsc",
        },
        {
          icon: downArrow,
          text: "songs_table.sort.artist_descending",
          key: "artistDesc",
        },
      ],
      // 专辑栏的排序状态
      sortingStates_Album: [
        { icon: updownArrow, text: "songs_table.sort.default", key: "default" },
        {
          icon: upArrow,
          text: "songs_table.sort.album_ascending",
          key: "albumAsc",
        },
        {
          icon: downArrow,
          text: "songs_table.sort.album_descending",
          key: "albumDesc",
        },
      ],
      // 时长栏的排序状态
      sortingStates_Duration: [
        {
          icon: updownArrow,
          text: "songs_table.sort.duration_default",
          key: "default",
        },
        {
          icon: upArrow,
          text: "songs_table.sort.duration_default",
          key: "albumAsc",
        },
        {
          icon: downArrow,
          text: "songs_table.sort.duration_default",
          key: "albumDesc",
        },
      ],
      currentSortingIndex: 0, // 标题栏当前排序状态的索引
      currentSortingIndex_Album: 0, // 专辑栏当前排序状态的索引
      currentSortingIndex_Duration: 0, // 时长栏当前排序状态的索引
      alWidth: 230,
      page: new YPageC(Math.ceil(this.tracks.length / this.limit) || 1),
      nowPlaying: 0,
      downloadedSongIds: [] as number[],
      hoverTrackId: 0,
    };
  },
  async mounted() {
    if (this.login.status && this.login.likelist?.length === 0)
      this.login.reloadLikelist();

    if (this.scrollToCurrentTrackOnMount) {
      this.$nextTick(() => {
        this.scrollToCurrentTrack(false);
      });
    }

    this.alWidth = this.setting.display.albumWidth;
    this.nowPlaying = this.player.currentTrack?.id ?? 0;
    this.player.subscriber.on(this.id, PlayerEvents.track, () => {
      this.nowPlaying = this.player.currentTrack?.id ?? 0;
    });
    this.downloadedSongIds = this.download.downloadedSongIds;
    this.download.subscriber.on(this.id, DownloadEvents.Complete, () => {
      this.downloadedSongIds = this.download.downloadedSongIds;
    });
    this.UL?.addEventListener("mousemove", this.handleUlMouseMove);
    this.UL?.addEventListener("mouseleave", this.handleUlMouseLeave);
    this.UL?.addEventListener("dblclick", this.handleUlDbClick);
    this.UL?.addEventListener("click", this.handleUlClick);
    this.UL?.addEventListener("contextmenu", this.handleUlContext);
  },
  beforeUnmount() {
    this.player.subscriber.offAll(this.id);
    this.download.subscriber.offAll(this.id);
    this.UL?.removeEventListener("mousemove", this.handleUlMouseMove);
    this.UL?.removeEventListener("mouseleave", this.handleUlMouseLeave);
    this.UL?.removeEventListener("dblclick", this.handleUlDbClick);
    this.UL?.removeEventListener("click", this.handleUlClick);
    this.UL?.removeEventListener("contextmenu", this.handleUlContext);
    // 清空引用
    this.main = null;
    this.songs_album_ref = null;
    this.UL = null;
    window.removeEventListener("mousemove", this.resize);
  },
  watch: {
    tracks(newVal, oldVal) {
      this.alWidth = this.setting.display.albumWidth;
      this.page = new YPageC(Math.ceil(newVal.length / this.limit) || 1);
    },
  },
  methods: {
    isLocal(id: number | string) {
      return isLocal(id);
    },
    async playSongAndPlaylist(track: ITrack) {
      console.log("Play Song And Playlist:", track.id);
      if (!this.canSendPlaylist || this.setting.play.dbclick === "single") {
        await this.player.playTrack(track);
      } else {
        this.player.playlist = this.tracks.slice();
        await this.player.playTrack(track);
      }
    },
    formatDuration(duration: number) {
      return formatDuration_mmss(duration);
    },
    // 开始resize
    startResize(event: MouseEvent) {
      // 记录初始鼠标位置和专辑宽度
      this.initialMouseX = event.clientX;
      this.initialAlbumWidth = this.songs_album_ref?.offsetWidth ?? 0;

      // 添加鼠标移动监听
      window.addEventListener("mousemove", this.resize);
      // 添加鼠标松开监听
      window.addEventListener("mouseup", () => {
        // 根据新的专辑宽度调整歌曲名称和专辑的宽度
        this.resizeByNewWidth(this.newWidth);
        this.setting.display.albumWidth = this.newWidth;
        // 移除鼠标移动和松开监听
        window.removeEventListener("mousemove", this.resize);
        window.removeEventListener("mouseup", this.stopResize);
      });
    },
    // resize
    resize(event: MouseEvent) {
      // 计算鼠标移动距离
      this.deltaX = event.clientX - this.initialMouseX;
      // 计算新的专辑宽度
      if (
        this.initialAlbumWidth - this.deltaX > 200 &&
        this.initialAlbumWidth - this.deltaX < 400
      )
        this.newWidth = this.initialAlbumWidth - this.deltaX;
      // 设置专辑宽度
      if (this.songs_album_ref && this.newWidth > 200 && this.newWidth < 400)
        this.songs_album_ref.style.width = `${this.newWidth}px`;
    },
    setAlbumWidth(width: number) {
      if (this.songs_album_ref) this.songs_album_ref.style.width = `${width}px`;
      this.resizeByNewWidth(width);
    },
    // 根据新的专辑宽度调整歌曲名称和专辑的宽度
    resizeByNewWidth(newWidth: number) {
      let track_albums: NodeListOf<Element> | null =
        document.querySelectorAll(".track-album-ref");
      track_albums.forEach((element) => {
        if (element) (element as HTMLElement).style.width = `${newWidth}px`;
      });
      track_albums = null;
    },
    // 停止resize
    stopResize() {
      // 移除鼠标移动和松开监听
      window.removeEventListener("mousemove", this.resize);
      window.removeEventListener("mouseup", this.stopResize);
    },
    // 处理歌手点击
    handleArtistClick(artistId: number | string) {
      if (!artistId || isLocal(artistId)) return;
      this.$router.push(`/artist/${artistId}`);
      console.log("Open Artist with ID:", artistId);
    },
    // 处理专辑点击
    handleAlbumClick(albumId: number | string) {
      if (!albumId || isLocal(albumId)) return;
      this.$router.push(`/album/${albumId}`);
      console.log("Open Album with ID:", albumId);
    },
    // 切换标题排序状态
    handleSort() {
      // 切换到下一个排序状态
      this.currentSortingIndex =
        (this.currentSortingIndex + 1) % this.sortingStates.length;
      // console.log('tracks', this.tracks);

      // 发送消息到处理函数，根据 key 进行不同的排序操作
      const currentSortKey = this.sortingStates[this.currentSortingIndex].key;
      this.sortTracks(currentSortKey);
    },
    // 切换专辑排序状态
    handleSort_Album() {
      // 切换到下一个排序状态
      this.currentSortingIndex_Album =
        (this.currentSortingIndex_Album + 1) % this.sortingStates_Album.length;

      // 发送消息到处理函数，根据 key 进行不同的排序操作
      const currentSortKey =
        this.sortingStates_Album[this.currentSortingIndex_Album].key;
      this.sortTracks_Album(currentSortKey);
    },
    // 切换时长排序状态
    handleSort_Duration() {
      // 切换到下一个排序状态
      this.currentSortingIndex_Duration =
        (this.currentSortingIndex_Duration + 1) %
        this.sortingStates_Duration.length;

      // 发送消息到处理函数，根据 key 进行不同的排序操作
      const currentSortKey =
        this.sortingStates_Duration[this.currentSortingIndex_Duration].key;
      this.sortTracks_Duration(currentSortKey);
    },
    // 标题排序
    sortTracks(sortKey: string) {
      // 根据不同的排序 key 进行排序操作
      switch (sortKey) {
        case "default":
          console.log("使用默认排序");
          // 处理默认排序逻辑
          this.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
          break;
        case "titleAsc":
          console.log("按标题升序排序");
          // 处理按标题升序排序逻辑
          this.tracks.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "titleDesc":
          console.log("按标题降序排序");
          // 处理按标题降序排序逻辑
          this.tracks.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "artistAsc":
          console.log("按歌手升序排序");
          // 处理按歌手升序排序逻辑
          this.tracks.sort((a, b) => a.ar[0].name.localeCompare(b.ar[0].name));
          break;
        case "artistDesc":
          console.log("按歌手降序排序");
          // 处理按歌手降序排序逻辑
          this.tracks.sort((a, b) => b.ar[0].name.localeCompare(a.ar[0].name));
          break;
        default:
          console.log("未知排序选项");
      }
    },
    // 专辑排序
    sortTracks_Album(sortKey: string) {
      // 根据不同的排序 key 进行排序操作
      switch (sortKey) {
        case "default":
          console.log("使用默认排序");
          // 处理默认排序逻辑
          this.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
          break;
        case "albumAsc":
          console.log("按专辑升序排序");
          // 处理按专辑升序排序逻辑
          this.tracks.sort((a, b) => a.al.name.localeCompare(b.al.name));
          break;
        case "albumDesc":
          console.log("按专辑降序排序");
          // 处理按专辑降序排序逻辑
          this.tracks.sort((a, b) => b.al.name.localeCompare(a.al.name));
          break;
        default:
          console.log("未知排序选项");
      }
    },
    // 时长排序
    sortTracks_Duration(sortKey: string) {
      // 根据不同的排序 key 进行排序操作
      switch (sortKey) {
        case "default":
          console.log("使用默认排序");
          // 处理默认排序逻辑
          this.tracks.sort((a, b) => a.originalIndex - b.originalIndex);
          break;
        case "albumAsc":
          console.log("按时间升序排序");
          // 处理按时间升序排序逻辑
          this.tracks.sort(
            (a, b) => parseFloat(a.dt.toString()) - parseFloat(b.dt.toString()),
          );
          break;
        case "albumDesc":
          console.log("按时间降序排序");
          // 处理按时间降序排序逻辑
          this.tracks.sort(
            (a, b) => parseFloat(b.dt.toString()) - parseFloat(a.dt.toString()),
          );
          break;
        default:
          console.log("未知排序选项");
      }
    },
    formatLyric(lyric: string) {
      return "   " + lyric + "   ";
    },
    getClosestTrackItem(element: HTMLElement) {
      return element.closest(".track-item") as HTMLElement;
    },
    handleUlContext(event: MouseEvent) {
      event.preventDefault();
      const trackItem = this.getClosestTrackItem(event.target as HTMLElement);
      if (!trackItem) return;

      let trackId_ = trackItem.id.replace("track-item-", "");
      let trackId: number | string = trackId_;
      if (!isLocal(trackId_)) trackId = parseInt(trackId_, 10);

      // 查找对应的 track 对象
      const track = this.tracks.find((t) => t.id === trackId);

      if (track) this.openContextMenu(event, track);
    },
    handleUlClick(event: MouseEvent) {
      const trackItem = this.getClosestTrackItem(event.target as HTMLElement);
      if (!trackItem) return;

      let trackId_ = trackItem.id.replace("track-item-", "");
      let trackId: number | string = trackId_;
      if (isLocal(trackId_)) {
        return;
      } else {
        trackId = parseInt(trackId_, 10);
      }

      const button = (event.target as HTMLElement).closest(".ul-button");
      if (!button) return;
      const buttonId = button.id;

      if (buttonId.includes("artist-")) {
        const artistId = parseInt(buttonId.replace("artist-", ""), 10);
        if (artistId) this.handleArtistClick(artistId);
      } else if (buttonId.includes("album-")) {
        const albumId = parseInt(buttonId.replace("album-", ""), 10);
        if (albumId) this.handleAlbumClick(albumId);
      } else if (buttonId.includes("download")) {
        const track = this.tracks.find((t) => t.id === trackId);
        if (track) this.downloadSong(toRaw(track));
      } else if (buttonId.includes("comment")) {
        this.openSongComment(trackId);
      } else if (buttonId.includes("subscribe")) {
        this.openAddToPlaylist(trackId);
      } else if (buttonId.includes("detail")) {
        const track = this.tracks.find((t) => t.id === trackId);
        if (!track) return;
        this.openContextMenu(event, toRaw(track), "toogle");
      } else if (buttonId.includes("track-menu-")) {
        const trackId = parseInt(buttonId.replace("track-menu-", ""), 10);
        this.deletaFromPlaylist(trackId);
      }
    },
    handleUlDbClick(event: MouseEvent) {
      const trackItem = this.getClosestTrackItem(event.target as HTMLElement);
      if (!trackItem) return;

      let trackId_ = trackItem.id.replace("track-item-", "");
      let trackId: number | string = trackId_;
      if (!isLocal(trackId_)) trackId = parseInt(trackId_, 10);

      // 查找对应的 track 对象
      const track = this.tracks.find((t) => t.id === trackId);

      if (track) this.playSongAndPlaylist(track);
    },
    handleUlMouseMove(event: MouseEvent) {
      const trackItem = this.getClosestTrackItem(event.target as HTMLElement);
      if (!trackItem) return;

      let trackId_ = trackItem.id.replace("track-item-", "");
      let trackId: number | string = trackId_;
      if (!isLocal(trackId_)) trackId = parseInt(trackId_, 10);
      if (trackId === this.hoverTrackId) return; // 避免重复触发

      // 查找对应的 track 对象
      const track = this.tracks.find((t) => t.id === trackId);

      if (track) this.trackMouseEnter(track.id);
    },
    handleUlMouseLeave() {
      this.trackMouseLeave(this.hoverTrackId);
    },
    trackMouseEnter(id: number) {
      // 在id为YPlaybar.vue时，会有多个dom
      this.trackMouseLeave(this.hoverTrackId);
      let doms = this.main?.querySelectorAll(
        `#track-menu-${id}`,
      ) as unknown as HTMLElement[];
      if (doms) doms.forEach((dom) => (dom.style.display = "flex"));

      this.hoverTrackId = id;
      if (this.id !== "YPlaybar.vue") return;

      let domToBeHidden = this.main?.querySelector(
        `#track-menu-2-${id}`,
      ) as HTMLElement;
      if (domToBeHidden) domToBeHidden.style.display = "none";
    },
    trackMouseLeave(id: number) {
      // 在id为YPlaybar.vue时，会有多个dom
      let doms = this.main?.querySelectorAll(
        `#track-menu-${id}`,
      ) as unknown as HTMLElement[];
      if (doms) doms.forEach((dom) => (dom.style.display = "none"));

      this.hoverTrackId = 0;

      if (this.id !== "YPlaybar.vue") return;

      let domToBeShown = this.main?.querySelector(
        `#track-menu-2-${id}`,
      ) as HTMLElement;
      if (domToBeShown) domToBeShown.style.display = "block";
    },
    trackAlTns(name: string, tns: string | string[]) {
      let result = name;
      if (tns?.length > 0) result += " (" + tns + ")";
      return result;
    },
    setFocused(id: number | string) {
      let dom = this.main?.querySelector(`#track-item-${id}`);
      if (dom) dom?.classList.add("focused");
    },
    openSongComment(id: number | string) {
      if (!id || isLocal(id)) return;
      this.$router.push(`/comment/song/${id}`);
    },
    openContextMenu(event: MouseEvent, track: ITrack, type = "show") {
      window.postMessage({
        type:
          type === "show"
            ? "song-open-context-menu"
            : "song-toogle-context-menu",
        data: {
          x: event.clientX,
          y: event.clientY,
          track: JSON.stringify(track),
          from: this.from,
        },
      });
      // 在HomeView中处理
    },
    openAddToPlaylist(id: number | string) {
      if (!id || isLocal(id)) return;
      window.postMessage({
        type: "song-open-add-to-playlist",
        data: {
          ids: [id],
        },
      });
      console.log("Open Add To Playlist:", id);
      // 在HomeView中处理
    },
    scrollToCurrentTrack(smooth = true) {
      if (!this.player.currentTrack) return;
      let currentTrackIndex = null;
      const currentTrack = this.tracks.find((track, index) => {
        if (track.id === this.player.currentTrack.id) {
          currentTrackIndex = index;
          return true;
        }
      });
      if (
        currentTrack &&
        (currentTrackIndex ?? -1) >= 0 &&
        typeof currentTrackIndex === "number"
      ) {
        if (
          Math.floor(currentTrackIndex / this.limit) + 1 !==
          this.page.current
        )
          this.page.current = Math.floor(currentTrackIndex / this.limit) + 1;

        this.$nextTick(() => {
          let rowElement = this.main?.querySelector(".current_play_item");
          if (rowElement) {
            rowElement.scrollIntoView({
              behavior: smooth ? "smooth" : "instant",
              block: "center",
            });
            Message.post(
              "success",
              this.$t("message.playlist_view.scrolled_to_current_track"),
            );
          }
          rowElement = null;
        });
      }
    },
    async downloadSong(track: ITrack) {
      if (!track.id || isLocal(track.id)) return;

      const url = await Song.getUrl(track.id, this.setting.download.quality);

      this.download.add(url, track, this.setting.download.path);
    },
    deletaFromPlaylist(id: number | string) {
      if (this.id !== "YPlaybar.vue") return;
      this.tracks = this.tracks.filter((track) => track.id !== id);
      this.player.deleteTrack(id);
    },
  },
});
