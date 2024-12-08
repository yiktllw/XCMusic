<template>
  <!-- 歌单、专辑界面 -->
  <!-- 0 滚动容器 -->
  <div class="scrollable y-playlist-view font-color-main" ref="scrollable">
    <!-- 1 歌单视图 -->
    <div class="playlist-view" ref="playlist_view">
      <!-- 2 歌单信息 -->
      <div class="playlist-info">
        <!-- 3 歌单封面 -->
        <div class="playlist-cover-container">
          <!-- 4 封面图片 -->
          <img
            v-if="playlist.coverImgUrl"
            :src="playlist.coverImgUrl"
            alt="Cover Image"
            class="playlist-cover"
            @load="_setBackgroundColor"
          />
          <div
            v-if="!playlist.coverImgUrl"
            class="playlist-cover"
            style="background-color: rgba(var(--foreground-color-rgb), 0.3)"
          ></div>
          <!-- 4 渐变层 -->
          <div class="gradient-overlay" v-if="type === 'playlist'"></div>
          <!-- 4 播放次数 -->
          <div class="play-info" v-if="type === 'playlist'">
            <img src="@/assets/play.svg" class="play-icon" />
            <span class="play-count">{{ playlist.playCount }}</span>
          </div>
        </div>
        <!-- 3 歌单详情 -->
        <div class="playlist-details" v-if="playlist.name">
          <div
            class="align-up"
            :class="type === 'playlist' ? '' : 'align-up-album'"
          >
            <!-- 4 歌单名称 -->
            <div class="playlist-name">
              {{
                playlist.name + (playlist.transName ? playlist.transName : "")
              }}
            </div>
            <!-- 4 创建信息 -->
            <div class="createrInfo" v-if="type === 'playlist'">
              <!-- 5 创建者头像 -->
              <img
                v-if="playlist.createrAvatarUrl"
                :src="playlist.createrAvatarUrl"
                class="createrAvatar"
              />
              <div
                v-if="!playlist.createrAvatarUrl"
                class="createrAvatar"
                style="background-color: rgba(var(--foreground-color-rgb), 0.3)"
              ></div>
              <!-- 5 创建者名称 -->
              <span class="creater-name">
                {{ playlist.createrName }}
              </span>
              <span
                v-if="!playlist.createrAvatarUrl"
                class="creater-name"
                style="background-color: rgba(var(--foreground-color-rgb), 0.3)"
              >
                {{ $t("playlist_view.creator") }}
              </span>
              <!-- 5 创建时间 -->
              <span class="create-time font-color-standard">
                {{ playlist.createTime }}
                {{ $t("playlist_view.created_time") }}
              </span>
            </div>
            <!-- 4 创建信息 -->
            <div class="album-artist font-color-high" v-else>
              <span v-for="(artist, index) in playlist.artists">
                <!-- 5 歌手按钮 -->
                <span
                  @click="handleArtistClick(artist.id)"
                  class="artist-button"
                  :title="artist.name + (artist.tns ? '\n' + artist.tns : '')"
                >
                  {{ artist.name }}
                </span>
                <span v-if="index < playlist.artists.length - 1">
                  /&nbsp;
                </span>
              </span>
            </div>
            <div class="createrInfo" v-if="type === 'album'">
              <!-- 5 创建时间 -->
              <span class="create-time-album font-color-standard">
                {{ playlist.createTime }}&nbsp;
                {{ $t("playlist_view.published_time") }}
              </span>
            </div>
          </div>
          <div class="align-down">
            <!-- 4 歌单按钮 -->
            <div class="play-buttons">
              <!-- 5 播放按钮 -->
              <button :tabindex="-1" class="play-button" @click="playAll">
                <img
                  src="@/assets/play.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                <span style="padding-bottom: 2px">
                  {{ $t("playlist_view.play") }}
                </span>
              </button>
              <!-- 5 添加到播放列表按钮 -->
              <button
                :tabindex="-1"
                class="add-button"
                @click="addPlaylistToQueue"
              >
                <img
                  class="g-icon"
                  src="@/assets/addtoplaylist.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                {{ $t("playlist_view.add_to_playlist") }}
              </button>
              <!-- 5 下载按钮 -->
              <button
                :tabindex="-1"
                class="download-button"
                @click="downloadPlaylist"
              >
                <img
                  class="g-icon"
                  src="@/assets/download.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                {{ $t("playlist_view.download") }}
              </button>
              <!--订阅按钮 -->
              <button
                v-if="!userCreateIds.includes(playlistId)"
                :tabindex="-1"
                class="multichoice-button"
                @click="subscribe()"
              >
                <img
                  class="g-icon"
                  src="@/assets/subscribe3.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                {{
                  (type === "playlist" &&
                    userSubscribeIds.includes(playlistId)) ||
                  (type === "album" &&
                    userSubscribeAlbumIds.includes(playlistId))
                    ? $t("playlist_view.subscribed")
                    : $t("playlist_view.subscribe")
                }}
              </button>
              <!-- 5 多选按钮 -->
              <button
                :tabindex="-1"
                class="multichoice-button"
                @click="multiChoice"
              >
                <img
                  class="g-icon"
                  src="@/assets/multichoice.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                {{ $t("playlist_view.multi_select") }}
              </button>
              <!-- 5 搜索框 -->
              <div class="input-wrapper">
                <input
                  type="text"
                  class="search-input font-color-main"
                  @keydown.enter="
                    handleSearch(
                      ($event.target as HTMLInputElement).value,
                      true,
                    )
                  "
                  @input="
                    handleSearch(
                      ($event.target as HTMLInputElement).value,
                      false,
                    )
                  "
                  :placeholder="$t('playlist_view.search') + '...'"
                  spellcheck="false"
                  v-model="searchQuery"
                />
                <img src="@/assets/search.svg" class="img-search g-icon" />
                <img
                  v-if="searchQuery !== ''"
                  class="img-clear"
                  src="@/assets/clear2.svg"
                  @click="searchQuery = ''"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 2 切换歌曲或评论 -->
      <div class="orienter">
        <!-- 3 歌曲 -->
        <div class="orient-songs">
          <!-- 4 歌曲按钮 -->
          <button
            :tabindex="-1"
            class="orient-button"
            @click="orient = 'songs'"
          >
            <span
              style="font-size: 16px; color: var(--font-color-main)"
              :style="{
                'font-weight': orient === 'songs' ? 'bold' : '500',
                color:
                  orient === 'songs'
                    ? 'var(--font-color-main)'
                    : 'var(--font-color-standard)',
              }"
            >
              {{ $t("playlist_view.songs") }}
            </span>
            <div
              class="choosed"
              style="
                transform: translate(7px, 4px);
                width: 60%;
                height: 4px;
                border-radius: 2px;
              "
              v-if="orient === 'songs'"
            ></div>
          </button>
        </div>
        <div
          class="songs-count"
          style="
            color: var(--font-color-main);
            margin: 0;
            padding: 0 20px 0px 2px;
            font-size: 13px;
            font-weight: bold;
          "
          :style="{
            color:
              orient === 'songs'
                ? 'var(--font-color-main)'
                : 'var(--font-color-standard)',
          }"
        >
          {{ playlist.trackCount }}
        </div>
        <!-- 3 评论 -->
        <div class="orient-comments">
          <!-- 4 评论按钮 -->
          <button
            :tabindex="-1"
            class="orient-button"
            @click="orient = 'comments'"
          >
            <span
              style="font-size: 16px"
              :style="{
                'font-weight': orient === 'comments' ? 'bold' : '500',
                color:
                  orient === 'comments'
                    ? 'var(--font-color-main)'
                    : 'var(--font-color-standard)',
              }"
            >
              {{ $t("playlist_view.comments") }}
            </span>
            <div
              class="choosed"
              style="
                transform: translate(7px, 4px);
                width: 60%;
                height: 4px;
                border-radius: 2px;
              "
              v-if="orient === 'comments'"
            ></div>
          </button>
        </div>
      </div>
      <!-- 2 加载中动画 -->
      <YLoading v-if="isLoading" />
      <!-- 2 歌曲列表 -->
      <YSongsTable
        v-if="!isLoading && type === 'playlist' && orient === 'songs'"
        v-model="filteredTracks"
        :showTrackPopularity="false"
        id="YPlaylist.vue-playlist"
        :from="playlistId"
        ref="playlist_songstable"
      />
      <YSongsTable
        v-if="!isLoading && type === 'album' && orient === 'songs'"
        v-model="filteredTracks"
        :showTrackAlbum="false"
        :showTrackCover="false"
        :al-reels="playlist.alReels"
        id="YPlaylist.vue-album"
        :type="'album'"
        :show-header="false"
        :resortable="false"
        ref="album_songstable"
      />
      <!-- 2 分页 -->
      <YComment
        :type="type"
        :id="playlistId"
        v-if="orient === 'comments'"
        :show-header="false"
        ref="ycomment"
      />
      <!-- 2 滚动按钮 -->
      <div class="scroll-buttons">
        <div class="button" @click="scrollToCurrentTrack">
          <img src="@/assets/position.svg" class="g-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./YPlaylistView.ts" lang="ts"></script>

