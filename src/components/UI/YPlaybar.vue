<template>
  <!-- 播放栏 -->
  <div class="big-progress" v-if="type === 'play-ui'">
    <YProgressBar
      v-model="progress"
      style="height: 30px; width: 100%"
      @update:model-value="setAudioProgress"
      :show-track="false"
      :total-time="duration"
      ref="progressBarNoTrack"
    />
  </div>
  <div class="playbar font-color-main">
    <!-- 1 左侧 -->
    <div class="align-left">
      <!-- 2 播放信息 -->
      <div
        class="play-info"
        @mouseover="setShowButton"
        @mouseleave="showButton = false"
      >
        <div class="play-info-left" v-if="type === 'default'">
          <!-- 3 封面 -->
          <img
            class="img-cover img"
            :src="currentTrackCover ?? require('@/assets/song.svg')"
          />
          <div
            v-if="currentTrack"
            class="open-panel"
            @click="$emit('open-panel')"
          >
            <div class="open-panel-overlay"></div>
            <img class="img-cover img img-open-panel" src="@/assets/less.svg" />
          </div>
          <!-- 4 播放信息文本 -->
          <div class="play-info-text">
            <!-- 5 播放信息文本:标题 -->
            <div class="play-info-text-title" :title="currentTrackName">
              <YTextBanner
                :text="currentTrackName"
                style="width: 100%; overflow: hidden"
              />
            </div>
            <!-- 5 播放信息文本:艺术家 -->
            <div class="play-info-text-artist font-color-standard">
              <span v-for="(artist, index) in currentTrackArtists">
                <!-- 艺术家名 -->
                <span
                  @click="handleArtistClick(artist.id)"
                  class="artist-button"
                  :title="artist.name + (artist.tns ? '\n' + artist.tns : '')"
                >
                  {{ artist.name }}
                </span>
                <span v-if="index < currentTrackArtists.length - 1">
                  /&nbsp;
                </span>
              </span>
            </div>
          </div>
        </div>
        <!-- 歌曲操作按钮 -->
        <div class="play-info-right" v-if="showButton || type === 'play-ui'">
          <div
            v-if="type === 'play-ui'"
            class="close-button"
            @click="$emit('close-panel')"
          >
            <img class="img-close-panel g-icon" src="@/assets/more.svg" />
          </div>
          <img
            class="img-info play-info-ico g-icon"
            src="@/assets/info.svg"
            :style="{ width: '22px', height: '22px' }"
            :title="$t('playbar.song_info')"
            @click="openInfoPanel"
          />
          <img
            class="img-subscribe play-info-ico g-icon"
            src="@/assets/subscribe.svg"
            :style="{ width: '20px', height: '20px' }"
            :title="$t('context.subscribe')"
            @click="handleSubscribe"
          />
          <img
            class="img-download play-info-ico g-icon"
            src="@/assets/smalldownload.svg"
            :title="$t('context.download')"
            v-if="!downloadedSongIds.includes(currentTrack?.id ?? 0)"
            @click="downloadCurrentTrack"
          />
          <div
            class="song-comment"
            @click="handleCommentClick(currentTrack?.id ?? 0)"
          >
            <img
              class="img-comment play-info-ico g-icon"
              src="@/assets/comment2.svg"
              :title="$t('context.view_comment')"
            />
            <div class="song-comment-num">
              {{ currentTrackComment }}
            </div>
          </div>
          <div
            class="play-info-time font-color-standard"
            v-if="type === 'play-ui'"
          >
            {{ currentTime ? formatDuration(currentTime) : "00:00" }} /
            {{ formatDuration(duration) }}
          </div>
        </div>
      </div>
    </div>
    <!-- 1 中间 -->
    <div class="align-center">
      <!-- 2 控制按钮 -->
      <div class="buttons">
        <!-- 3 喜欢按钮 -->
        <button
          class="button like-button"
          :tabindex="-1"
          @click="_toogleLike(likelist.includes(currentTrack?.id ?? 0))"
        >
          <img
            class="img-like img"
            src="@/assets/likes.svg"
            v-if="likelist.includes(currentTrack?.id ?? 0)"
            :title="$t('playbar.cancel_like')"
          />
          <img
            v-else
            class="img-like img g-icon"
            src="@/assets/unlikes.svg"
            :style="{
              opacity: 0.7,
            }"
            :title="$t('playbar.like')"
          />
        </button>
        <!-- 3 上一首按钮 -->
        <button
          class="button previous-button"
          :tabindex="-1"
          @click="goTo('backwards')"
          :title="$t('playbar.previous')"
        >
          <img class="img-previous img g-icon" src="@/assets/previous.svg" />
        </button>
        <!-- 3 播放/暂停按钮 -->
        <button
          class="button play-button"
          :tabindex="-1"
          @click="tooglePlayState"
          :title="
            playState === 'pause' ? $t('playbar.play') : $t('playbar.pause')
          "
        >
          <img
            v-show="playState === 'pause'"
            class="img-play img"
            src="@/assets/play.svg"
          />
          <img
            v-show="playState === 'play'"
            class="img-pause img"
            src="@/assets/pause.svg"
          />
        </button>
        <!-- 3 下一首按钮 -->
        <button
          class="button next-button"
          :tabindex="-1"
          @click="goTo('forward')"
          :title="$t('playbar.next')"
        >
          <img class="img-next img g-icon" src="@/assets/next.svg" />
        </button>
        <!-- 3 播放模式按钮 -->
        <button
          class="button playMode-button"
          :tabindex="-1"
          @click="play_mode_panel?.tooglePanel()"
          ref="play_mode_panel_trigger"
        >
          <img
            v-if="playMode === 'order'"
            class="img-order img img-opacity-7 g-icon"
            src="@/assets/order.svg"
            :title="$t('playbar.order')"
          />
          <img
            v-if="playMode === 'listloop'"
            class="img-listloop img img-opacity-7 g-icon"
            src="@/assets/listloop.svg"
            :title="$t('playbar.listloop')"
          />
          <img
            v-if="playMode === 'random'"
            class="img-random img-opacity-7 img g-icon"
            src="@/assets/random.svg"
            :title="$t('playbar.random')"
          />
          <YListRandom
            v-if="playMode === 'listrandom'"
            :title="$t('playbar.listrandom')"
          />
          <img
            v-if="playMode === 'loop'"
            class="img-loop img img-opacity-7 g-icon"
            src="@/assets/loop.svg"
            :title="$t('playbar.loop')"
          />
        </button>
        <!-- 选择播放模式面板 -->
        <YPanel
          :default-show="false"
          ref="play_mode_panel"
          :trigger="play_mode_panel_trigger as HTMLElement"
          :slide-direction="5"
          :hide-mode="'show'"
          :slide-distance="8"
          :animation-time="0.1"
        >
          <div class="playMode-switcher" id="panel">
            <div
              class="playMode-item"
              @click="
                tooglePlayMode('order');
                play_mode_panel?.tooglePanel();
              "
            >
              <img
                class="img-order img g-icon playMode-img"
                src="@/assets/order.svg"
              />
              {{ $t("playbar.order") }}
            </div>
            <div
              class="playMode-item"
              @click="
                tooglePlayMode('listloop');
                play_mode_panel?.tooglePanel();
              "
            >
              <img
                class="img-listloop img playMode-img g-icon"
                src="@/assets/listloop.svg"
              />
              {{ $t("playbar.listloop") }}
            </div>
            <div
              class="playMode-item"
              @click="
                tooglePlayMode('random');
                play_mode_panel?.tooglePanel();
              "
            >
              <img
                class="img-random img playMode-img g-icon"
                src="@/assets/random.svg"
              />
              {{ $t("playbar.random") }}
            </div>
            <div
              class="playMode-item"
              @click="
                tooglePlayMode('listrandom');
                play_mode_panel?.tooglePanel();
              "
            >
              <YListRandom class="playMode-img" />
              {{ $t("playbar.listrandom") }}
            </div>
            <div
              class="playMode-item"
              @click="
                tooglePlayMode('loop');
                play_mode_panel?.tooglePanel();
              "
            >
              <img
                class="img-loop img playMode-img g-icon"
                src="@/assets/loop.svg"
              />
              {{ $t("playbar.loop") }}
            </div>
          </div>
        </YPanel>
      </div>
      <!-- 2 进度条 -->
      <div class="progress" v-if="type === 'default'">
        <!-- 3 自定义进度条 -->
        <div class="time font-color-main">
          {{ currentTime ? formatDuration(currentTime) : "00:00" }}
        </div>
        <YProgressBar
          v-model="progress"
          style="height: 20px; width: 321px"
          @update:model-value="setAudioProgress"
        />
        <div class="time font-color-main">
          {{ formatDuration(duration) }}
        </div>
      </div>
    </div>
    <!-- 1 右侧 -->
    <div class="align-right">
      <div class="buttons" style="margin-right: 10px">
        <!-- 音质按钮 -->
        <div
          class="quality-button font-color-main"
          ref="quality_panel_trigger"
          @click="quality_panel?.tooglePanel()"
          :title="$t('playbar.select_sound_quality')"
        >
          {{ $t(qualityDisplay) }}
        </div>
        <!-- 选择音质面板 -->
        <YPanel
          ref="quality_panel"
          :trigger="quality_panel_trigger as HTMLElement"
          :slide-direction="4"
          :default-show="false"
          :animation-time="0.1"
          :slide-distance="15"
          :z-index="100"
          :hide-mode="'if'"
        >
          <div class="quality-panel" id="panel">
            <div class="quality-title font-color-main">
              {{ $t("playbar.sound_quality") }}
            </div>
            <div class="quality-switcher">
              <div
                class="quality-item"
                v-for="quality in qualityGroup"
                @click="
                  setQuality(
                    quality.name as
                      | 'jymaster'
                      | 'sky'
                      | 'jyeffect'
                      | 'hires'
                      | 'lossless'
                      | 'exhigh'
                      | 'standard',
                  )
                "
                :style="{ opacity: quality.available ? 1 : 0.4 }"
              >
                <div class="quality-item-title font-color-high">
                  {{ $t(quality.display) }}
                </div>
                <div class="quality-item-desc font-color-standard">
                  {{ quality.size + " " + $t(quality.desc) }}
                </div>
              </div>
            </div>
          </div>
        </YPanel>
        <!-- 均衡器按钮 -->
        <img
          class="img volume-img g-icon"
          src="@/assets/equalizer.svg"
          style="width: 20px; height: 20px; margin-right: 18px"
          @click="openEqualizer"
        />
        <!-- 音量按钮 -->
        <img
          class="img volume-img g-icon"
          src="@/assets/volume.svg"
          style="width: 22px; height: 22px; margin-right: 10px"
          :title="$t('playbar.volume')"
          ref="volume_panel_trigger"
          @click="volume_panel?.tooglePanel()"
        />
        <!-- 音量面板 -->
        <YPanel
          ref="volume_panel"
          :trigger="volume_panel_trigger as HTMLElement"
          :slide-direction="5"
          :animation-time="0.1"
          :slide-distance="10"
          id="panel"
        >
          <div class="volume-container" id="panel">
            <YProgressBarV
              v-model="volume"
              style="
                height: 120px;
                width: 20px;
                position: absolute;
                bottom: 30px;
              "
              @set-progress-end="updateVolumeInSetting"
            />
            <div class="volume-text">
              {{ Math.round(volume * 100) + "%" }}
            </div>
          </div>
        </YPanel>
        <!-- 播放列表按钮 -->
        <div
          class="playlist-img-container"
          @click="openPlaylistPanel"
          :title="$t('playbar.playlist')"
          ref="playlist_panel_trigger"
        >
          <img
            class="img playlist-img g-icon"
            src="@/assets/playlist2.svg"
            style="width: 20px; height: 20px; margin-left: 10px"
          />
          <div class="number">
            {{ playlist.length }}
          </div>
        </div>
        <!-- 播放列表面板 -->
        <YPanel
          ref="playlist_panel"
          @mounted="handlePlaylistPanelMounted"
          @close-panel="handlePlaylistClose"
          :trigger="playlist_panel_trigger as HTMLElement"
          :slide-direction="4"
          :default-show="false"
          @show-panel="scrollToCurrentTrack"
        >
          <div class="playlist-container" id="panel">
            <div class="playlist-title">
              <div class="title-left font-color-main">
                <span>
                  {{ $t("playbar.playlist") }}
                </span>
                <div
                  class="songs-count"
                  style="
                    color: var(--font-color-main);
                    margin: 0;
                    padding: 0 20px 0px 5px;
                    font-size: 13px;
                    font-weight: bold;
                  "
                >
                  {{ playlist.length }}
                </div>
              </div>
              <div class="title-right">
                <span @click="player.clearPlaylist()" style="cursor: pointer">
                  <img
                    class="g-icon"
                    src="@/assets/delete.svg"
                    style="
                      width: 20px;
                      height: 20px;
                      margin-right: 8px;
                      opacity: 0.8;
                    "
                    :title="$t('playbar.clear_playlist')"
                  />
                </span>
              </div>
            </div>
            <div class="playlist-header font-color-standard">
              <div class="playlist-header-item">
                {{ $t("playbar.playlist_panel.title") }}
              </div>
              <div class="playlist-header-item">
                {{ $t("playbar.playlist_panel.like") }}
              </div>
            </div>
            <YScroll>
              <YSongsTable
                v-if="showSongs"
                class="songs-table"
                v-model="playlist"
                :showTrackCounter="false"
                :showTrackAlbum="false"
                :showTrackDuration="false"
                :showTrackPopularity="false"
                :showHeader="false"
                :resortable="false"
                :canSendPlaylist="false"
                :limit="500"
                :id="'YPlaybar.vue'"
                :scroll-to-current-track-on-mount="true"
                ref="songstable"
              />
            </YScroll>
            <YLoading style="margin: auto" v-if="!showSongs" />
          </div>
        </YPanel>
      </div>
    </div>
  </div>
