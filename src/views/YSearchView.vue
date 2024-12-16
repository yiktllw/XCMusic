<template>
  <!-- 搜索界面 -->
  <!-- 滚动容器 -->
  <div class="search-info">
    <div class="search-info-title font-color-main">
      {{ $t("search_view.search_info_before") }}
      「&nbsp;{{ search }}&nbsp;」
      <span class="font-color-high" style="font-size: 16px">
        {{ $t("search_view.search_info_after") }}
        <span v-if="position === 'song'">
          {{ switcher[0].total }}{{ $t("search_view.songs") }}
        </span>
        <span v-else-if="position === 'album'">
          {{ switcher[1].total }}{{ $t("search_view.albums") }}
        </span>
        <span v-else-if="position === 'playlist'">
          {{ switcher[2].total }}{{ $t("search_view.playlists") }}
        </span>
        <span v-else-if="position === 'artist'">
          {{ switcher[3].total }} {{ $t("search_view.artists") }}
        </span>
        <span v-else-if="position === 'lyric'">
          {{ switcher[4].total }}{{ $t("search_view.songs") }}
        </span>
        <span v-else-if="position === 'user'">
          {{ switcher[5].total }}{{ $t("search_view.users") }}
        </span>
      </span>
    </div>
    <div class="search-info-detail font-color-main"></div>
  </div>
  <!-- 导航 -->
  <div class="switcher">
    <button
      :tabindex="-1"
      class="switcher-item"
      v-for="(item, index) in switcher"
      @click="handleSwitcher(item.position)"
    >
      <span
        style="font-size: 16px; color: #fff"
        :style="{
          'font-weight': item.position === position ? 'bold' : '500',
          color:
            item.position === position
              ? 'var(--font-color-main)'
              : 'var(--font-color-standard)',
        }"
      >
        {{ $t(item.display) }}
      </span>
      <div
        class="choosed"
        style="
          transform: translate(7px, 4px);
          width: 60%;
          height: 4px;
          border-radius: 2px;
        "
        v-if="item.position === position"
      ></div>
    </button>
  </div>
  <YScroll
    :style="{
      maxHeight: 'calc(100vh - 230px)',
    }"
  >
    <div class="content">
      <!-- 歌曲 -->
      <div class="songs" v-if="position === 'song'">
        <YSongsTable
          :resortable="false"
          stickyTop="50px"
          :canSendPlaylist="false"
          :showTrackCover="true"
          v-model="switcher[0].tracks"
          :id="'YSearchView.vue'"
          v-if="!Loading.songs"
        />
        <YLoading v-else />
        <YPage v-model="songsPage" />
      </div>
      <!-- 专辑 -->
      <div class="albums" v-else-if="position === 'album'">
        <YPlaylistList
          :playlists="switcher[1].playlists"
          stickyTop="50px"
          type="album"
          v-if="!Loading.albums"
        />
        <YLoading v-else />
        <YPage v-model="albumsPage" />
      </div>
      <!-- 歌单 -->
      <div class="playlists" v-else-if="position === 'playlist'">
        <YPlaylistList
          :playlists="switcher[2].playlists"
          stickyTop="50px"
          v-if="!Loading.playlists"
        />
        <YLoading v-else />
        <YPage v-model="playlistsPage" />
      </div>
      <!-- 歌手 -->
      <div class="artists" v-else-if="position === 'artist'">
        <YArtistList :artists="switcher[3].artists" v-if="!Loading.artists" />
        <YLoading v-else />
        <YPage v-model="artistsPage" />
      </div>
      <!-- 歌词 -->
      <div class="lyrics" v-else-if="position === 'lyric'">
        <YSearchLyrics v-model="switcher[4].lyricsList" v-if="!Loading.lyrics" />
        <YLoading v-else />
        <YPage v-model="lyricsPage" />
      </div>
      <!-- 用户 -->
      <div class="users" v-else-if="position === 'user'">
        <YArtistList
          :artists="switcher[5].users"
          type="user"
          v-if="!Loading.users"
        />
        <YLoading v-else />
        <YPage v-model="usersPage" />
      </div>
    </div>
  </YScroll>
  <!-- 内容 -->
</template>

<script src="./YSearchView.ts" lang="ts"></script>

<style lang="scss" scoped>
.search-info {
  padding: 0 12px;
  display: flex;
  width: 100%;
  align-items: start;
  flex-direction: column;

  .search-info-title {
    font-size: 20px;
    font-weight: bold;
    margin-right: 10px;
  }
}

.switcher {
  display: flex;
  font-size: 16px;
  align-items: center;
  padding-top: 10px;
  margin-left: 10px;
  padding-bottom: 20px;
  position: sticky;
  top: 0px;
  z-index: 1;
  width: 100%;
  // background-color: var(--background-color);
  // backdrop-filter: blur(10px);

  .switcher-item {
    height: 20px;
    margin: 0 7px;
    background-color: transparent;
    border: none;
    cursor: pointer;

    .choosed {
      width: 90%;
      height: 2px;
      background-color: rgb(var(--highlight-color-rgb));
      transform: translateY(1px);
      transform: translateX(1px);
    }
  }
}

.content {
  padding: 0 10px;
}
</style>
