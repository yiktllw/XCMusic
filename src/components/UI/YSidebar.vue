<template>
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

<script lang="ts">
import { Message } from "@/dual/YMessageC";
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import YScroll from "@/components/base/YScroll.vue";
import { IPlaylistCtxData } from "@/dual/YContextMenuItemC";
import { IPlaylist } from "@/utils/login";
import { TSideBarItems } from "@/utils/setting";

export default defineComponent({
  name: "YSidebar",
  data() {
    return {
      buttonTextColor: "#ccc", // 统一设置按钮的文字颜色
      showMyPlaylist: true,
      showMySubscribedPlaylist: true,
      sidebarWidth: 200,
      newWidth: 0,
      activeButtonId: 0,
      userSubscribes: [] as IPlaylist[],
      userPlaylists: [] as IPlaylist[],
      hideInSidebar: [] as TSideBarItems[],
    };
  },
  props: {
    opened_playlist: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    const sidebar_component = ref<HTMLElement | null>(null);
    const store = useStore();

    return {
      sidebar_component,
      globalMsg: store.state.globalMsg,
      login: store.state.login,
      setting: store.state.setting,
      OpenedPlaylist: store.state.openedPlaylist,
    };
  },
  components: {
    YScroll,
  },
  methods: {
    handleButtonClick(buttonId: number | string) {
      const url = `/playlist/${buttonId}`;
      this.$router.push(url);
      console.log(`Button with ID ${buttonId} clicked`);
    },
    initResize() {
      window.addEventListener("mousemove", this.resize);
      window.addEventListener("mouseup", this.stopResize);
    },
    resize(e: MouseEvent) {
      const sidebar = this.sidebar_component;
      let newWidth = e.clientX;
      if (newWidth > 220 && newWidth < 260 && sidebar) {
        this.newWidth = newWidth;
        sidebar.style.width = `${this.newWidth}px`;
      }
    },
    stopResize() {
      this.setting.display.sidebarWidth = this.newWidth;
      window.removeEventListener("mousemove", this.resize);
      window.removeEventListener("mouseup", this.stopResize);
    },
    createPlaylist() {
      if (!this.login.status) {
        Message.post("error", this.$t("need_login"));
        return;
      }
      this.globalMsg.post("create-playlist");
    },
    openCtxMenu(
      event: MouseEvent,
      id: number,
      from: "created-playlists" | "subscribed-playlists"
    ) {
      event.preventDefault();
      const playlist =
        from === "created-playlists"
          ? this.userPlaylists.find((item) => item.id === id)
          : this.userSubscribes.find((item) => item.id === id);
      if (!playlist) return;
      const data: IPlaylistCtxData = {
        id: id,
        playlist: playlist,
        x: event.clientX,
        y: event.clientY,
        from: from,
      };
      this.globalMsg.post("open-ctx-menu-playlist", data);
    },
  },
  mounted() {
    this.sidebarWidth = this.setting.display.sidebarWidth;
    this.userPlaylists = this.login.userPlaylists;
    this.userSubscribes = this.login.userSubscribes;
    this.login.subscriber.on({
      id: "YSidebar",
      type: "userPlaylists",
      func: () => {
        this.userPlaylists = this.login.userPlaylists;
        this.userSubscribes = this.login.userSubscribes;
      },
    });
    this.OpenedPlaylist.subscriber.on({
      id: "YSidebar",
      type: "id",
      func: () => {
        this.activeButtonId = this.OpenedPlaylist.id;
      },
    });
    this.globalMsg.subscriber.on({
      id: "YSidebar",
      type: "refresh-sidebar",
      func: () => {
        this.hideInSidebar = this.setting.display.hideInSidebar;
      },
    });
  },
  beforeUnmount() {
    this.login.subscriber.offAll("YSidebar");
    this.OpenedPlaylist.subscriber.offAll("YSidebar");
    this.sidebar_component = null;
  },
});
</script>

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
