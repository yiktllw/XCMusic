<template>
  <!-- 主容器 -->
  <div class="mainContainer" id="mainContainer">
    <div class="align-up">
      <div class="align-left">
        <!-- 侧边栏 -->
        <div class="leftSidebar">
          <YSidebar :opened_playlist="opened_playlist" ref="YSidebar_ref" />
        </div>
      </div>
      <div class="align-right" id="align_right">
        <!-- 内容 -->
        <div class="mainContent">
          <!-- 标题栏 -->
          <YTitlebar />
          <!-- 显示区域 -->
          <div class="content">
            <YDisplayArea class="display-area" ref="YDisplayArea_ref" />
          </div>
        </div>
      </div>
    </div>
    <div class="align-down">
      <!-- 播放栏 -->
      <div class="playbar">
        <YPlaybar @open-panel="playUI?.showPanel()" />
      </div>
    </div>
    <div class="context-menu">
      <YContextMenu
        :items="menu"
        :target="target"
        :posX="posX"
        :posY="posY"
        :direction="direction"
        ref="contextMenu"
        @menu-click="handleMenuClick"
      />
    </div>
    <div
      class="prevent-action-container"
      ref="prevent_container"
      v-if="showPreventContainer"
    >
      <YAddToPlaylist
        :ids="trackIds"
        @new-window-state="handleNewWindowState"
        v-if="showAddToPlaylist"
      />
      <YSongInfo
        :track="trackOfInfo!"
        @new-window-state="handleNewWindowState_songInfo"
        v-if="showSongInfo"
      />
      <YLoginWindow
        :base64-image="base64Image"
        v-if="showLoginWindow"
        @new-window-state="handleNewWindowState_loginWindow"
      />
      <YCreatePlaylist
        v-if="showCreatePlaylist"
        @new-window-state="handleNewWindowState_createPlaylist"
      />
      <YCustomWindow
        v-if="showCustomWindow"
        @new-window-state="handleNewWindowState_customWindow"
      />
      <YCloseWindow
        v-if="showCloseWindow"
        @new-window-state="handleNewWindowState_closeWindow"
      />
      <YConfirmWindow
        :confirm="confirm"
        v-if="showConfirmWindow"
        @new-window-state="handleNewWindowState_confirmWindow"
      />
      <YEditPlaylistWindow
        :playlist="playlist_to_edit!"
        v-if="showEditPlaylistWindow"
        @new-window-state="handleNewWindowState_editPlaylistWindow"
      />
    </div>
    <div class="message-container">
      <div></div>
      <div class="msg">
        <YMessage
          :message="msg.message"
          :key="msgKey"
          :type="msg.type"
          v-if="msg.type !== 'none'"
        />
      </div>
    </div>
  </div>
  <div class="play-ui" :class="showPlayUI ? 'top' : 'bottom'">
    <YPlayUI
      ref="playUI"
      @close-panel="showPlayUI = false"
      @show-panel="showPlayUI = true"
    />
  </div>
</template>

<script lang="ts">
import YDisplayArea from "@/components/UI/YDisplayArea.vue";
import YSidebar from "@/components/UI/YSidebar.vue";
import YTitlebar from "@/components/UI/YTitlebar.vue";
import YPlaybar from "@/components/UI/YPlaybar.vue";
import YContextMenu from "@/components/base/YContextMenu.vue";
import YMessage from "@/components/base/YMessage.vue";
import YPlayUI from "@/components/UI/YPlayUI.vue";
import YAddToPlaylist from "@/components/YWindows/YAddToPlaylist.vue";
import YSongInfo from "@/components/YWindows/YSongInfo.vue";
import YCreatePlaylist from "@/components/YWindows/YCreatePlaylistWindow.vue";
import YLoginWindow from "@/components/YWindows/YLoginWindow.vue";
import YConfirmWindow from "@/components/YWindows/YConfirmWindow.vue";
import YCustomWindow from "@/components/YWindows/YCustomWindow.vue";
import YCloseWindow from "@/components/YWindows/YCloseWindow.vue";
import YEditPlaylistWindow from "@/components/YWindows/YEditPlaylistWindow.vue";
import { useStore } from "vuex";
import { defineComponent, ref } from "vue";
import { Message } from "@/dual/YMessageC";
import {
  IPlaylistCtxData,
  songItems,
  playlistItems,
  IMenuClick,
} from "@/dual/YContextMenuItemC";
import { Comment, Playlist, useApi } from "@/utils/api";
import { isLocal } from "@/utils/localTracks_renderer";
import { IConfirm } from "@/utils/globalMsg";
import { ITrack } from "@/utils/tracks";
import { IPlaylist } from "@/utils/login";
import { getStorage } from "@/utils/render_storage";

