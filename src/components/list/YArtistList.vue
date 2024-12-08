<template>
  <!-- 歌手列表 -->
  <div class="artists-list">
    <div class="artists-item" v-for="artist in artists">
      <!-- 歌手信息 -->
      <div
        class="artists-info"
        @click="openUserPage(type === 'artist' ? artist.id : artist.userId)"
        :title="artist.name ?? artist.nickname"
      >
        <!-- 头像 -->
        <img :src="artist._picUrl" class="artists-avatar" />
        <!-- 歌手名 -->
        <div class="artists-name-text font-color-high">
          {{ type === "artist" ? artist.name : artist.nickname }}
        </div>
      </div>
      <!-- 专辑数/粉丝数 -->
      <div
        class="artists-track-count font-size-small font-color-standard"
        :title="
          type === 'artist'
            ? artist.albumSize.toString()
            : artist.followeds.toString()
        "
      >
        <span>{{
          type === "artist"
            ? $t("album") + ": " + artist.albumSize
            : $t("fans") + ": " + artist.followeds
        }}</span>
      </div>
    </div>
  </div>
</template>

<script src="./YArtistList.ts" lang="ts"></script>

<style lang="scss" scoped>
.artists-list {
  display: flex;
  flex-wrap: wrap;

  .artists-item {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 20px;
    padding: 10px;
    max-width: 210px;
    min-width: 180px;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background-color: rgba(var(--foreground-color-rgb), 0.05);
    }

    .artists-info {
      max-width: 100%;

      .artists-avatar {
        width: 130px;
        height: 130px;
        object-fit: cover;
        border-radius: 50%;
        margin-bottom: 10px;
        overflow: hidden;
      }

      .artists-name-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .artists-track-count {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
