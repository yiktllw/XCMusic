<template>
  <!-- 查看评论界面 -->
  <div class="main font-color-main">
    <div class="track" v-if="type === 'song'">
      <div class="cover" v-if="track.picUrl">
        <img :src="track.picUrl + '?param=100y100'" />
      </div>
      <div class="cover placeholder" v-else></div>
      <div class="info">
        <div class="track-name" :title="track.name">
          {{ track.name }}
        </div>
        <div
          class="track-album"
          :title="track.al.name"
          @click="openAlbum(track.al.id)"
        >
          {{ $t("songs_table.album") }}:&nbsp;{{ track.al.name }}
        </div>
        <div class="track-artist">
          {{ $t("song_info.artist") }}:&nbsp;<span
            v-for="(artist, index) in track.ar"
            :title="artist.name"
            @click="openArtist(artist.id)"
          >
            {{ artist.name }}
            <span v-if="index !== track.ar.length - 1">&nbsp;/&nbsp;</span>
          </span>
        </div>
      </div>
    </div>
    <div
      class="track"
      v-else-if="(type === 'album' || type === 'playlist') && info"
    >
      <div class="cover" v-if="info?.cover">
        <img :src="info?.cover" />
      </div>
      <div class="cover placeholder" v-else></div>
      <div class="info">
        <div class="track-name" :title="info?.name + info?.transName">
          {{ info?.name }}
          <span class="font-color-standard" v-if="info?.transName">
            {{ info?.transName }}
          </span>
        </div>
        <div class="track-artist" v-if="info?.artists.length > 0">
          {{ $t("song_info.artist") }}:&nbsp;
          <span v-for="(artist, index) in info?.artists">
            <span
              class="name"
              :title="artist.name"
              @click="openArtist(artist.id)"
            >
              {{ artist.name }}
            </span>
            <span v-if="index !== info?.artists.length - 1">&nbsp;/&nbsp;</span>
          </span>
        </div>
        <div class="track-artist" v-else-if="info?.creatorId">
          {{ $t("playlist_list.creator") }}:&nbsp;
          <span
            class="name"
            :title="info?.creatorName"
            @click="openUser(info?.creatorId)"
          >
            {{ info?.creatorName }}
          </span>
        </div>
      </div>
    </div>

    <YComment :type="type" :id="id" />
  </div>
</template>

<script src="./YCommentView.ts" lang="ts"></script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  text-align: left;
  overflow: hidden;
  padding: 20px;

  .track {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 20px;

    .cover {
      width: 100px;
      height: 100px;
      margin-right: 10px;

      img {
        width: 100px;
        height: 100px;
        border-radius: 10px;
      }
    }

    .placeholder {
      background-color: rgba(var(--foreground-color-rgb), 0.3);
      border-radius: 10px;
    }

    .info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      .track-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .track-album,
      .track-artist {
        font-size: 14px;
        margin-bottom: 5px;
        color: var(--font-color-standard);
        overflow: hidden;
        text-overflow: ellipsis;

        .name {
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>
