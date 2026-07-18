<template>
  <!-- 用户/歌手界面 -->
  <div class="container font-color-main">
    <!-- 用户信息 -->
    <div class="user-info" v-if="user">
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
    <div class="skel-user" v-else>
      <div class="skel-avatar"></div>
      <div class="skel-user-text">
        <div class="skel-line skel-line--long"></div>
        <div class="skel-line skel-line--medium"></div>
        <div class="skel-line skel-line--medium"></div>
      </div>
    </div>
    <!-- 导航 -->
    <div class="switcher font-color-standard" v-if="user">
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
      <!-- 右侧工具栏：筛选框 + 视图切换 -->
      <div
        class="right-toolbar"
        v-if="
          type === 'artist' &&
          (user.position === 'song' || user.position === 'album')
        "
      >
        <div class="input-wrapper">
          <input
            type="text"
            class="search-input font-color-main"
            :placeholder="$t('search_view.filter') + '...'"
            spellcheck="false"
            v-model="filterQuery"
          />
          <img src="@/assets/search.svg" class="img-search g-icon" />
          <img
            v-if="filterQuery !== ''"
            class="img-clear"
            src="@/assets/clear2.svg"
            @click="filterQuery = ''"
          />
        </div>
        <img
          v-if="showRightSwitcher"
          src="@/assets/biglist.svg"
          class="list-icon g-icon"
          @click="(user as IUser).listType = false"
          :style="{ opacity: (user as IUser).listType ? 0.6 : 1 }"
        />
        <img
          v-if="showRightSwitcher"
          src="@/assets/smalllist.svg"
          class="list-icon g-icon"
          @click="(user as IUser).listType = true"
          :style="{ opacity: (user as IUser).listType ? 1 : 0.6 }"
        />
      </div>
    </div>
    <!-- 用户/歌手主界面 -->
    <div class="content" v-if="user">
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
          <YPage v-model="page" v-show="(user as IArtist).tracks.length > 0" />
        </div>
        <!-- 加载中 -->
        <YSongsTableSkeleton
          style="margin-top: 10px"
          v-if="
            (user as IArtist).tracks.length === 0 && user.position === 'song'
          "
        />
        <!-- 专辑骨架屏（列表模式） -->
        <div
          class="skeleton-list"
          v-if="
            loadingAlbums &&
            (user as IUser).listType &&
            user.position === 'album'
          "
        >
          <div class="skeleton-row" v-for="i in 8" :key="'skl-' + i">
            <div class="skel-cover"></div>
            <div class="skel-text">
              <div class="skel-line skel-line--long"></div>
              <div class="skel-line skel-line--short"></div>
            </div>
            <div class="skel-line skel-line--col"></div>
            <div class="skel-line skel-line--col"></div>
            <div class="skel-line skel-line--col"></div>
          </div>
        </div>
        <!-- 歌单界面 -->
        <div
          class="playlist-list"
          v-if="
            !loadingAlbums &&
            (user as IUser).listType &&
            user.position === 'album'
          "
        >
          <!-- 歌手专辑列表 -->
          <YPlaylistList type="album" :playlists="(user as IArtist).albums" />
        </div>
        <!-- 专辑骨架屏（大图模式） -->
        <div
          class="skeleton-biglist"
          v-if="
            loadingAlbums &&
            !(user as IUser).listType &&
            user.position === 'album'
          "
        >
          <div class="skel-card" v-for="i in 8" :key="'skb-' + i">
            <div class="skel-cover skel-cover--big"></div>
            <div class="skel-line skel-line--full"></div>
            <div class="skel-line skel-line--short"></div>
          </div>
        </div>
        <!-- 大歌单界面 -->
        <div
          class="playlist-biglist"
          v-if="
            !loadingAlbums &&
            !(user as IUser).listType &&
            user.position === 'album'
          "
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

<script src="./YUserView.ts" lang="ts"></script>

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
    height: 30px;
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

    .right-toolbar {
      display: flex;
      align-items: center;
      margin-left: auto;
      margin-right: 10px;
      gap: 10px;

      .list-icon {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        opacity: 0.5;

        .search-input {
          padding: 8px 30px 8px 30px;
          background-color: rgba(var(--foreground-color-rgb), 0.05);
          border-style: none;
          border-radius: 100px;
          width: 50px;
          transition-duration: 0.3s;

          &::placeholder {
            user-select: none;
            color: inherit;
          }

          &:focus {
            width: 150px;
            outline: none;
          }
        }

        .img-search {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          -webkit-user-drag: none;
        }

        .img-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          -webkit-user-drag: none;
          cursor: pointer;
        }
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

// ---- 骨架屏 ----
// 用户信息骨架
.skel-user {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.skel-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(var(--foreground-color-rgb), 0.15);
  flex-shrink: 0;
}

.skel-user-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  flex: 1;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
}

.skeleton-row {
  display: flex;
  align-items: center;
  height: 54px;
  padding: 7px 0;
  gap: 12px;
}

.skeleton-biglist {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skel-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  padding: 10px;
  max-width: 230px;
  min-width: 180px;
  border-radius: 10px;
  gap: 8px;
}

.skel-cover {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background: rgba(var(--foreground-color-rgb), 0.15);
  flex-shrink: 0;

  &--big {
    width: 180px;
    height: 180px;
    border-radius: 10px;
  }
}

.skel-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.skel-line {
  height: 14px;
  border-radius: 4px;
  background: rgba(var(--foreground-color-rgb), 0.15);

  &--long {
    width: 70%;
  }

  &--short {
    width: 45%;
  }

  &--medium {
    width: 55%;
  }

  &--col {
    width: 80px;
    flex-shrink: 0;
  }

  &--full {
    width: 180px;
  }
}

// shimmer 动画
.skel-cover,
.skel-line,
.skel-card .skel-cover,
.skel-card .skel-line {
  animation: shimmer 1.8s ease-in-out infinite;
  background-size: 200% 100%;
  background-image: linear-gradient(
    90deg,
    rgba(var(--foreground-color-rgb), 0.08) 0%,
    rgba(var(--foreground-color-rgb), 0.2) 40%,
    rgba(var(--foreground-color-rgb), 0.08) 80%
  );
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
