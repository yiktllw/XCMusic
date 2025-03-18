<template>
  <!-- 用户听歌排行界面 -->
  <YHeader :switcher="switcher" @new-position="handleNewPosition" />
  <YSongsTable
    :show-track-album="false"
    :show-track-popularity="false"
    :show-header="false"
    :show-listen-count="true"
    :local-play="true"
    :resortable="false"
    v-model="displayTracks"
    style="margin: 0px 20px 0px 10px"
    :id="'YUserSongRankView.vue'"
    v-if="!loading"
  />
  <YSongsTableSkeleton v-else style="margin-top: 20px" />
</template>

<script src="./YUserSongsRankView.ts" lang="ts"></script>
