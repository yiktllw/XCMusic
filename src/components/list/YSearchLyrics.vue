<template>
  <!-- 按歌词搜索的结果 -->
  <YSongsTable
    :resortable="false"
    stickyTop="50px"
    :canSendPlaylist="false"
    :showTrackCover="true"
    v-model="listWithLyrics"
    :showLyrics="true"
    ref="songs_table"
    :id="'YSearchLyrics.vue'"
  />
</template>

<script src="./YSearchLyrics.ts" lang="ts"></script>

<style lang="scss" scoped>
.list-container {
  display: flex;
}
</style>
