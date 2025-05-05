<template>
  <!--  主界面  -->
  <div
    class="mainContainer"
    id="mainContainer"
    :style="{
      fontFamily: fonts.join(', '),
    }"
  >
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
      <YEqualizerWindow
        v-if="showEqualizerWindow"
        @new-window-state="handleNewWindowState_equalizerWindow"
      />
      <YFontsSelectWindow
        :title="fontsSelectWindowTitle"
        :selected-fonts="defaultSelectedFonts"
        @ensure="handleFontsSelectWindowEnsure"
        v-if="showFontsSelectWindow"
        @new-window-state="handleNewWindowState_fontsSelectWindow"
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
  <div
    class="play-ui"
    :style="{
      fontFamily: fonts.join(', '),
    }"
    :class="showPlayUI ? 'top' : 'bottom'"
  >
    <YPlayUI
      ref="playUI"
      @close-panel="showPlayUI = false"
      @show-panel="showPlayUI = true"
    />
  </div>
</template>

<script src="./HomeView.ts" lang="ts"></script>

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
