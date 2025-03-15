<template>
  <!-- 歌曲信息窗口 -->
  <div class="song-info">
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("song_info.song_info") }}
        </span>
      </template>
      <YScroll>
        <div class="song-info-content">
          <div class="song-info-item" v-if="track.name">
            <div class="left">
              <span class="song-info-item-title">
                {{ $t("song_info.song_name") }} ：
              </span>
              <span class="song-info-item-content">
                {{ track.name }}
              </span>
            </div>
            <img
              class="img-copy g-icon"
              @click="copy(track.name)"
              src="@/assets/copy.svg"
              :title="$t('song_info.click_to_copy')"
            />
          </div>
          <div class="song-info-item" v-if="track.tns?.length > 0">
            <div class="left">
              <span class="song-info-item-title">
                {{ $t("song_info.song_tns") }}：
              </span>
              <span class="song-info-item-content">{{ track.tns[0] }}</span>
            </div>
            <img
              class="img-copy g-icon"
              @click="copy(track.tns[0])"
              src="@/assets/copy.svg"
              :title="$t('song_info.click_to_copy')"
            />
          </div>
          <div
            class="song-info-item"
            style="justify-content: start"
            v-if="track.ar[0].name"
          >
            <span class="song-info-item-title"
              >{{ $t("song_info.artist") }} ：</span
            >
            <div class="song-info-item-content" style="width: 100%">
              <div
                class="song-info-artist"
                v-for="artist in track.ar"
                style="width: 100%"
              >
                <div class="left">
                  <span
                    @click="openArtist(artist.id)"
                    :title="$t('song_info.click_to_view_artist_details')"
                    class="underline"
                  >
                    {{ artist.name }}
                  </span>
                </div>
                <img
                  class="img-copy g-icon"
                  @click="copy(artist.name)"
                  src="@/assets/copy.svg"
                  :title="$t('song_info.click_to_copy')"
                />
              </div>
            </div>
          </div>
          <div class="song-info-item" v-if="track.al.name">
            <div class="left">
              <span class="song-info-item-title">专辑：</span>
              <span
                class="song-info-item-content album underline"
                @click="openAlbum(track.al.id)"
                :title="$t('song_info.click_to_view_album_details')"
              >
                {{ track.al.name }}
              </span>
            </div>
            <img
              class="img-copy g-icon"
              @click="copy(track.al.name)"
              src="@/assets/copy.svg"
              :title="$t('song_info.click_to_copy')"
            />
          </div>
          <div class="song-info-item" v-if="track.al.tns?.length > 0">
            <div class="left">
              <span class="song-info-item-title">
                {{ $t("song_info.album_tns") }} ：
              </span>
              <span class="song-info-item-content">{{ track.al.tns[0] }}</span>
            </div>
            <img
              class="img-copy g-icon"
              @click="copy(track.al.tns[0])"
              src="@/assets/copy.svg"
              :title="$t('song_info.click_to_copy')"
            />
          </div>
          <div class="song-info-item" v-if="!isLocal(track.id)">
            <div class="left">
              <span class="song-info-item-title">
                {{ $t("song_info.song_id") }} ：
              </span>
              <span class="song-info-item-content">{{ track.id }}</span>
            </div>
            <img
              class="img-copy g-icon"
              @click="copy(track.id.toString())"
              src="@/assets/copy.svg"
              :title="$t('song_info.click_to_copy')"
            />
          </div>
          <div class="song-info-item" v-if="!isLocal(track.id)">
            <div class="left">
              <span class="song-info-item-title">
                {{ $t("song_info.song_link") }} ：
              </span>
              <span class="song-info-item-content">
                {{ `https://music.163.com/song?id=${track.id}` }}
              </span>
            </div>
            <img
              class="img-copy g-icon"
              @click="copy(`https://music.163.com/song?id=${track.id}`)"
              src="@/assets/copy.svg"
              :title="$t('song_info.click_to_copy')"
            />
          </div>
          <div class="song-info-item" v-if="isLocal(track.id)">
            <div class="left">
              <span class="song-info-item-title">
                {{ $t("song_info.song_path") }} ：
              </span>
              <span class="song-info-item-content">
                {{ track.localPath }}
              </span>
            </div>
            <img
              class="img-copy g-icon"
              @click="copy(track.localPath)"
              src="@/assets/copy.svg"
              :title="$t('song_info.click_to_copy')"
            />
          </div>
        </div>
      </YScroll>
    </YWindow>
  </div>
</template>

<script src="./YSongInfo.ts" lang="ts"></script>

<style lang="scss" scoped>
.underline {
  &:hover {
    text-decoration: underline;
  }
}

.song-info {
  display: flex;

  .song-info-content {
    padding: 10px;
    width: 432.1px;
    max-height: 432.1px;

    .song-info-item {
      display: flex;
      justify-content: space-between;
      margin: 15px 10px;
      text-align: left;

      .left {
        display: flex;
        align-items: first baseline;
      }

      .song-info-item-title {
        width: 75px;
        min-width: 75px;
        white-space: nowrap;
        font-size: 16px;
        font-weight: bold;
      }

      .song-info-item-content {
        font-size: 16px;
        margin-left: 10px;
        display: flex;
        flex-direction: column;
        user-select: text;
      }

      .img-copy {
        width: 20px;
        height: 20px;
        cursor: pointer;
        opacity: 0.8;
        user-select: none;

        &:hover {
          opacity: 1;
        }
      }

      .song-info-artist {
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        flex-direction: row;
        margin-right: 10px;
        font-size: 16px;
        margin-bottom: 8px;
      }

      .album {
        cursor: pointer;
      }
    }
  }
}
</style>
