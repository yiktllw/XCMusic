<template>
  <!-- 侧边栏 -->
  <div
    class="sidebar y_sidebar_component"
    ref="sidebar_component"
    :style="{ width: `${sidebarWidth}px` }"
  >
    <div class="title">
      <img
        src="@/assets/logo.svg"
        style="
          width: 145px;
          margin-right: 10px;
          margin-left: 15px;
          margin-top: 10px;
          cursor: pointer;
          -webkit-user-drag: none;
        "
        @click="$router.push({ path: '/greeting' })"
      />
    </div>
    <YScroll class="yscroll">
      <button
        v-if="!hideInSidebar.includes('favorite')"
        :tabindex="-1"
        class="big-button font-color-standard"
        @click="$router.push({ path: `/playlist/${login.userFavoriteId}` })"
      >
        <img src="@/assets/like2.svg" class="g-icon big-button-icon" />
        <div class="big-button-text">
          {{ $t("playlist_view.my_favorite_musics") }}
        </div>
      </button>
      <button
        :tabindex="-1"
        v-if="!hideInSidebar.includes('album')"
        class="big-button font-color-standard"
        @click="$router.push({ path: '/subscribe/album' })"
      >
        <img src="@/assets/subscribe2.svg" class="g-icon big-button-icon" />
        <div class="big-button-text">
          {{ $t("subscribed_album") }}
        </div>
      </button>
      <button
        :tabindex="-1"
        v-if="!hideInSidebar.includes('local')"
        class="big-button font-color-standard"
        @click="$router.push({ path: '/local' })"
      >
        <img src="@/assets/local.svg" class="g-icon big-button-icon" />
        <div class="big-button-text">
          {{ $t("local_music") }}
        </div>
      </button>
      <button
        :tabindex="-1"
        v-if="!hideInSidebar.includes('download')"
        class="big-button font-color-standard"
        @click="$router.push({ path: '/download' })"
      >
        <img src="@/assets/download.svg" class="g-icon big-button-icon" />
        <div class="big-button-text">
          {{ $t("manage_download") }}
        </div>
      </button>
      <button
        :tabindex="-1"
        v-if="!hideInSidebar.includes('cloud')"
        class="big-button font-color-standard"
        @click="$router.push({ path: '/cloud' })"
      >
        <img src="@/assets/cloud.svg" class="g-icon big-button-icon" />
        <div class="big-button-text">
          {{ $t("cloud") }}
        </div>
      </button>
      <div v-if="hideInSidebar.length < 5" class="split-line"></div>
      <div class="created-playlist">
        <button
          :tabindex="-1"
          class="switch-user-playlist font-color-main"
          @click="showMyPlaylist = !showMyPlaylist"
        >
          <span style="margin-right: 5px">
            {{ $t("sidebar.created_playlist") }}
            ({{ userPlaylists.length }})
          </span>
          <div class="switch-user-playlist-icon-container">
            <!-- <transition name="rotate"> -->
            <img
              class="switch-user-playlist-icon g-icon"
              v-if="showMyPlaylist"
              src="@/assets/less.svg"
            />
            <!-- </transition> -->
            <!-- <transition name="rotate2"> -->
            <img
              class="switch-user-playlist-icon g-icon"
              v-if="!showMyPlaylist"
              src="@/assets/more.svg"
            />
            <!-- </transition> -->
          </div>
        </button>
        <img
          class="add-img g-icon"
          src="@/assets/add.svg"
          @click="createPlaylist"
        />
      </div>
      <!-- <transition name="slide-fade"> -->
      <div class="fade-container" v-if="showMyPlaylist">
        <button
          :tabindex="-1"
          class="playlist-button font-color-main"
          v-for="button in userPlaylists"
          @click="handleButtonClick(button.id)"
          :title="button.label"
          :class="{ activeButton: activeButtonId === button.id }"
          :disabled="activeButtonId === button.id"
          @contextmenu="openCtxMenu($event, button.id, 'created-playlists')"
        >
          <img
            :src="button.img + '?param=60y60'"
            class="button-icon"
            :id="button.img"
          />
          <div class="playlist-button-text">{{ button.label }}</div>
        </button>
      </div>
      <!-- </transition> -->
      <button
        :tabindex="-1"
        class="switch-user-playlist font-color-main"
        @click="showMySubscribedPlaylist = !showMySubscribedPlaylist"
      >
        <span style="margin-right: 5px">
          {{ $t("sidebar.subscribed_playlist") }}
          ({{ userSubscribes.length }})
        </span>
        <div class="switch-user-playlist-icon-container">
          <!-- <transition name="rotate"> -->
          <img
            class="switch-user-playlist-icon g-icon"
            v-if="showMySubscribedPlaylist"
            src="@/assets/less.svg"
          />
          <!-- </transition> -->
          <!-- <transition name="rotate2"> -->
          <img
            class="switch-user-playlist-icon g-icon"
            v-if="!showMySubscribedPlaylist"
            src="@/assets/more.svg"
          />
          <!-- </transition> -->
        </div>
      </button>
      <!-- <transition name="slide-fade"> -->
      <div class="fade-container" v-if="showMySubscribedPlaylist">
        <button
          :tabindex="-1"
          class="playlist-button font-color-main"
          v-for="button in userSubscribes"
          @click="handleButtonClick(button.id)"
          :title="button.label"
          :class="{ activeButton: activeButtonId === button.id }"
          :disabled="activeButtonId === button.id"
          @contextmenu="openCtxMenu($event, button.id, 'subscribed-playlists')"
        >
          <img
            :src="button.img + '?param=60y60'"
            class="button-icon"
            :id="button.img"
          />
          <div class="playlist-button-text">{{ button.label }}</div>
        </button>
      </div>
      <!-- </transition> -->
    </YScroll>
  </div>
  <div class="resizer" @mousedown="initResize"></div>