export default defineComponent({
  name: "App",
  data() {
    return {
      // 打开的播放列表
      opened_playlist: 0,
      menu: songItems,
      target: null as any,
      posX: "0px",
      posY: "0px",
      direction: 4,
      showPreventContainer: false,
      showAddToPlaylist: false,
      trackIds: [] as number[],
      trackOfInfo: null as ITrack | null,
      showSongInfo: false,
      showLoginWindow: false,
      base64Image: "",
      showCreatePlaylist: false,
      showCustomWindow: false,
      showCloseWindow: false,
      confirm: null as unknown as IConfirm,
      showConfirmWindow: false,
      showEditPlaylistWindow: false,
      playlist_to_edit: null as IPlaylist | null,
      msg: {
        type: "none",
        message: "",
      },
      msgKey: 0,
      showPlayUI: false,
    };
  },
  components: {
    YSidebar,
    YTitlebar,
    YDisplayArea,
    YPlaybar,
    YContextMenu,
    YAddToPlaylist,
    YSongInfo,
    YMessage,
    YPlayUI,
    YLoginWindow,
    YCreatePlaylist,
    YCustomWindow,
    YCloseWindow,
    YConfirmWindow,
    YEditPlaylistWindow,
  },
  computed: {},
  setup() {
    const store = useStore();
    const contextMenu = ref<typeof YContextMenu | null>(null);
    const playUI = ref<typeof YPlayUI | null>(null);
    const YSidebar_ref = ref<typeof YSidebar | null>(null);
    const YDisplayArea_ref = ref<typeof YDisplayArea | null>(null);
    const prevent_container = ref<HTMLElement | null>(null);

    return {
      player: store.state.player,
      setting: store.state.setting,
      login: store.state.login,
      download: store.state.download,
      contextMenu,
      playUI,
      YSidebar_ref,
      YDisplayArea_ref,
      prevent_container,
      globalMsg: store.state.globalMsg,
    };
  },
  mounted() {
    window.addEventListener("message", this.handleMessage);
    this.player.quality = this.setting.play.quality as
      | "jymaster"
      | "sky"
      | "jyeffect"
      | "hires"
      | "lossless"
      | "exhigh"
      | "standard"
      | "higher";
    this.globalMsg.subscriber.on({
      id: "HomeView",
      type: "create-playlist",
      func: () => {
        this.showCreatePlaylist = true;
        this.showPreventContainer = true;
      },
    });
    this.globalMsg.subscriber.on({
      id: "HomeView",
      type: "open-login-window",
      func: (data: string) => {
        this.showLoginWindow = true;
        this.showPreventContainer = true;
        this.base64Image = data;
      },
    });
    this.globalMsg.subscriber.on({
      id: "HomeView",
      type: "close-login-window",
      func: () => {
        this.showLoginWindow = false;
        this.showPreventContainer = false;
      },
    });
    this.globalMsg.subscriber.on({
      id: "HomeView",
      type: "open-custom-window",
      func: () => {
        this.showCustomWindow = true;
        this.showPreventContainer = true;
      },
    });
    this.globalMsg.subscriber.on({
      id: "HomeView",
      type: "open-close-window",
      func: () => {
        this.showCloseWindow = true;
        this.showPreventContainer = true;
      },
    });
    this.globalMsg.subscriber.on({
      id: "HomeView",
      type: "open-ctx-menu-playlist",
      func: (data: IPlaylistCtxData) => {
        this.contextMenu?.showContextMenu();
        this.menu = playlistItems;
        this.target = data;
        this.posX = data.x + 5 + "px";
        this.posY = data.y + 5 + "px";
        let menuWidth = 198 + 5;
        let menuHeight = 35 * this.menu.length + 5;
        this.setDirection(data.x, data.y, menuWidth, menuHeight);
        console.log(JSON.stringify(data, null, 4));
        switch (data.from) {
          case "created-playlists":
            this.menu[3].display = true;
            this.menu[3].showSeparator = true;
            this.menu[4].display = true;
            break;
          case "subscribed-playlists":
            this.menu[3].display = false;
            this.menu[3].showSeparator = false;
            this.menu[4].display = false;
            break;
          case "searched-playlists":
            this.menu[3].display = false;
            this.menu[3].showSeparator = false;
            this.menu[4].display = false;
            break;
        }
      },
    });
    this.globalMsg.subscriber.on({
      id: "HomeView",
      type: "confirm",
      func: (args: IConfirm) => {
        this.confirm = args;
        this.showConfirmWindow = true;
        this.showPreventContainer = true;
      },
    });
  },
  beforeUnmount() {
    this.globalMsg.subscriber.offAll("HomeView");
    window.removeEventListener("message", this.handleMessage);
    this.contextMenu = null;
    this.playUI = null;
    this.YSidebar_ref = null;
    this.YDisplayArea_ref = null;
    this.prevent_container = null;
  },
  watch: {
    showPreventContainer(val) {
      if (val) {
        const useGpu = getStorage("setting.system.disableGpuAcceleration");
        if (useGpu) {
          this.$nextTick(() => {
            this.prevent_container!.style.backdropFilter = "none";
          });
        }
      }
    },
  },
  methods: {
    async handleMessage(event: MessageEvent) {
      if (
        event.data.type === "song-open-context-menu" ||
        event.data.type === "song-toogle-context-menu"
      ) {
        // 显示还是切换右键菜单
        if (event.data.type === "song-toogle-context-menu") {
          this.contextMenu?.toogleContextMenu();
        } else {
          this.contextMenu?.showContextMenu();
        }

        let data = event.data.data;
        this.menu = songItems;

        if (data.from && data.from !== -1) {
          // 是否来自于用户的歌单，如果是，则显示删除选项
          this.menu[this.menu.length - 1].display = true;
          // console.log("from:", data.from, this.menu);
        } else {
          // 否则不显示删除选项
          this.menu[this.menu.length - 1].display = false;
        }

        this.target = JSON.parse(data.track);
        this.target.from = data.from;

        this.posX = data.x + 5 + "px";
        this.posY = data.y + 5 + "px";

        let menuWidth = 198 + 5;
        let menuHeight = 35 * this.menu.length + 5;

        this.setDirection(data.x, data.y, menuWidth, menuHeight);
        console.log({
          x: data.x,
          y: data.y,
          track: JSON.parse(data.track),
        });

        let commentCount = await this.getCommentCount(this.target.id);
        this.menu[4].label =
          this.$t("context.view_comment") + `(${commentCount})`;
      } else if (event.data.type === "song-open-add-to-playlist") {
        this.trackIds = event.data.data.ids.filter((id: number | string) => {
          return !isLocal(id);
        });
        console.log("ids: ", JSON.stringify(this.trackIds, null, 4));

        if (this.trackIds.length === 0) return;

        this.showAddToPlaylist = true;
        this.showPreventContainer = true;
      } else if (event.data.type === "message-show") {
        this.msg = event.data.data;
        this.msgKey++;
      } else if (event.data.type === "open-info-panel") {
        if (event.data.data) {
          this.trackOfInfo = JSON.parse(event.data.data);
          this.showSongInfo = true;
          this.showPreventContainer = true;
        }
      } else if (event.data.type === "subscribe-now-playing") {
        if (!this.player.currentTrack) {
          return;
        }
        this.trackIds = [this.player.currentTrack.id];
        this.showAddToPlaylist = true;
        this.showPreventContainer = true;
      }
    },
    async getCommentCount(id: number | string) {
      if (isLocal(id)) {
        return "0";
      }
      let result = "0";
      if (!id) {
        return result;
      }
      await Comment.Song.info(id as number)
        .then((res) => {
          if (!res) return;
          let count = res.total;
          if (count < 1000) {
            result = `${count}`;
          } else if (count >= 1000 && count < 10000) {
            let num = Math.floor(count / 1000);
            result = `${num}k+`;
          } else if (count >= 10000 && count < 100000) {
            let num = Math.floor(count / 10000);
            result = `${num}w+`;
          } else if (count > 100000) {
            let num = Math.floor(count / 100000);
            result = `${num}0w+`;
          }
        })
        .catch((err) => {
          console.error("Error when get comment count:", err);
        });
      return result;
    },
    setDirection(x: number, y: number, menuWidth: number, menuHeight: number) {
      if (x + menuWidth > window.innerWidth) {
        if (y + menuHeight > window.innerHeight) {
          this.direction = 2;
        } else {
          this.direction = 3;
        }
      } else {
        if (y + menuHeight > window.innerHeight) {
          this.direction = 1;
        } else {
          this.direction = 4;
        }
      }
    },
    handleMenuClick(arg: IMenuClick) {
      switch (arg.role) {
        case "song-play":
          this.player.playTrack(arg.target);
          break;
        case "song-addtoplaylist":
          this.player.nextPlay(arg.target);
          Message.post(
            "success",
            this.$t("message.homeview.add_to_playlist_success")
          );
          break;
        case "song-comment":
          if (!isLocal(arg.target.id)) {
            this.$router.push(`/comment/song/${arg.target.id}`);
          }
          break;
        case "song-delete":
          if (!isLocal(arg.target.id)) {
            this.deleteFromPlaylist(arg.target.id, arg.from);
          }
          break;
        case "song-copylink":
          if (!isLocal(arg.target.id)) {
            navigator.clipboard
              .writeText(`https://music.163.com/song?id=${arg.target.id}`)
              .then(() => {
                Message.post(
                  "success",
                  this.$t("message.homeview.linkCopied") +
                    `: https://music.163.com/song?id=${arg.target.id}`
                );
              })
              .catch((error) => {
                Message.post(
                  "error",
                  `${this.$t("message.homeview.errorToCopyLink")}: ${error}`
                );
              });
          }
          break;
        case "song-subscribe":
          if (!isLocal(arg.target.id)) {
            this.trackIds = [arg.target.id];
            this.showAddToPlaylist = true;
            this.showPreventContainer = true;
          }
          break;
        case "song-infomation":
          this.trackOfInfo = arg.target;
          this.showSongInfo = true;
          this.showPreventContainer = true;
          break;
        case "playlist-play":
          Message.post("info", "message.getting_playlist_tracks", true);
          Playlist.getAllTracks(
            arg.target.id,
            arg.target.playlist.trackCount
          ).then((res) => {
            this.player.playAll(res);
            this.player.playlistId = arg.target.id;
            Message.post(
              "success",
              "message.playlist_view.added_to_playlist",
              true
            );
          });
        case "playlist-addtoplaylist":
          Message.post("info", "message.getting_playlist_tracks", true);
          Playlist.getAllTracks(
            arg.target.id,
            arg.target.playlist.trackCount
          ).then((res) => {
            this.player.addPlaylist(res);
            this.player.playlistId = arg.target.id;
            Message.post(
              "success",
              "message.playlist_view.added_to_playlist",
              true
            );
          });
          break;
        case "playlist-download":
          Message.post("info", "message.getting_playlist_tracks", true);
          Playlist.getAllTracks(
            arg.target.id,
            arg.target.playlist.trackCount
          ).then((res) => {
            this.download.addList(res);
            Message.post(
              "success",
              this.$t("playlist_view.list_added_to_download")
            );
          });
          break;
        case "playlist-edit":
          const _playlist: IPlaylist = arg.target.playlist;
          this.playlist_to_edit = _playlist;
          this.showEditPlaylistWindow = true;
          this.showPreventContainer = true;
          break;
        case "playlist-delete":
          const confirm: IConfirm = {
            content: this.$t("confirm.delete"),
            needTranslate: false,
            callback: () => {
              Playlist.Delete(arg.target.id).then((res) => {
                this.login.refreshUserPlaylists();
                console.log("Delete playlist:", JSON.stringify(res, null, 4));
              });
            },
          };
          this.globalMsg.confirm(confirm);
          break;
        default:
          break;
      }
    },
    async deleteFromPlaylist(
      trackId: string | number,
      playlistId: string | number
    ) {
      if (playlistId === -1) {
        return;
      }
      await Playlist.removeTracks(playlistId as number, [trackId as number])
        .then((res) => {
          console.log(
            "Track deleted from playlist:",
            JSON.stringify(res, null, 4)
          );
          if (res.status === 200) {
            Message.post("success", this.$t("message.homeview.delete_success"));
            this.globalMsg.post("refresh-playlist", playlistId);
          } else {
            Message.post(
              "error",
              this.$t("message.homeview.delete_fail") +
                `: ${res.message ?? res.status ?? this.$t("message.homeview.unknown_reason")}`
            );
          }
        })
        .catch((error) => {
          Message.post(
            "error",
            this.$t("message.homeview.delete_fail") + `: ${error}`
          );
        });
    },
    handleNewWindowState(val: boolean) {
      if (val === false) {
        this.showAddToPlaylist = false;
        this.showPreventContainer = false;
      }
    },
    handleNewWindowState_songInfo(val: boolean) {
      if (val === false) {
        this.showSongInfo = false;
        this.showPreventContainer = false;
      }
    },
    handleNewWindowState_loginWindow(val: boolean) {
      if (val === false) {
        this.showLoginWindow = false;
        this.showPreventContainer = false;
        this.globalMsg.post("close-login-window-from-homeview");
      }
    },
    handleNewWindowState_createPlaylist(val: boolean) {
      if (val === false) {
        this.showCreatePlaylist = false;
        this.showPreventContainer = false;
      }
    },
    handleNewWindowState_customWindow(val: boolean) {
      if (val === false) {
        this.showCustomWindow = false;
        this.showPreventContainer = false;
      }
    },
    handleNewWindowState_closeWindow(val: boolean) {
      if (val === false) {
        this.showCloseWindow = false;
        this.showPreventContainer = false;
      }
    },
    handleNewWindowState_confirmWindow(val: boolean) {
      if (val === false) {
        this.showConfirmWindow = false;
        this.showPreventContainer = false;
      }
    },
    handleNewWindowState_editPlaylistWindow(val: boolean) {
      if (val === false) {
        this.showEditPlaylistWindow = false;
        this.showPreventContainer = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.mainContainer {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  position: absolute;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--background-color);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  user-select: none;

  .align-up {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    height: calc(100% - 85px);
    width: 100%;

    .align-left {
      display: flex;

      .leftSidebar {
        display: flex;
        background-color: rgba(var(--foreground-color-rgb), 0.03);
        position: relative;
      }
    }

    .align-right {
      display: flex;
      left: 0;
      flex: 1;
      height: 100vh;
      right: 0;
      margin-right: 5px;
      overflow: hidden;

      .mainContent {
        flex: 1;
        flex-direction: column;
        width: 100%;
        z-index: 0;

        .content {
          height: calc(100vh - 142px);
          background-color: transparent;
          width: 100%;

          .display-area {
            background-color: transparent;
            width: 100%;
          }
        }
      }
    }
  }

  .align-down {
    display: flex;
    z-index: 10;
    height: 85px;

    .playbar {
      background-color: var(--panel-background-color);
      border-top: 1px solid rgba(var(--foreground-color-rgb), 0.1);
      position: relative;
      height: 100%;
      width: 100%;
      padding: 0;
      margin: 0;
    }
  }

  .context-menu {
    z-index: 1000;
  }

  .prevent-action-container {
    top: 0;
    left: 0;
    position: absolute;
    width: 100vw;
    height: 100vh;
    display: flex;
    background-color: transparent;
    backdrop-filter: blur(5px);
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .message-container {
    top: 80px;
    width: calc(100vw - 20px);
    height: 0px;
    position: absolute;
    display: flex;
    background-color: transparent;
    justify-content: space-between;
    z-index: 1000;

    .msg {
      position: relative;
      align-items: end;
      justify-content: end;
    }
  }
}

.play-ui {
  position: absolute;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
}

.top {
  z-index: 500;
}

.bottom {
  z-index: -1;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 2rem;
  color: var(--font-color-main);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