<style lang="scss" scoped>
.playlist-view {
  padding: 20px;
  background-color: transparent;

  .playlist-info {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;

    .playlist-cover-container {
      position: relative;
      display: inline-block;
      margin-right: 20px;

      .playlist-cover {
        display: block;
        width: 160px;
        height: 160px;
        border-radius: 10px;
        user-select: none;
        -webkit-user-drag: none;
      }

      .gradient-overlay {
        position: absolute;
        border-radius: 10px;
        top: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.3),
          rgba(0, 0, 0, 0)
        );
        pointer-events: none;
        z-index: 1;
      }

      .play-info {
        position: absolute;
        top: 3px;
        right: 3px;
        display: flex;
        align-items: center;
        padding: 5px;
        border-radius: 5px;
        z-index: 1;

        .play-icon {
          width: 11px;
          height: 11px;
          margin-right: 3px;
        }

        .play-count {
          font-size: 14px;
          color: #fff;
        }
      }
    }

    .playlist-details {
      display: flex;
      justify-content: space-between;
      width: calc(100% - 180px);
      height: 160px;
      flex-direction: column;

      .align-up {
        display: inherit;
        flex-direction: inherit;
        margin-top: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .align-up-album {
        width: 100%;
        margin-top: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playlist-name {
        text-align: left;
        font-size: 24px;
        font-weight: bold;
        margin-top: 0px;
        margin-bottom: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .createrInfo {
        display: inline-flex;
        align-items: center;

        .createrAvatar {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          margin-right: 5px;
        }

        .creater-name {
          color: var(--font-color-high);
        }

        .create-time {
          padding-bottom: 3px;
          padding-left: 10px;
        }

        .create-time-album {
          font-size: 14px;
        }
      }

      .album-artist {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .artist-button {
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          text-overflow: ellipsis;
        }
      }

      .align-down {
        display: inherit;
        flex-direction: inherit;
        margin-bottom: 5px;

        .play-buttons {
          display: inline-flex;
          width: 100%;
          height: 35px;

          .play-button {
            color: #fff;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            background-color: transparent;
            border-style: none;
            border-radius: 5px;
            padding: 7px 15px 7px 12px;
            margin-right: 5px;
            background-color: rgb(var(--highlight-color-rgb));
            &:hover {
              background-color: rgba(var(--highlight-color-rgb), 0.8);
            }
          }

          .add-button,
          .download-button,
          .multichoice-button {
            color: var(--font-color-main);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            background-color: transparent;
            border-style: none;
            border-radius: 5px;
            padding: 7px 15px 7px 12px;
            margin-left: 5px;
            margin-right: 5px;
            padding-top: 8px;
            padding-bottom: 8px;
            background-color: rgba(var(--foreground-color-rgb), 0.1);

            &:hover {
              background-color: rgba(var(--foreground-color-rgb), 0.2);
            }
          }

          .input-wrapper {
            position: relative;
            display: flex;
            margin-left: auto;
            opacity: 0.5;

            .search-input {
              padding: 8px 30px 8px 30px;
              background-color: rgba(var(--foreground-color-rgb), 0.05);
              border-style: none;
              border-radius: 100px;
              width: 50px;
              transition-duration: 0.3s;

              &::placeholder {
                user-select: none;
                color: inherit;
              }

              &:focus {
                width: 150px;
                outline: none;
              }
            }

            .img-search {
              position: absolute;
              left: 10px;
              top: 50%;
              transform: translateY(-50%);
              width: 15px;
              height: 15px;
              -webkit-user-drag: none;
            }

            .img-clear {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              width: 15px;
              height: 15px;
              -webkit-user-drag: none;
              cursor: pointer;
            }
          }
        }
      }
    }
  }

  .orienter {
    display: flex;
    margin-bottom: 20px;
    background-color: transparent;

    .orient-songs {
      background-color: transparent;
    }

    .orient-comments {
      background-color: transparent;
    }

    .orient-button {
      cursor: pointer;
      background-color: transparent;
      border-style: none;
      padding: 0;
    }

    .choosed {
      width: 90%;
      height: 2px;
      background-color: rgb(var(--highlight-color-rgb));
      transform: translateY(1px);
      transform: translateX(1px);
    }
  }

  .scroll-buttons {
    position: absolute;
    right: 20px;
    bottom: 20px;
    display: flex;
    align-items: center;
    flex-direction: column;

    .button {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background-color: var(--panel-background-color);
      border-style: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      box-shadow: 0 0 5px rgba($color: #000000, $alpha: 0.4);
      padding: 0;

      img {
        width: 32.1px;
        height: 32.1px;
        opacity: 0.6;
      }

      &:hover {
        img {
          opacity: 1;
        }
      }
    }
  }
}
</style>