</template>

<script src="./YPlaybar.ts" lang="ts"></script>

<style lang="scss" scoped>
.big-progress {
  position: absolute;
  width: 100%;
  bottom: 71px;
}

.playbar {
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  user-select: none;

  .img {
    user-select: none;
    -webkit-user-drag: none;
    cursor: pointer;
  }

  .volume-img,
  .playlist-img {
    opacity: 0.7;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
  .playlist-img-container {
    display: flex;
    position: relative;
    cursor: pointer;
    align-items: center;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }

    .playlist-img {
      opacity: 1;
    }

    .number {
      position: absolute;
      top: -3px;
      left: 26px;
      font-size: 10px;
    }
  }

  .align-left {
    display: flex;
    align-items: center;
    width: calc(50vw - 220px);
    height: 100%;

    .play-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 10px;
      width: 100%;
      height: 100%;

      .play-info-left {
        display: flex;
        align-items: center;
        margin-right: 10px;
        overflow: hidden;
        position: relative;

        .img-cover {
          width: 50px;
          height: 50px;
          margin-right: 10px;
          margin-left: 15px;
          border-radius: 5px;
        }

        .open-panel {
          position: absolute;
          width: 50px;
          height: 50px;
          opacity: 0;
          transition: all 0.2s ease;

          .open-panel-overlay {
            position: absolute;
            width: 50px;
            height: 50px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
            left: 15px;
          }

          .img-open-panel {
            position: absolute;
            width: 30px;
            height: 30px;
            left: 10px;
            top: 10px;
            cursor: pointer;
          }
        }

        .play-info-text {
          flex-direction: column;
          overflow: hidden;

          .play-info-text-title {
            text-align: left;
            align-items: flex-start;
            position: relative;
            height: 20px;
            /* overflow: hidden; */
            white-space: nowrap;
            text-overflow: ellipsis;
            width: 100%;
          }

          .play-info-text-artist {
            text-align: left;
            align-items: flex-start;
            font-size: 14px;
            margin-top: 5px;
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            .artist-button {
              cursor: pointer;
            }
          }
        }
      }

      .play-info-right {
        display: flex;
        align-items: center;

        .close-button {
          padding: 10px 10px 5px 10px;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          margin: 0 20px 0 20px;

          .img-close-panel {
            width: 16px;
            height: 16px;
          }
        }

        .play-info-ico {
          width: 21px;
          height: 21px;
          cursor: pointer;
          opacity: 0.6;

          &:hover {
            opacity: 1;
          }
        }

        .img-info {
          margin-right: 10px;
        }

        .img-subscribe {
          margin-right: 10px;
        }

        .img-download {
          margin-right: 10px;
        }

        .play-info-time {
          margin-left: 15px;
          font-size: 13px;
        }

        .song-comment {
          display: flex;
          align-items: center;
          position: relative;
          opacity: 0.6;
          cursor: pointer;

          &:hover {
            opacity: 1;
          }

          .img-comment {
            margin-right: 10px;
            opacity: 1;
          }

          .song-comment-num {
            position: absolute;
            left: 11px;
            top: -6px;
            font-size: 10px;
            z-index: 1;
            padding: 0px 0px 2px 2px;
          }
        }
      }

      &:hover {
        .open-panel {
          opacity: 1;
        }
      }
    }
  }

  .align-center {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);

    .buttons {
      display: flex;
      align-items: center;

      .button {
        margin: 0 10px;
        cursor: pointer;
        background-color: transparent;
        border: none;
      }

      .like-button {
        .img-like {
          width: 22px;
          height: 22px;
        }
      }

      .previous-button {
        .img-previous {
          width: 18px;
          height: 18px;
          opacity: 0.7;
        }
      }

      .play-button {
        display: flex;
        width: 40px;
        height: 40px;
        background-color: rgb(var(--highlight-color-rgb));
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        overflow: hidden;

        .img-play {
          width: 16px;
          height: 16px;
          padding-left: 3px;
        }

        .img-pause {
          width: 16px;
          height: 16px;
        }
      }

      .next-button {
        .img-next {
          width: 18px;
          height: 18px;
          opacity: 0.7;
        }
      }

      .playMode-button {
        display: flex;
        width: 22px;
        height: 22px;
        align-items: center;
        justify-content: center;
        margin-bottom: 3px;
      }

      .img-order {
        width: 20px;
        height: 20px;
      }

      .img-listloop {
        width: 22px;
        height: 22px;
      }

      .img-random {
        width: 18px;
        height: 18px;
      }

      .img-loop {
        width: 22px;
        height: 22px;
      }

      .img-opacity-7 {
        opacity: 0.7;
      }

      .playMode-switcher {
        display: flex;
        position: absolute;
        transform: translate(calc(-50% - 21px), calc(-100% - 21px));
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--panel-background-color);
        border-radius: 5px;
        padding: 2px 10px;
        box-shadow: 0px -0px 8px rgba(0, 0, 0, 0.4);

        .playMode-item {
          display: flex;
          align-items: center;
          justify-content: start;
          white-space: nowrap;
          width: 100%;
          height: 30px;
          cursor: pointer;
          color: var(--font-color-high);
          font-size: 15px;
          padding: 5px 0px;
          margin: 0px;

          &:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .playMode-img {
            margin-right: 8px;
          }
        }
      }
    }

    .progress {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 4px;
      background-color: transparent;

      .time {
        font-size: 12px;
        margin: 0 8px;
        opacity: 0.4;
      }
    }
  }

  .align-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: calc(50vw - 220px);
    height: 100%;
    margin-right: 20px;

    .buttons {
      display: flex;
      align-items: center;

      .quality-button {
        position: relative;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        margin-right: 20px;
        border: 1.5px solid rgba(var(--foreground-color-rgb), 0.5);
        padding: 3px 6px;
        align-items: center;
        justify-content: center;
        border-radius: 13px;
        opacity: 0.7;

        &:hover {
          opacity: 1;
        }
      }

      .quality-panel {
        position: absolute;
        display: flex;
        flex-direction: column;
        width: 321px;
        background-color: var(--panel-background-color);
        border-radius: 5px;
        transform: translate(calc(-100% - 20px), calc(-100% - 25px));
        text-align: left;
        padding-top: 15px;
        padding-bottom: 10px;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);

        .quality-title {
          font-size: 17px;
          text-align: left;
          font-weight: bold;
          padding: 0px 0px 10px 15px;
        }

        .quality-switcher {
          display: flex;
          flex-direction: column;

          .quality-item {
            display: flex;
            flex-direction: column;
            text-align: left;
            height: 50px;
            justify-content: center;
            cursor: pointer;
            font-size: 15px;
            padding-left: 15px;

            &:hover {
              background-color: rgba(var(--foreground-color-rgb), 0.1);
            }

            .quality-item-title {
              font-size: 15px;
              width: 100%;
              text-align: left;
            }

            .quality-item-desc {
              font-size: 13px;
              width: 100%;
              text-align: left;
            }
          }
        }
      }

      .volume-container {
        position: absolute;
        display: flex;
        flex-direction: column;
        width: 20px;
        height: 135px;
        align-items: center;
        justify-content: top;
        background-color: var(--panel-background-color);
        border-radius: 5px;
        padding: 10px 10px 20px 10px;
        transform: translate(-100%, calc(-100% - 20px));
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);

        .volume-text {
          position: absolute;
          font-size: 13px;
          bottom: 5px;
        }
      }

      .playlist-container {
        position: absolute;
        background-color: var(--panel-background-color);
        display: flex;
        flex-direction: column;
        border-radius: 5px;
        padding: 10px;
        justify-content: flex-start;
        transform: translate3d(calc(-100%), calc(-100% - 65px), 0);
        width: calc(321px + 43px);
        height: calc(100vh - 230px);
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);

        .playlist-title {
          display: flex;
          justify-content: space-between;
          margin: 10px;
          margin-bottom: 4px;
          padding-bottom: 6px;

          .title-left {
            display: flex;
            flex-direction: row;
            font-size: 17px;
            text-align: left;
            font-weight: bold;
          }
        }

        .playlist-header {
          display: flex;
          font-size: 14px;
          flex-direction: row;
          padding: 0px 25px 10px 0px;
          margin-right: 10px;
          margin-left: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          justify-content: space-between;
        }
      }
    }
  }
}
</style>
