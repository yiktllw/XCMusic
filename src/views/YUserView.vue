<template>
  <!-- 用户/歌手界面 -->
  <div class="container font-color-main" v-if="user">
    <!-- 用户信息 -->
    <div class="user-info">
      <!-- 头像 -->
      <div class="avatar">
        <img class="avatar-img" :src="user.picUrl" v-if="user.picUrl" />
        <!-- 如果没有头像，显示默认头像 -->
        <div
          class="avatar-img"
          style="background-color: #333"
          v-if="!user.picUrl"
        ></div>
      </div>
      <!-- 用户信息-文本 -->
      <div class="user-info-text">
        <!-- 用户名 -->
        <div class="user-name">
          {{ user.name }}
        </div>
        <!-- 用户等级 -->
        <div class="user-level font-color-high" v-if="type === 'user'">
          LV.{{ (user as IUser).level }}
        </div>
        <!-- 歌手翻译名 -->
        <div
          class="trans-name font-color-high"
          v-if="type === 'artist' && (user as IArtist).transName"
        >
          {{ (user as IArtist).transName }}
        </div>
        <!-- 歌手身份 -->
        <div
          class="artist-identity font-color-high"
          v-if="type === 'artist' && (user as IArtist).identity"
        >
          {{ (user as IArtist).identity }}
        </div>
        <!-- 关注/粉丝 -->
        <div class="user-follow font-color-high" v-if="type === 'user'">
          <div
            style="cursor: pointer"
            @click="openUserFollow(userId, 'follow')"
          >
            {{ $t("titlebar.follows") }}:
            {{ (user as IUser).follows }}
          </div>
          <div
            style="
              height: 100%;
              width: 1px;
              background-color: rgba(255, 255, 255, 0.1);
              margin: 0px 10px;
              border-radius: 1px;
            "
          ></div>
          <div
            style="cursor: pointer"
            @click="openUserFollow(userId, 'follower')"
          >
            {{ $t("titlebar.followers") }}:
            {{ (user as IUser).followeds }}
          </div>
        </div>
      </div>
    </div>
    <!-- 导航 -->
    <div class="switcher font-color-standard">
      <!-- 导航元素 -->
      <button
        :tabindex="-1"
        class="switcher-item font-color-standard"
        v-for="(item, index) in user.switcher"
        @click="handleSwitcher(item.position)"
      >
        <span
          style="font-size: 16px; color: var(--font-color-main)"
          :style="{
            'font-weight': item.position === user.position ? 'bold' : '500',
            color:
              item.position === user.position
                ? 'var(--font-color-main)'
                : 'var(--font-color-standard)',
          }"
        >
          {{ $t(item.display) }}
        </span>
        <!-- 选中效果 -->
        <div
          class="choosed"
          style="
            transform: translate(7px, 4px);
            width: calc(100% - 15px);
            height: 4px;
            border-radius: 2px;
          "
          v-if="item.position === user.position"
        ></div>
      </button>
      <!-- 右侧切换视图 -->
      <div
        v-if="showRightSwitcher"
        class="right-switcher"
        style="
          display: flex;
          flex: 1;
          justify-content: flex-end;
          margin-right: 30px;
        "
      >
        <img
          src="@/assets/biglist.svg"
          class="list-icon g-icon"
          @click="(user as IUser).listType = false"
          :style="{ opacity: (user as IUser).listType ? 0.6 : 1 }"
        />
        <img
          src="@/assets/smalllist.svg"
          class="list-icon g-icon"
          @click="(user as IUser).listType = true"
          :style="{ opacity: (user as IUser).listType ? 1 : 0.6 }"
        />
      </div>
    </div>
    <!-- 用户/歌手主界面 -->
    <div class="content">
      <!-- 用户主界面 -->
      <div class="content-user" v-if="type === 'user'">
        <!-- 歌单界面 -->
        <div class="playlist-list" v-if="(user as IUser).listType">
          <YPlaylistList
            :playlists="
              user.position === 'createdPlaylist'
                ? (user as IUser).userPlaylists
                : (user as IUser).userSubscribedPlaylists
            "
          />
        </div>
        <!-- 大歌单界面 -->
        <div class="playlist-biglist" v-else>
          <YPlaylistBiglist
            :playlists="
              user.position === 'createdPlaylist'
                ? (user as IUser).userPlaylists
                : (user as IUser).userSubscribedPlaylists
            "
          />
        </div>
      </div>
      <!-- 歌手界面 -->
      <div class="content-artist" v-else-if="type === 'artist'">
        <!-- 歌手作品 -->
        <div class="artist-works" v-if="user.position === 'song'">
          <!-- 歌曲列表 -->
          <YSongsTable
            :resortable="false"
            :canSendPlaylist="false"
            :showHeader="false"
            v-model="(user as IArtist).tracks"
            v-if="(user as IArtist).tracks"
            :id="'YUserView.vue'"
          />
          <YPage v-model="page" />
        </div>
        <!-- 加载中 -->
        <YLoading v-if="!(user as IArtist).tracks" />
        <!-- 歌单界面 -->
        <div
          class="playlist-list"
          v-if="(user as IUser).listType && user.position === 'album'"
        >
          <!-- 歌手专辑列表 -->
          <YPlaylistList type="album" :playlists="(user as IArtist).albums" />
        </div>
        <!-- 大歌单界面 -->
        <div
          class="playlist-biglist"
          v-if="!(user as IUser).listType && user.position === 'album'"
        >
          <YPlaylistBiglist
            type="album"
            :playlists="(user as IArtist).albums"
          />
        </div>
        <!-- 歌手简介 -->
        <div
          class="artist-intro font-color-high"
          v-if="(user as IArtist).intro && user.position === 'detail'"
        >
          <div v-for="item in (user as IArtist).intro">
            <!-- 标题 -->
            <div
              v-if="item.ti"
              style="
                font-size: 18px;
                font-weight: bold;
                margin: 15px 0px 10px 0px;
                color: var(--font-color-main);
              "
            >
              {{ item.ti }}
            </div>
            <!-- 文本 -->
            <div
              v-if="item.txt"
              style="font-size: 14px; margin: 10px 0px"
              v-html="item.txt"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./YUserView.ts" lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IArtist, IUser } from "@/dual/YUserView";
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  padding: 20px;

  .user-info {
    display: flex;
    margin-bottom: 10px;

    .avatar {
      margin-right: 20px;

      .avatar-img {
        width: 160px;
        height: 160px;
        border-radius: 50%;
      }
    }

    .user-info-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
    }

    .user-name {
      font-size: 20px;
      font-weight: bold;
      margin: 6px 0px;
    }

    .user-level {
      font-size: 11px;
      font-weight: bold;
      border-radius: 10px;
      border: 1px solid rgba(var(--foreground-color-rgb), 0.3);
      background-color: rgba(var(--foreground-color-rgb), 0.05);
      padding: 2px 6px;
      margin: 6px 0px;
    }

    .trans-name {
      font-size: 16px;
      font-weight: bold;
      margin: 6px 0px 6px 0px;
    }

    .artist-identity {
      margin: 6px 0px 20px 0px;
    }

    .user-follow {
      display: flex;
      flex-direction: row;
      margin: 6px 0px 30px 0px;
      font-size: 16px;
      font-weight: bold;
    }
  }

  .switcher {
    display: flex;
    font-size: 16px;
    align-items: center;
    padding-top: 10px;
    margin-left: 10px;
    padding-bottom: 20px;
    top: 0px;
    z-index: 1;
    width: 100%;
    backdrop-filter: blur(10px);

    .switcher-item {
      height: 20px;
      margin: 0 7px;
      background-color: transparent;
      border: none;
      cursor: pointer;

      .choosed {
        height: 2px;
        background-color: rgb(var(--highlight-color-rgb));
        transform: translateY(1px);
        transform: translateX(1px);
      }
    }

    .right-switcher {
      .list-icon {
        width: 20px;
        height: 20px;
        margin: 0px 10px;
        cursor: pointer;
      }
    }
  }

  .content {
    display: flex;

    .content-user {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .content-artist {
      display: flex;
      flex-direction: column;
      width: calc(100% - 20px);

      .artist-intro {
        margin: 0px 20px;
        text-align: left;
        line-height: 1.8em;
      }
    }
  }
}
</style>
