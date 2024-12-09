<template>
  <!-- 添加到歌单窗口 -->
  <div class="add-to-playlist">
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("add_to_playlist") }}
        </span>
      </template>
      <YScroll>
        <div class="playlists" style="max-height: 432.1px">
          <div
            class="playlist"
            v-for="playlist in login.userPlaylists"
            @click="addToPlaylist(playlist.id)"
          >
            <img class="img" :src="playlist.img + '?param=100y100'" />
            <div class="playlist-name font-color-high font-size-std">
              {{ playlist.name }}
            </div>
          </div>
        </div>
      </YScroll>
    </YWindow>
  </div>
</template>

<script src="./YAddToPlaylist.ts" lang="ts"></script>

<style lang="scss" scoped>
.add-to-playlist {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 432.1px;
}

.playlists {
  display: flex;
  flex-direction: column;
  width: calc(100% - 20px);
  padding: 10px 10px;

  .playlist {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 11px 15px 11px 15px;
    border-radius: 10px;
    background-color: var(--panel-background-color);
    cursor: pointer;

    .img {
      width: 50px;
      height: 50px;
      border-radius: 6px;
    }

    .playlist-name {
      margin-left: 10px;
      font-weight: bold;
    }

    &:hover {
      background-color: rgba(var(--foreground-color-rgb), 0.1);
    }
  }
}
</style>
