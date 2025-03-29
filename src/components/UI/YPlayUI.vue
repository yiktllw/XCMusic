<template>
  <!-- 播放界面 -->
  <transition name="playui-slide">
    <div class="container theme-dark" v-if="show" ref="playuiContainer">
      <!-- 标题栏 -->
      <div class="title-bar">
        <YTitlebar :type="'play-ui'" @close-panel="show = false" />
      </div>
      <!-- 内容 -->
      <div class="main-content">
        <!-- 左侧 -->
        <div class="content-left">
          <!-- 歌曲信息-封面 -->
          <div class="track-cover">
            <img :src="track?.al?.picUrl" />
          </div>
          <!-- 歌曲信息-文本 -->
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
        <!-- 右侧 -->
        <div class="content-right">
          <!-- 导航： 歌词/百科/乐谱 -->
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
          <!-- 歌词 -->
          <div
            class="lyrics"
            :style="{
              overflow: showNewLyrics ? 'unset' : 'hidden',
            }"
            v-if="position === 'lyric'"
          >
            <YLyricsNew v-if="showNewLyrics" class="ylyrics-new" />
            <YLyrics v-else class="ylyrics" />
          </div>
          <!-- 百科和乐谱 -->
          <YScroll v-else style="height: calc(100vh - 350px); margin-left: 5px">
            <!-- 百科 -->
            <div class="wiki font-color-main" v-if="position === 'wiki'">
              <div class="wiki-content">
                <!-- 回忆坐标 -->
                <div
                  class="wiki-first-listen"
                  v-if="firstListen?.creatives?.length ?? 0 > 0"
                >
                  <div class="first-listen-main-title">
                    {{ firstListen?.uiElement.mainTitle.title }}
                  </div>
                  <div class="first-listen-content">
                    <!-- 第一次听 -->
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
                    <!-- 累计播放 -->
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
                <!-- 音乐百科 -->
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
            <!-- 乐谱 -->
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
      <!-- 播放栏 -->
      <div class="play-bar">
        <YPlaybar :type="'play-ui'" @close-panel="show = false" ref="playBar" />
      </div>
      <!-- 频谱图 -->
      <div class="spectrum-canvas">
        <YSpecCanvas />
      </div>
    </div>
  </transition>
</template>

<script src="./YPlayUI.ts" lang="ts"></script>

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
        display: flex;
        width: 40vh;
        height: 40vh;
        max-width: 40vw;
        max-height: 40vw;
        align-items: center;

        img {
          width: 100%;
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
        padding: 0 0 00px 0;
        width: 100%;

        .ylyrics {
          margin: calc((100vh - 350px) / 2 - 285px) 0 0 0;
        }
        .ylyrics-new {
          width: calc(100% - 100px);
          max-width: 38vw;
          height: calc(100vh - 350px);
          margin: 0;
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
