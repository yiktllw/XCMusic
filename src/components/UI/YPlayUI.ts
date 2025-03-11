import YPlaybar from "@/components/UI/YPlaybar.vue";
import YTitlebar from "@/components/UI/YTitlebar.vue";
import YScroll from "@/components/base/YScroll.vue";
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { Song } from "@/utils/api";
import { getColorFromImg, YColor } from "@/utils/color";
import YSpecCanvas from "@/components/base/YSpecCanvas.vue";
import { isLocal } from "@/utils/localTracks_renderer";
import {
  type ICreative,
  type SheetList,
  type SongWikiSummary,
} from "@/dual/YPlayUI";
import YLyrics from "@/components/base/YLyrics.vue";
import { GlobalMsgEvents } from "@/dual/globalMsg";
import { PlayerEvents } from "@/dual/player";

export default defineComponent({
  name: "YPlayUI",
  components: {
    YTitlebar,
    YPlaybar,
    YScroll,
    YSpecCanvas,
    YLyrics,
  },
  setup() {
    const lyricContainer = ref<InstanceType<typeof YScroll> | null>();
    const playuiContainer = ref<HTMLElement | null>();
    const playBar = ref<InstanceType<typeof YPlaybar> | null>();
    const store = useStore();
    const player = store.state.player;
    const login = store.state.login;

    return {
      lyricContainer,
      playuiContainer,
      playBar,
      player,
      login,
      setting: store.state.setting,
      globalMsg: store.state.globalMsg,
    };
  },
  computed: {
    firstListenPeriod() {
      if (this.firstListen && this.firstListen.creatives.length > 0) {
        return (
          this.firstListen.creatives[0].resources[0].resourceExt
            .musicFirstListenDto.season +
          "的" +
          this.firstListen.creatives[0].resources[0].resourceExt
            .musicFirstListenDto.period
        );
      }
      return "";
    },
    firstListenTime() {
      if (this.firstListen && this.firstListen.creatives.length > 0) {
        return this.firstListen.creatives[0].resources[0].resourceExt
          .musicFirstListenDto.date;
      }
      return "";
    },
    firstListenTitle() {
      if (this.firstListen && this.firstListen.creatives.length > 0) {
        return this.firstListen.creatives[0].resources[0].uiElement.mainTitle
          .title;
      }
      return "";
    },
    listenCount() {
      if (this.firstListen && this.firstListen.creatives.length > 0) {
        return this.firstListen.creatives[0].resources[1];
      }
      return null;
    },
    listenCountTitle() {
      if (this.listenCount) {
        return this.listenCount?.uiElement.mainTitle.title;
      }
      return "";
    },
    listenCountContent() {
      if (this.listenCount) {
        return (
          this.listenCount?.resourceExt.musicTotalPlayDto.playCount +
          "次·" +
          this.formatDuration(
            this.listenCount?.resourceExt.musicTotalPlayDto.duration,
          )
        );
      }
      return "";
    },
    listenCountInfo() {
      if (this.listenCount) {
        return this.listenCount?.resourceExt.musicTotalPlayDto.text;
      }
      return "";
    },
    creatives() {
      let res: ICreative[] = [];
      if (this.songWiki) {
        this.songWiki.creatives.forEach((element) => {
          let contentRes: string[] = [];
          if (element.uiElement?.textLinks) {
            element.uiElement.textLinks.forEach((textLink) => {
              contentRes.push(textLink.text);
            });
          } else if (element.resources) {
            element.resources.forEach((resource) => {
              if (resource.uiElement.mainTitle) {
                contentRes.push(resource.uiElement.mainTitle.title);
              }
            });
          }
          res.push({
            title: element.uiElement?.mainTitle.title ?? "",
            content: contentRes,
          });
        });
      }
      return res;
    },
  },
  data() {
    return {
      show: false,
      track: {
        id: 0 as number | string,
        name: "",
        tns: "",
        al: {
          id: 0,
          name: "",
          picUrl: "",
          tns: "",
        },
        ar: [
          {
            id: 0,
            name: "",
            tns: "",
          },
        ],
      },
      position: "lyric",
      firstListen: null as SongWikiSummary.IFirstListen | null,
      songWiki: null as SongWikiSummary.IWikiSummary | null,
      sheets: null as SheetList.ISheet[] | null,
      currentTime: 0,
      currentLine: 0,
      startTime: null as number | null,
      scrollAnimationFrame: null as number | null,
    };
  },
  emits: ["show-panel", "close-panel"],
  watch: {
    show(newVal) {
      if (newVal) {
        this.$emit("show-panel");
        this.$nextTick(() => {
          this.setBackgroundColor();
        });
      } else {
        setTimeout(() => {
          this.$emit("close-panel");
        }, 300);
      }
    },
    position(newPos) {
      if (newPos === "wiki") {
        this.$nextTick(() => {
          const container = this.lyricContainer?.$el;
          if (!container) {
            return;
          }
          container.scrollTop = 0;
        });
      } else if (newPos === "sheet") {
        this.getSheets();
        this.$nextTick(() => {
          let container = this.lyricContainer?.$el;
          if (!container) return;
          container.scrollTop = 0;
          container = null;
        });
      }
    },
  },
  methods: {
    showPanel() {
      this.show = true;
    },
    closePanel() {
      this.show = false;
    },
    tooglePanel() {
      this.show = !this.show;
    },
    lineClass(index: number) {
      if (index === this.currentLine) {
        return "current-line";
      } else {
        return "far-line";
      }
    },
    async setBackgroundColor() {
      if (!this.track?.al?.picUrl) {
        return;
      }
      await getColorFromImg(
        this.track.al.picUrl + "?param=50y50",
        document,
      ).then((_color) => {
        // 确保颜色存在
        let color;
        if (!_color) color = YColor.hexToRgb(YColor.stringToHexColor("TXC"));
        else color = _color;

        // 设置背景颜色
        if (this.playuiContainer) {
          this.playuiContainer.style.background = `linear-gradient(180deg, rgb(${color.r}, ${color.g}, ${color.b}) 0%, rgb(${color.r * 0.321}, ${color.g * 0.321}, ${color.b * 0.321}) 100%)`;
        }

        // 设置进度条颜色
        let progressDOM = this.playBar?.progressBarNoTrack?.progressDOM;
        if (progressDOM) {
          progressDOM.style.background = `linear-gradient(to right, rgba(${color.r}, ${color.g}, ${color.b}, .4321), rgb(${color.r}, ${color.g}, ${color.b} ))`;
        }
        progressDOM = null;
      });
    },
    async getWiki() {
      if (!this.track.id || isLocal(this.track.id)) return;
      await Song.getWiki(this.track.id as number)
        .then((res) => {
          if (!res) return;
          this.firstListen = res.data
            .blocks[0] as unknown as SongWikiSummary.IFirstListen;
          this.songWiki = res.data
            .blocks[1] as unknown as SongWikiSummary.IWikiSummary;
        })
        .catch((error) => {
          console.error("Failed to get wiki:", error);
        });
    },
    formatDuration(duration: number) {
      if (duration < 600) {
        return duration + "分钟";
      } else {
        return (duration / 60).toFixed(0) + "小时";
      }
    },
    async getSheets() {
      if (!this.track.id || isLocal(this.track.id)) return;
      await Song.getSheets(this.track.id as number)
        .then((res) => {
          if (!res) return;
          if (res.code !== 200) {
            console.log("id: ", this.track.id, "获取曲谱失败, ", res.code);
          }
          const data = res.data;
          if (data.musicSheetSimpleInfoVOS) {
            this.sheets = data.musicSheetSimpleInfoVOS;
          } else {
            this.sheets = null;
          }
        })
        .catch((error) => {
          console.error("Failed to get sheets:", error);
        });
    },
    openSheet(sheet: SheetList.ISheet) {
      this.$router.push({ path: `/sheet/${sheet.id}` });
      this.closePanel();
    },
    openArtist(id: number | string) {
      if (!id || isLocal(id)) return;
      this.$router.push({ path: `/artist/${id}` });
      this.closePanel();
    },
    openAlbum(id: number | string) {
      if (!id || isLocal(id)) return;
      this.$router.push({ path: `/album/${id}` });
      this.closePanel();
    },
  },
  async mounted() {
    if (this.player.currentTrack) {
      this.track = this.player.currentTrack;
    }
    this.player.subscriber.on("YPlayUI", PlayerEvents.track, async () => {
      this.track = this.player.currentTrack;
      let requests = [
        this.setBackgroundColor(),
        this.getWiki(),
        this.getSheets(),
      ];
      await Promise.all(requests);
      this.currentLine = 0;
    });
    if (this.player.currentTrack?.id && isLocal(this.player.currentTrack?.id))
      await this.getWiki();
    if (this.player.currentTrack) {
      this.currentTime = parseInt((this.player.currentTime * 1000).toString());
    }
    this.globalMsg.subscriber.on("YPlayUI", GlobalMsgEvents.ClosePlayUI, () => {
      this.closePanel();
    });
  },
  beforeUnmount() {
    this.player.subscriber.offAll("YPlayUI");
    this.globalMsg.subscriber.offAll("YPlayUI");
    this.$emit("close-panel");
    this.lyricContainer = null;
    this.playuiContainer = null;
    this.playBar = null;
  },
});
