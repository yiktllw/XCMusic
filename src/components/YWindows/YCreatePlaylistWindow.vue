<template>
  <!-- 创建新的歌单窗口 -->
  <div>
    <YWindow ref="window" @new-window-state="handleNewWindowState">
      <template #header>
        <span class="window-title">
          {{ $t("create_playlist.title") }}
        </span>
      </template>
      <div class="main">
        <textarea
          class="input font-size-large"
          v-model="inputValue"
          :maxlength="40"
          :placeholder="$t('create_playlist.input_playlist_name')"
          rows="3"
        ></textarea>
        <div class="check">
          <input type="checkbox" v-model="isPrivate" />
          <label @click="switchPrivate">
            {{ $t("create_playlist.private") }}
          </label>
        </div>
        <button
          :tabindex="-1"
          class="create font-size-large"
          @click="createPlaylist"
        >
          {{ $t("create_playlist.create") }}
        </button>
      </div>
    </YWindow>
  </div>
</template>

<script src="./YCreatePlaylistWindow.ts" lang="ts">
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 10px 10px 10px;
  width: 321px;

  .input {
    padding: 5px 10px;
    resize: none;
    width: calc(100% - 20px);
  }

  .check {
    display: flex;
    align-items: center;
    width: 100%;
    // gap: 5px;

    input {
      cursor: pointer;
    }

    label {
      cursor: pointer;
      color: var(--font-color-high);
    }
  }

  .create {
    width: fit-content;
    border-radius: 20px;
    padding: 5px 20px 8px 20px;
    background-color: rgb(var(--highlight-color-rgb));
    color: #fff;
    border: none;
    cursor: pointer;
  }
}
</style>
