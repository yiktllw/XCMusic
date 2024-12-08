<template>
  <!-- 歌曲列表组件 -->
  <div class="table-container" ref="main">
    <!-- 3 表头 -->
    <div v-if="showHeader" class="table-header" :style="{ top: stickyTop }">
      <!-- 4 歌曲序号-表头 -->
      <div class="songsCounter" v-if="showTrackCounter">
        <!-- 5 歌曲序号-表头按钮 -->
        <button :tabindex="-1" class="header-button header-counter">
          <span>#</span>
        </button>
      </div>
      <!-- 4 歌曲标题-表头 -->
      <div class="songsName" v-if="showTrackTitle">
        <!-- 5 标题排序按钮 -->
        <button
          :tabindex="-1"
          :disabled="!resortable"
          class="header-button"
          @click="handleSort"
        >
          <span>
            {{ $t("songs_table.title") }}
          </span>
          <!-- 6 排序内容 -->
          <div v-if="resortable" class="sort-content">
            <img
              :src="sortingStates[currentSortingIndex].icon"
              class="sort-icon g-icon"
            />
            <span style="font-size: 13px; color: var(--font-color-standard)">
              {{ $t(sortingStates[currentSortingIndex].text) }}
            </span>
          </div>
        </button>
      </div>
      <!-- 4 resize控件 -->
      <div
        v-if="showTrackAlbum"
        class="resizer"
        @mousedown="startResize($event)"
      ></div>
      <!-- 4 专辑-表头 -->
      <div
        class="songsAlbum"
        ref="songs_album_ref"
        v-if="showTrackAlbum"
        :style="{ width: `${alWidth}px` }"
      >
        <!-- 5 专辑排序按钮 -->
        <button
          :tabindex="-1"
          :disabled="!resortable"
          class="header-button"
          @click="handleSort_Album"
        >
          <span>
            {{ $t("songs_table.album") }}
          </span>
          <!-- 6 排序内容 -->
          <div v-if="resortable" class="sort-content">
            <img
              :src="sortingStates_Album[currentSortingIndex_Album].icon"
              class="sort-icon g-icon"
            />
            <span style="font-size: 13px; color: var(--font-color-standard)">
              {{ $t(sortingStates_Album[currentSortingIndex_Album].text) }}
            </span>
          </div>
        </button>
      </div>
      <!-- 4 喜欢-表头 -->
      <div class="likes" v-if="showTrackLikes">
        <button :tabindex="-1" class="header-button">
          <span>
            {{ $t("songs_table.like") }}
          </span>
        </button>
      </div>
      <!-- 4 时长-表头 -->
      <div class="songsDuration" v-if="showTrackDuration">
        <!-- 5 时长排序按钮 -->
        <button
          :tabindex="-1"
          :disabled="!resortable"
          class="header-button"
          @click="handleSort_Duration"
        >
          <span>
            {{ $t("songs_table.duration") }}
          </span>
          <!-- 6 排序内容 -->
          <div v-if="resortable" class="sort-content">
            <img
              :src="sortingStates_Duration[currentSortingIndex_Duration].icon"
              class="sort-icon g-icon"
            />
            <span style="font-size: 13px; color: var(--font-color-standard)">
              {{
                $t(sortingStates_Duration[currentSortingIndex_Duration].text)
              }}
            </span>
          </div>
        </button>
      </div>
      <!-- 4 热度-表头 -->
      <div class="popularity" v-if="showTrackPopularity">
        <button :tabindex="-1" class="header-button">
          <span>
            {{ $t("songs_table.popularity") }}
          </span>
        </button>
      </div>
      <!-- 4 听歌次数-表头 -->
      <div class="listen-count" v-if="showListenCount">
        <button :tabindex="-1" class="header-button">
          <span>
            {{ $t("songs_table.listen_count") }}
          </span>
        </button>
      </div>
    </div>
    <!-- 3 歌曲列表内容 -->
    <ul ref="UL">
      <template
        v-for="(track, index) in tracks.slice(
          (page.current - 1) * limit,
          page.current * limit,
        )"
      >
        <div
          class="reels"
          v-if="
            track.songInReelIndex === 0 &&
            type === 'album' &&
            alReels.length > 0
          "
        >
          <div class="reels-title font-color-main">
            {{
              alReels[track.reelIndex]?.showreelName ??
              $t("songs_table.unknown_name")
            }}
          </div>
          <div
            class="reels-other font-color-standard"
            v-if="alReels[track.reelIndex]?.composerName"
          >
            {{
              alReels[track.reelIndex]?.composerName ??
              $t("songs_table.unknown_artist")
            }}
          </div>
          <div
            class="reels-other font-color-standard"
            v-for="artist in alReels[track.reelIndex]?.otherArtists"
          >
            <span>
              {{ artist }}
            </span>
          </div>
        </div>
        <li
          :id="`track-item-${track.id}`"
          class="track-item"
          :class="nowPlaying === track.id ? 'current_play_item' : ''"
        >
          <div class="align-up">
            <!-- 4 左侧对齐 -->
            <div class="align-left">
              <!-- 5 歌曲序号 -->
              <div
                class="track-count font-color-standard"
                v-if="showTrackCounter"
              >
                <span v-if="nowPlaying !== track.id">
                  {{ (page.current - 1) * 500 + index + 1 }}
                </span>
                <YPlaying v-else />
              </div>
              <!-- 5 封面图片 -->
              <div
                class="before-cover"
                style="min-width: 10px; height: 40px"
                v-if="!showTrackCounter"
              ></div>
              <img
                v-if="showTrackCover"
                class="track-cover"
                :src="track._picUrl ? track._picUrl : track.al?.picUrl"
              />
              <!-- 5 歌曲信息 -->
              <div class="track-info">
                <!-- 6 歌曲名称 -->
                <div
                  class="track-name"
                  :style="{
                    color:
                      track.id === nowPlaying
                        ? 'rgb(234,78,68)'
                        : 'var(--font-color-main)',
                  }"
                  :title="track.name + (track.tns ? '\n' + track.tns : '')"
                  v-if="showTrackTitle"
                >
                  {{
                    type === "album"
                      ? (track.reelName ?? track.name)
                      : track.name
                  }}
                  <span class="font-color-standard">
                    {{ track.tns ? " (" + track.tns + ")" : "" }}
                  </span>
                </div>
                <!-- 6 歌手名称 -->
                <div
                  class="track-artist font-color-standard"
                  v-if="showTrackArtist"
                >
                  <img
                    src="@/assets/success.svg"
                    class="track-artist-download-icon"
                    v-if="downloadedSongIds.includes(track.id)"
                  />
                  <span v-for="(artist, index) in track.ar">
                    <!-- 7 歌手按钮 -->
                    <span
                      class="ul-button"
                      :id="`artist-${artist.id}`"
                      :class="
                        track.id === nowPlaying
                          ? 'artist-button-active'
                          : 'artist-button'
                      "
                      :title="
                        artist.name + (artist.tns ? '\n' + artist.tns : '')
                      "
                    >
                      {{ artist.name }}
                    </span>
                    <span
                      v-if="index < track.ar.length - 1"
                      :style="{
                        color:
                          track.id === nowPlaying
                            ? 'rgb(234,78,68)'
                            : 'var(--font-color-standard)',
                      }"
                    >
                      /
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <!-- 4 右侧对齐 -->
            <div class="align-right">
              <div class="track-menu" :id="`track-menu-${track.id}`">
                <img
                  src="@/assets/smalldownload.svg"
                  class="track-menu-icon g-icon ul-button"
                  :style="{ width: '18px' }"
                  id="download"
                  :title="$t('context.download')"
                  v-if="!downloadedSongIds.includes(track.id)"
                />
                <img
                  src="@/assets/subscribe.svg"
                  class="track-menu-icon g-icon ul-button"
                  :style="{ width: '18px' }"
                  id="subscribe"
                  :title="$t('context.subscribe')"
                />
                <img
                  src="@/assets/comment.svg"
                  class="track-menu-icon g-icon ul-button"
                  id="comment"
                  :title="$t('context.view_comment')"
                />
                <img
                  src="@/assets/detail.svg"
                  class="track-menu-icon g-icon ul-button"
                  id="detail"
                  :title="$t('songs_table.more')"
                />
              </div>
              <!-- 5 专辑名称 -->
              <div
                class="track-album track-album-ref"
                v-if="showTrackAlbum"
                :style="{ width: `${alWidth}px` }"
              >
                <!-- 6 专辑按钮 -->
                <button
                  :tabindex="-1"
                  class="album-button font-color-standard ul-button"
                  :id="`album-${track.al.id}`"
                  :title="
                    track.al.name + (track.al.tns ? '\n' + track.al.tns : '')
                  "
                >
                  {{ trackAlTns(track.al.name, track.al.tns) }}
                </button>
              </div>
              <!-- 5 喜欢 -->
              <div class="likes" style="text-align: left" v-if="showTrackLikes">
                <img
                  v-if="id === 'YPlaybar.vue'"
                  src="@/assets/delete.svg"
                  class="g-icon like-icon delete-icon ul-button"
                  :id="`track-menu-${track.id}`"
                  :title="$t('playbar.delete_from_playlist')"
                />
                <div :id="`track-menu-2-${track.id}`" style="display: block">
                  <img
                    v-if="likelist.includes(track.id)"
                    src="@/assets/likes.svg"
                    style="
                      width: 16.8px;
                      height: 16.8px;
                      padding-left: 10px;
                      -webkit-user-drag: none;
                    "
                  />
                  <img
                    v-else
                    class="g-icon"
                    src="@/assets/unlikes.svg"
                    style="
                      width: 16.8px;
                      height: 16.8px;
                      padding-left: 10px;
                      opacity: 0.7;
                    "
                  />
                </div>
              </div>
              <!-- 5 时长 -->
              <div
                class="track-duration font-color-standard"
                v-if="showTrackDuration"
              >
                {{ formatDuration(track.dt) }}
              </div>
              <!-- 5 热度 -->
              <div class="popularity" v-if="showTrackPopularity">
                <div
                  class="popularity-bar"
                  style="
                    margin-left: 5px;
                    width: 50px;
                    height: 4px;
                    background-color: rgba(var(--foreground-color-rgb), 0.321);
                    border-radius: 2px;
                  "
                ></div>
                <div
                  class="popularity-bar"
                  style="
                    margin-left: 5px;
                    height: 4px;
                    background-color: rgb(var(--highlight-color-rgb));
                    border-radius: 2px;
                    transform: translateY(-4px);
                  "
                  :style="{ width: (track.pop / 100) * 50 + 'px' }"
                ></div>
              </div>
              <div
                class="listen-count"
                style="color: #bbb"
                v-if="showListenCount"
              >
                {{ track.playCount ?? 0 }}次
              </div>
            </div>
          </div>
          <div class="align-down" v-if="showLyrics">
            <div
              class="lyrics"
              style="
                color: #aaa;
                font-size: 14px;
                margin-top: 5px;
                margin-left: 50px;
              "
            >
              {{ $t("playui.lyric") }}:
              <span v-for="lyric in track.lyrics" v-html="formatLyric(lyric)">
              </span>
            </div>
          </div>
        </li>
      </template>
    </ul>
    <YPage v-model="page" />
  </div>
</template>

<script src="./YSongsTable.ts" lang="ts"></script>

<style src="./YSongsTable.scss" lang="scss" scoped></style>
