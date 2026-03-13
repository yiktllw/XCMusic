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
            :class="{ active: selectedPlaylistIds.includes(playlist.id) }"
            @click="togglePlaylist(playlist.id)"
          >
            <div class="left">
              <img class="img" :src="playlist.img + '?param=100y100'" />
              <div class="playlist-name font-color-high font-size-std">
                {{ playlist.name }}
              </div>
            </div>
            <div class="check-mark right">
              {{ selectedPlaylistIds.includes(playlist.id) ? "✓" : "" }}
            </div>
          </div>
        </div>
      </YScroll>
      <div class="buttons">
        <button :tabindex="-1" @click="cancel">
          {{ $t("cancel") }}
        </button>
        <button
          :tabindex="-1"
          :disabled="selectedPlaylistIds.length === 0"
          @click="addToSelectedPlaylists"
        >
          {{ $t("confirm.title") }} ({{ selectedPlaylistIds.length }})
        </button>
      </div>
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
  padding: 10px 10px 0 10px;
  gap: 5px;

  .playlist {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 11px 15px 11px 15px;
    border-radius: 10px;
    background-color: var(--panel-background-color);
    cursor: pointer;

    .left {
      flex: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      .img {
        width: 50px;
        height: 50px;
        border-radius: 6px;
      }

      .playlist-name {
        margin-left: 10px;
        font-weight: bold;
      }
    }

    .check-mark {
      width: 20px;
      text-align: center;
      font-size: 16px;
      color: var(--font-color-main);
    }

    &:hover {
      background-color: rgba(var(--foreground-color-rgb), 0.1);
    }

    &.active {
      background-color: rgba(var(--foreground-color-rgb), 0.16);
    }
  }
}

.buttons {
  display: flex;
  width: calc(100% - 20px);
  padding: 10px;

  button {
    width: 50%;
    font-weight: bold;
    font-size: 15px;
    padding: 6px 0;
    border-radius: 0;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
