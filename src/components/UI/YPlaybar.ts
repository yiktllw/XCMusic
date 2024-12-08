import { defineComponent, ref } from "vue";
import { Comment, Like, Song } from "@/utils/api";
import { useStore } from "vuex";
import YSongsTable from "@/components/list/YSongsTable.vue";
import YPanel from "@/components/base/YPanel.vue";
import YProgressBar from "@/components/base/YProgressBar.vue";
import YProgressBarV from "@/components/base/YProgressBarV.vue";
import YTextBanner from "@/components/base/YTextBanner.vue";
import YScroll from "@/components/base/YScroll.vue";
import { isLocal } from "@/utils/localTracks_renderer";
import { ITrack } from "@/utils/tracks";
import YListRandom from "@/components/base/YListRandom.vue";
import { PlayerEvents } from "@/dual/player";
import { DownloadEvents } from "@/dual/download_renderer";
import YLoading from "../base/YLoading.vue";

export default defineComponent({
  name: "YPlaybar",
  components: {
    YSongsTable,
    YPanel,
    YProgressBar,
    YProgressBarV,
    YTextBanner,
    YScroll,
    YListRandom,
    YLoading,
  },
  setup() {
    const quality_panel = ref<InstanceType<typeof YPanel> | null>();
    const songstable = ref<InstanceType<typeof YSongsTable> | null>();
    const play_mode_panel = ref<InstanceType<typeof YPanel> | null>();
    const play_mode_panel_trigger = ref<HTMLElement | null>();
    const quality_panel_trigger = ref<HTMLElement | null>();
    const volume_panel = ref<InstanceType<typeof YPanel> | null>();
    const volume_panel_trigger = ref<HTMLElement | null>();
    const playlist_panel = ref<InstanceType<typeof YPanel> | null>();
    const playlist_panel_trigger = ref<HTMLElement | null>();
    const progressBarNoTrack = ref<InstanceType<typeof YProgressBar> | null>();

    const store = useStore();

    return {
      quality_panel,
      songstable,
      play_mode_panel,
      play_mode_panel_trigger,
      quality_panel_trigger,
      volume_panel,
      volume_panel_trigger,
      playlist_panel,
      playlist_panel_trigger,
      progressBarNoTrack,
      player: store.state.player,
      setting: store.state.setting,
      login: store.state.login,
      download: store.state.download,
    };
  },
  props: {
    type: {
      type: String,
      default: "default",
    },
  },
  emits: ["close-panel", "open-panel"],
  data() {
    return {
      qualityGroup: [
        {
          name: "jymaster",
          display: "playbar.quality.jymaster",
          id: 0,
          desc: "playbar.quality.desc.jymaster",
          available: false,
          size: "",
        },
        {
          name: "sky",
          display: "playbar.quality.sky",
          id: 1,
          desc: "playbar.quality.desc.sky",
          available: false,
          size: "",
        },
        {
          name: "jyeffect",
          display: "playbar.quality.jyeffect",
          id: 2,
          desc: "playbar.quality.desc.jyeffect",
          available: false,
          size: "",
        },
        {
          name: "hires",
          display: "playbar.quality.hires",
          id: 3,
          desc: "playbar.quality.desc.hires",
          available: false,
          size: "",
        },
        {
          name: "lossless",
          display: "playbar.quality.lossless",
          id: 4,
          desc: "playbar.quality.desc.lossless",
          available: false,
          size: "",
        },
        {
          name: "exhigh",
          display: "playbar.quality.exhigh",
          id: 5,
          desc: "playbar.quality.desc.exhigh",
          available: false,
          size: "",
        },
        {
          name: "standard",
          display: "playbar.quality.standard",
          id: 7,
          desc: "playbar.quality.desc.standard",
          available: false,
          size: "",
        },
      ],
      showButton: false,
      playlist: [] as ITrack[],
      playState: "pause",
      currentTrack: null as ITrack | null,
      currentTrackComment: "0",
      playMode: "order",
      duration: 0 as number,
      currentTime: 0,
      progress: 0,
      progressInterval: null,
      volume: 0,
      qualityDisplay: "quality.standard",
      downloadedSongIds: [] as number[],
      /** 用来等待面板加载完成后再加载歌曲 */
      showSongs: false,
    };
  },
  watch: {
    volume() {
      this.player.volume = this.volume;
    },
  },
  computed: {
    likelist() {
      return this.login.likelist ?? [];
    },
    currentTrackName() {
      return this.currentTrack?.name;
    },
    currentTrackCover() {
      return this.currentTrack?.al.picUrl;
    },
    currentTrackArtists() {
      return this.currentTrack?.ar ?? [];
    },
  },
  methods: {
    setAudioProgress(progress: number) {
      this.player.progress = progress;
    },
    // 格式化时间
    formatDuration(time: number) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
    // 切换喜欢状态
    _toogleLike(status: boolean) {
      if (!this.player.currentTrack || isLocal(this.player.currentTrack.id))
        return;

      Like.toggle(this.player.currentTrack.id, status).then((res) => {
        if (res?.code === 200) {
          this.login.reloadLikelist().then(() => {
            console.log(
              `toggled ${this.player.currentTrack?.id} like status from ${status} to ${!status} successfully `,
              JSON.stringify(res, null, 4),
              "\nnow includes in likelist:",
              this.login.likelist.includes(this.player.currentTrack?.id),
            );
          });
        } else {
          console.error(
            "Failed to toggle like status",
            JSON.stringify(res, null, 4),
          );
        }
      });
    },
    // 切换播放状态
    tooglePlayState() {
      this.player.tooglePlayState();
    },
    // 下一首
    async goTo(direction: string) {
      let forward = direction === "forward" ? true : false;
      console.log(forward ? "next" : "previous");
      forward ? this.player.next() : this.player.previous();
    },
    tooglePlayMode(
      mode: "order" | "listloop" | "random" | "listrandom" | "loop",
    ) {
      this.player.mode = mode;
      this.setting.play.mode = mode;
    },
    async playTrack(track: ITrack) {
      await this.player.playTrack(track);
    },
    addTrackToPlaylist(track: ITrack) {
      this.player.addTrack(track);
    },
    handleArtistClick(artistId: number | string) {
      if (!artistId || isLocal(artistId)) {
        return;
      }
      console.log("Artist ID:", artistId);
      this.$router.push({ path: "/artist/" + artistId });
    },
    updateVolumeInSetting() {
      this.setting.play.volume = this.volume;
    },
    setQuality(
      quality:
        | "jymaster"
        | "sky"
        | "jyeffect"
        | "hires"
        | "lossless"
        | "exhigh"
        | "standard",
    ) {
      console.log("setQuality:", quality);
      this.player.quality = quality;
      this.setting.play.quality = quality;
      this.quality_panel?.tooglePanel();
    },
    setShowButton() {
      if (this.player.currentTrack) {
        this.showButton = true;
      }
    },
    async setCommentCount() {
      if (!this.currentTrack?.id || isLocal(this.currentTrack?.id)) {
        return;
      }
      await Comment.Song.info(this.currentTrack?.id).then((res) => {
        if (res?.code !== 200) return;

        let count = res.total;

        if (count < 1000) {
          this.currentTrackComment = `${count}`;
        } else if (count >= 1000 && count < 10000) {
          let num = Math.floor(count / 1000);
          this.currentTrackComment = `${num}k+`;
        } else if (count >= 10000 && count < 100000) {
          let num = Math.floor(count / 10000);
          this.currentTrackComment = `${num}w+`;
        } else if (count > 100000) {
          let num = Math.floor(count / 100000);
          this.currentTrackComment = `${num}0w+`;
        }
      });
    },
    openInfoPanel() {
      window.postMessage({
        type: "open-info-panel",
        data: JSON.stringify(this.currentTrack),
      });
    },
    handleSubscribe() {
      window.postMessage({
        type: "subscribe-now-playing",
      });
    },
    handleCommentClick(id: number | string) {
      if (!id || isLocal(id)) {
        return;
      }
      this.$router.push({ path: `/comment/song/${id}` });
      this.$emit("close-panel");
    },
    scrollToCurrentTrack() {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.songstable) {
            this.songstable.scrollToCurrentTrack(false);
          }
        }, 300);
      });
    },
    async downloadCurrentTrack() {
      if (!this.currentTrack || isLocal(this.currentTrack.id)) {
        return;
      }
      const url = await Song.getUrl(
        this.currentTrack.id,
        this.setting.download.quality,
      );
      this.download.add(
        url,
        this.player.currentTrack,
        this.setting.download.path,
      );
    },
    openPlaylistPanel() {
      this.playlist_panel?.tooglePanel();
    },
    handlePlaylistClose() {
      this.showSongs = false;
    },
    handlePlaylistPanelMounted() {
      console.log("playlist panel mounted");
      this.showSongs = true;
    },
  },
  async mounted() {
    if (this.login.status) {
      this.login.likelist.length === 0 ? this.login.reloadLikelist() : null;
    }
    this.player.volume = this.setting.play.volume;
    this.tooglePlayMode(
      this.setting.play.mode as
        | "order"
        | "listloop"
        | "random"
        | "listrandom"
        | "loop",
    );
    this.player.subscriber.on(
      "YPlaybar" + `${this.type}`,
      PlayerEvents.trackReady,
      () => {
        let avQuality = this.player.availableQuality;
        this.qualityGroup.forEach((quality) => {
          // 清空可用数据
          quality.available = false;
          quality.size = "";
          avQuality.forEach((avItem) => {
            if (quality.name === avItem.name) {
              quality.available = true;
              quality.size = avItem.size ?? "";
            }
          });
        });
        this.qualityDisplay = this.player.qualityDisplay;
      },
    );
    this.playlist = this.player.playlist;
    this.player.subscriber.on(
      "YPlaybar" + `${this.type}`,
      PlayerEvents.playlist,
      () => {
        this.playlist = this.player.playlist;
      },
    );
    this.playState = this.player.playState;
    this.player.subscriber.on(
      "YPlaybar" + `${this.type}`,
      PlayerEvents.playState,
      () => {
        this.playState = this.player.playState;
      },
    );
    this.currentTrack = this.player.currentTrack;
    this.setCommentCount();
    this.player.subscriber.on(
      "YPlaybar" + `${this.type}`,
      PlayerEvents.track,
      async () => {
        this.currentTrack = this.player.currentTrack;
        await this.setCommentCount();
      },
    );
    this.currentTime = this.player.currentTime;
    this.duration = this.player.duration as number;
    this.progress = this.player.progress;
    this.player.subscriber.on(
      "YPlaybar" + `${this.type}`,
      PlayerEvents.time,
      () => {
        this.duration = this.player.duration as number;
        this.currentTime = this.player.currentTime;
        this.progress = this.player.progress;
      },
    );
    this.playMode = this.player.mode;
    this.player.subscriber.on(
      "YPlaybar" + `${this.type}`,
      PlayerEvents.mode,
      () => {
        this.playMode = this.player.mode;
      },
    );
    this.volume = this.player.volume;
    this.player.subscriber.on(
      "YPlaybar" + `${this.type}`,
      PlayerEvents.volume,
      () => {
        this.volume = this.player.volume;
      },
    );
    this.qualityDisplay = this.player.qualityDisplay;
    this.player.subscriber.on(
      "YPlaybar" + `${this.type}`,
      PlayerEvents.quality,
      () => {
        this.qualityDisplay = this.player.qualityDisplay;
      },
    );
    this.downloadedSongIds = this.download.downloadedSongIds;
    this.download.subscriber.on(
      "YPlaybar" + `${this.type}`,
      DownloadEvents.Complete,
      () => {
        this.downloadedSongIds = this.download.downloadedSongIds;
      },
    );
  },
  beforeUnmount() {
    this.player.subscriber.offAll("YPlaybar" + `${this.type}`);
    this.download.subscriber.offAll("YPlaybar" + `${this.type}`);
    this.quality_panel = null;
    this.songstable = null;
    this.play_mode_panel = null;
    this.play_mode_panel_trigger = null;
    this.quality_panel_trigger = null;
    this.volume_panel = null;
    this.volume_panel_trigger = null;
    this.playlist_panel = null;
    this.playlist_panel_trigger = null;
    this.progressBarNoTrack = null;
  },
});