</template>

<script src="./YSidebar.ts" lang="ts"></script>

<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all 0.15s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-15px);
  opacity: 0;
}

.sidebar {
  display: flex;
  width: 200px;
  min-width: 180px;
  max-width: 260px;
  padding: 0px;
  height: 100%;
  flex-direction: column;

  .title {
    user-select: none;
    padding: 10px;
    text-align: left;
    margin-bottom: 10px;
    -webkit-user-drag: none;
  }

  .yscroll {
    display: flex;
    padding-left: 15pt;
    padding-right: 15pt;
    flex-direction: column;

    .big-button {
      display: flex;
      flex-direction: row;
      align-items: center;
      background-color: transparent;
      border: none;
      border-radius: 10px;
      padding: 8px 10px;
      width: 100%;

      &:hover {
        background-color: rgba(var(--foreground-color-rgb), 0.1);
        cursor: pointer;
        color: var(--font-color-main);

        .big-button-icon {
          opacity: 1;
        }
      }

      .big-button-icon {
        width: 20px;
        height: 20px;
        opacity: 0.7;
      }

      .big-button-text {
        font-size: 16px;
        margin-left: 8px;
      }
    }

    .split-line {
      min-height: 1px;
      width: calc(100% - 20px);
      background-color: rgba(var(--foreground-color-rgb), 0.1);
      margin: 5px 10px;
    }

    .created-playlist {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;

      .add-img {
        width: 12px;
        height: 12px;
        margin-right: 10px;
        opacity: 0.7;
        cursor: pointer;

        &:hover {
          opacity: 1;
        }
      }
    }

    .switch-user-playlist {
      display: inline-flex;
      align-items: center;
      background-color: transparent;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      padding: 6px 0px 6px 8px;
      //transition: all 0.3s ease;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      min-height: 40px;
      opacity: 0.6;

      &:hover {
        opacity: 1;
      }

      .switch-user-playlist-icon-container {
        width: 16px;
        height: 16px;
        overflow: hidden;

        .switch-user-playlist-icon {
          width: 16px;
          height: 16px;
        }
      }
    }

    .fade-container {
      display: inherit;
      flex-direction: inherit;

      .playlist-button {
        font-size: 12px;
        display: flex;
        text-align: left;
        align-items: center;
        background-color: transparent;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        padding: 6px 7px 6px 5px;
        margin: 3px 0px 3px 0px;
        -webkit-app-region: no-drag;
        user-select: none;
        white-space: normal;
        height: 40px;
        width: 100%;

        &:hover:not(.activeButton) {
          background-color: rgba(var(--foreground-color-rgb), 0.1);
        }

        .button-icon {
          margin-right: 8px;
          width: 30px;
          height: 30px;
          border-radius: 5px;
        }

        .playlist-button-text {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          line-clamp: 2;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }

      .activeButton {
        background-color: rgb(var(--highlight-color-rgb));
        color: #fff;
      }
    }
  }
}

.resizer {
  width: 5px;
  cursor: ew-resize;
  background-color: transparent;
}
</style>
