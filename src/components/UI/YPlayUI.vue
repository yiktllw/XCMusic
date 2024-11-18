<template>
  <transition name="playui-slide">
    <div class="container theme-dark" v-if="show" ref="playuiContainer">
      <div class="title-bar">
        <YTitlebar :type="'play-ui'" @close-panel="show = false" />
      </div>
      <div class="main-content">
        <div class="content-left">
          <div class="track-cover">
            <img :src="track?.al?.picUrl" />
          </div>
          <div class="track-info">
            <div class="track-name font-color-main" :title="track.name">
              {{ track.name }}
            </div>
            <div class="track-artist font-color-standard">
              <span v-for="(artist, index) in track.ar">
                <span
                  class="artist-button"
                  @click="openArtist(artist.id)"
                  :title="artist.name + (artist.tns ? '\n' + artist.tns : '')"
                >
                  {{ artist.name }}
                </span>
                <span v-if="index < track.ar.length - 1"> /&nbsp; </span>
              </span>
            </div>
            <div
              class="track-album font-color-standard"
              @click="openAlbum(track?.al.id)"
              :title="track.al.name + (track.al.tns ? '\n' + track.al.tns : '')"
            >
              {{ track.al.name }}
            </div>
          </div>
        </div>
        <div class="content-right">
          <div class="switcher">
            <div
              class="switcher-lyric switcher-item"
              :class="position === 'lyric' ? 'selected' : 'not-selected'"
              @click="position = 'lyric'"
            >
              {{ $t("playui.lyric") }}
            </div>
            <div
              class="switcher-wiki switcher-item"
              :class="position === 'wiki' ? 'selected' : 'not-selected'"
              @click="position = 'wiki'"
            >
              {{ $t("playui.wiki") }}
            </div>
            <div
              class="switcher-sheet switcher-item"
              :class="position === 'sheet' ? 'selected' : 'not-selected'"
              @click="position = 'sheet'"
            >
              {{ $t("playui.sheet") }}
            </div>
          </div>
          <div class="lyrics" v-if="position === 'lyric'">
            <YLyrics class="ylyrics" />
          </div>
          <YScroll v-else style="height: calc(100vh - 350px); margin-left: 5px">
            <div class="wiki font-color-main" v-if="position === 'wiki'">
              <div class="wiki-content">
                <div
                  class="wiki-first-listen"
                  v-if="firstListen?.creatives?.length ?? 0 > 0"
                >
                  <div class="first-listen-main-title">
                    {{ firstListen?.uiElement.mainTitle.title }}
                  </div>
                  <div class="first-listen-content">
                    <div class="content-first-listen">
                      <div class="first-listen-title font-color-main">
                        {{ firstListenTitle }}
                      </div>
                      <div class="first-listen-period font-color-main">
                        {{ firstListenPeriod }}
                      </div>
                      <div class="first-listen-time font-color-main">
                        {{ firstListenTime }}
                      </div>
                    </div>
                    <div class="listen-count">
                      <div class="listen-count-title font-color-main">
                        {{ listenCountTitle }}
                      </div>
                      <div class="listen-count-content font-color-main">
                        {{ listenCountContent }}
                      </div>
                      <div class="listen-count-info">
                        {{ listenCountInfo }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="wiki-song" v-if="creatives.length > 0">
                  <div class="wiki-song-title">
                    {{ songWiki?.uiElement.mainTitle.title }}
                  </div>
                  <div class="wiki-song-content">
                    <div
                      class="wiki-song-content-item"
                      v-for="creative in creatives"
                    >
                      <div class="item-title">
                        {{ creative.title }}
                      </div>
                      <div class="item-content">
                        <span v-for="(content, cindex) in creative.content">
                          {{ content }}
                          <span v-if="cindex < creative.content.length - 1">
                            、
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="no-wiki"
                v-if="
                  creatives.length === 0 &&
                  (firstListen?.creatives?.length ?? 0) === 0
                "
              >
                <div class="txt">
                  {{ $t("playui.noWiki") }}
                </div>
              </div>
            </div>
            <div class="sheet font-color-main" v-else-if="position === 'sheet'">
              <div class="sheet-list" v-if="sheets">
                <div
                  class="sheet-item"
                  v-for="sheet in sheets"
                  @click="openSheet(sheet)"
                >
                  <div class="sheet-item-img">
                    <img
                      class="sheet-preview-img"
                      :src="sheet.coverImageUrl + '?param=80y100'"
                    />
                  </div>
                  <div class="sheet-item-title font-color-main">
                    {{ sheet.name }}
                  </div>
                </div>
              </div>
              <div class="no-sheet" v-else>
                {{ $t("playui.noSheet") }}
              </div>
            </div>
          </YScroll>
        </div>
      </div>
      <div class="play-bar">
        <YPlaybar :type="'play-ui'" @close-panel="show = false" ref="playBar" />
      </div>
      <div class="spectrum-canvas">
        <YSpecCanvas />
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import YPlaybar from "@/components/UI/YPlaybar.vue";
import YTitlebar from "@/components/UI/YTitlebar.vue";
import YScroll from "@/components/base/YScroll.vue";
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { useApi } from "@/utils/api";
import { getColorFromImg, YColor } from "@/utils/color";
import YSpecCanvas from "@/components/base/YSpecCanvas.vue";
import { isLocal } from "@/utils/localTracks_renderer";
import { ICreative, SheetList, SongWikiSummary } from "@/dual/YPlayUI";
import YLyrics from "@/components/base/YLyrics.vue";

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
            this.listenCount?.resourceExt.musicTotalPlayDto.duration
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
      if (newPos === "lyric") {
      } else if (newPos === "wiki") {
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
        document
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
      await useApi("/song/wiki/summary", {
        id: this.track.id,
        cookie: this.login.cookie,
      })
        .then((res) => {
          if (!res) return;
          this.firstListen = res.data.blocks[0];
          this.songWiki = res.data.blocks[1];
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
      await useApi("/sheet/list", {
        id: this.track.id,
        cookie: this.login.cookie,
      })
        .then((res) => {
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
    this.player.subscriber.on({
      id: "YPlayUI",
      func: async () => {
        this.track = this.player.currentTrack;
        let requests = [
          this.setBackgroundColor(),
          this.getWiki(),
          this.getSheets(),
        ];
        await Promise.all(requests);
        this.currentLine = 0;
      },
      type: "track",
    });
    if (this.player.currentTrack?.id && isLocal(this.player.currentTrack?.id))
      await this.getWiki();
    if (this.player.currentTrack) {
      this.currentTime = parseInt((this.player.currentTime * 1000).toString());
    }
    this.globalMsg.subscriber.on({
      id: "YPlayUI",
      type: "close-playui",
      func: () => {
        this.closePanel();
      },
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
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background-color: #131319;
  user-select: none;

  .title-bar {
    width: 100%;
    height: 50px;
  }

  .main-content {
    display: flex;
    flex-direction: row;
    width: 100%;

    .content-left {
      margin: auto;

      .track-cover {
        width: 40vh;
        max-width: 40vw;

        img {
          width: 100%;
          height: 100%;
          border-radius: 10px;
        }
      }

      .track-info {
        margin: 30px 0px 0px 0px;
        width: 40vh;
        max-width: 40vw;
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 9px;

        .track-name {
          text-align: left;
          font-size: 18px;
          font-weight: bold;
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .track-artist {
          margin: 8px 0px 0px 0px;
          max-width: 100%;
          text-align: left;
          font-size: 16px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          .artist-button {
            cursor: pointer;

            &:hover {
              color: var(--font-color-main);
            }
          }
        }

        .track-album {
          margin: 8px 0px 0px 0px;
          max-width: 100%;
          text-align: left;
          font-size: 16px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;

          &:hover {
            color: var(--font-color-main);
          }
        }
      }
    }

    .content-right {
      height: 100%;
      width: 50vw;
      display: flex;
      align-items: start;
      flex-direction: column;
      padding-bottom: 30px;

      .switcher {
        display: flex;
        flex-direction: row;
        background-color: rgba(var(--foreground-color-rgb), 0.1);
        border-radius: 20px;
        padding: 3px 3px;
        margin: 0 0 20px 0;

        .switcher-item {
          display: flex;
          align-items: center;
          padding: 2px 8px 4px 8px;
        }

        .selected {
          color: var(--font-color-main);
          font-weight: bold;
          background-color: rgba(var(--foreground-color-rgb), 0.2);
          border-radius: 20px;
        }

        .not-selected {
          color: var(--font-color-standard);
          cursor: pointer;

          &:hover {
            color: var(--font-color-main);
          }
        }
      }

      .lyrics {
        max-height: calc(100vh - 350px);
        overflow: hidden;
        padding: 0 0 00px 0;

        .ylyrics {
          margin: calc((100vh - 350px) / 2 - 285px) 0 0 0;
        }
      }

      .wiki {
        width: 43.21vw;
        height: 100%;

        .wiki-content {
          width: 100%;

          .wiki-first-listen {
            display: flex;
            flex-direction: column;
            align-items: start;

            .first-listen-main-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
              padding: 10px 0 0 5px;
            }

            .first-listen-content {
              display: flex;
              flex-direction: row;
              width: calc(100% - 20px);

              .content-first-listen {
                background-color: rgba(var(--foreground-color-rgb), 0.1);
                border-radius: 10px;
                padding: 10px;
                text-align: left;
                width: calc(50% - 10px);

                .first-listen-title {
                  padding: 3px 0;
                  opacity: 0.5;
                }

                .first-listen-period {
                  padding: 5px 0;
                  font-weight: bold;
                  font-size: 20px;
                }

                .first-listen-time {
                  padding: 3px 0;
                  opacity: 0.8;
                }
              }

              .listen-count {
                background-color: rgba(var(--foreground-color-rgb), 0.1);
                border-radius: 10px;
                padding: 10px;
                margin-left: 10px;
                text-align: left;
                width: calc(50% - 10px);

                .listen-count-title {
                  padding: 3px 0;
                  opacity: 0.5;
                }

                .listen-count-content {
                  padding: 5px 0;
                  font-weight: bold;
                  font-size: 20px;
                }

                .listen-count-info {
                  padding: 3px 0;
                  opacity: 0.8;
                }
              }
            }
          }

          .wiki-song {
            display: flex;
            flex-direction: column;
            width: calc(100% - 20px);
            align-items: start;

            .wiki-song-title {
              font-size: 20px;
              font-weight: bold;
              margin: 8px 0 10px 0;
              padding: 10px 0 0 5px;
            }

            .wiki-song-content {
              display: flex;
              flex-direction: column;
              background-color: rgba(var(--foreground-color-rgb), 0.1);
              padding: 10px;
              border-radius: 10px;
              width: inherit;

              .wiki-song-content-item {
                display: flex;
                flex-direction: row;
                padding: 4px 0;

                .item-title {
                  opacity: 0.5;
                  width: 80px;
                  text-align: left;
                }

                .item-content {
                  font-size: 16px;
                }
              }
            }
          }
        }
        .no-wiki {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;

          .txt {
            font-size: 20px;
            font-weight: bold;
          }
        }
      }

      .sheet {
        display: flex;
        align-items: center;
        min-height: 100%;
        width: 43.21vw;

        .sheet-list {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          width: 100%;

          .sheet-item {
            min-width: 110px;
            max-width: 140px;
            margin: 10px 0px;
            cursor: pointer;

            .sheet-item-img {
              .sheet-preview-img {
                width: 80px;
                height: 100px;
                border-radius: 10px;
              }
            }
          }
        }

        .no-sheet {
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
  }

  .play-bar {
    width: 100%;
    height: 85px;
    background-color: rgba(var(--foreground-color-rgb), 0.03);
  }

  .spectrum-canvas {
    position: absolute;
    width: 100%;
    height: 100px;
    bottom: 89px;
    pointer-events: none;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.6) 70%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }
}
</style>
