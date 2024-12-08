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
        />
        <YPage v-model="songsPage" />
      </div>
      <!-- 专辑 -->
      <div class="albums" v-else-if="position === 'album'">
        <YPlaylistList
          :playlists="switcher[1].playlists"
          stickyTop="50px"
          type="album"
        />
        <YPage v-model="albumsPage" />
      </div>
      <!-- 歌单 -->
      <div class="playlists" v-else-if="position === 'playlist'">
        <YPlaylistList :playlists="switcher[2].playlists" stickyTop="50px" />
        <YPage v-model="playlistsPage" />
      </div>
      <!-- 歌手 -->
      <div class="artists" v-else-if="position === 'artist'">
        <YArtistList :artists="switcher[3].artists" />
        <YPage v-model="artistsPage" />
      </div>
      <!-- 歌词 -->
      <div class="lyrics" v-else-if="position === 'lyric'">
        <YSearchLyrics v-model="switcher[4].lyricsList" />
        <YPage v-model="lyricsPage" />
      </div>
      <!-- 用户 -->
      <div class="users" v-else-if="position === 'user'">
        <YArtistList :artists="switcher[5].users" type="user" />
        <YPage v-model="usersPage" />
      </div>
    </div>
  </YScroll>
  <!-- 内容 -->
</template>

<script lang="ts">
import YSongsTable from "@/components/list/YSongsTable.vue";
import YPlaylistList from "@/components/list/YPlaylistList.vue";
import YArtistList from "@/components/list/YArtistList.vue";
import YSearchLyrics from "@/components/list/YSearchLyrics.vue";
import YScroll from "@/components/base/YScroll.vue";
import YPage from "@/components/base/YPage.vue";
import { ITrack } from "@/utils/tracks";
import { YPageC } from "@/dual/YPageC";
import { YColor } from "@/utils/color";
import { Search } from "@/utils/api";
import { markRaw, defineComponent } from "vue";
import { IPlaylist } from "@/dual/YPlaylistList";
import { IArtist } from "@/dual/YArtistList";

export default defineComponent({
  name: "YSearchView",
  props: {
    // 搜索关键字
    search: {
      type: String,
      required: true,
    },
    // 搜索位置
    position: {
      type: String,
      default: "song",
    },
  },
  watch: {
    // 监听搜索位置变化, 切换搜索位置
    position(newPosition) {
      this.fetchData(newPosition);
      if (newPosition !== "default") {
        this.lastPosition = newPosition;
      }
    },
    // 监听搜索关键字变化, 重新搜索
    search() {
      this.fetchData(this.position);
    },
  },
  components: {
    YSongsTable,
    YScroll,
    YPlaylistList,
    YArtistList,
    YSearchLyrics,
    YPage,
  },
  data() {
    return {
      // 导航
      switcher: [
        {
          display: "search_view.switcher.song",
          position: "song",
          tracks: [] as ITrack[],
          total: 0,
        },
        {
          display: "search_view.switcher.album",
          position: "album",
          playlists: [] as IPlaylist[],
          total: 0,
        },
        {
          display: "search_view.switcher.playlist",
          position: "playlist",
          playlists: [] as IPlaylist[],
          total: 0,
        },
        {
          display: "search_view.switcher.artist",
          position: "artist",
          artists: [] as IArtist[],
          total: 0,
        },
        {
          display: "search_view.switcher.lyric",
          position: "lyric",
          lyricsList: [] as ITrack[],
          total: 0,
        },
        {
          display: "search_view.switcher.user",
          position: "user",
          users: [] as IArtist[],
          total: 0,
        },
      ],
      // 上次搜索位置
      lastPosition: "song",
      songsPage: new YPageC(1),
      albumsPage: new YPageC(1),
      playlistsPage: new YPageC(1),
      artistsPage: new YPageC(1),
      lyricsPage: new YPageC(1),
      usersPage: new YPageC(1),
    };
  },
  methods: {
    // 切换搜索位置
    handleSwitcher(position: string) {
      console.log("switch position", position);
      this.$router.push({ path: `/search/${this.search}/${position}` });
    },
    // 搜索歌曲
    async fetchTracks(newPageInstance = true) {
      await Search.songs(this.search, this.songsPage.current)
        .then((result) => {
          this.switcher[0].tracks = markRaw(result.songs);
          this.switcher[0].total = result.songCount;
          if (newPageInstance) {
            this.songsPage = new YPageC(Math.ceil(result.songCount / 100));
          }
          this.songsPage.onPageChange = () => {
            this.fetchTracks(false);
          };
        })
        .catch((err) => {
          console.log("fetchTracks", err);
        });
    },
    // 搜索歌单
    async fetchPlaylists(newPageInstance = true) {
      await Search.playlists(this.search, this.playlistsPage.current)
        .then((result) => {
          this.switcher[2].playlists = result.playlists?.map((playlist) => {
            return {
              ...playlist,
              _picUrl: playlist.coverImgUrl + "?param=80y80",
            };
          });
          this.switcher[2].total = result.playlistCount;
          if (newPageInstance) {
            this.playlistsPage = new YPageC(
              Math.ceil(result.playlistCount / 100)
            );
          }
          this.playlistsPage.onPageChange = () => {
            this.fetchPlaylists(false);
          };
        })
        .catch((err) => {
          console.log("fetchPlaylists", err);
        });
    },
    // 搜索专辑
    async fetchAlbums(newPageInstance = true) {
      await Search.albums(this.search, this.albumsPage.current)
        .then((result) => {
          this.switcher[1].playlists = result.albums?.map((album) => {
            return {
              ...album,
              _picUrl: album.picUrl + "?param=80y80",
            };
          });
          this.switcher[1].total = result.albumCount;
          if (newPageInstance) {
            this.albumsPage = new YPageC(Math.ceil(result.albumCount / 100));
          }
          this.albumsPage.onPageChange = () => {
            this.fetchAlbums(false);
          };
        })
        .catch((err) => {
          console.log("fetchAlbums", err);
        });
    },
    // 搜索歌手
    async fetchArtists(newPageInstance = true) {
      await Search.artists(this.search, this.artistsPage.current)
        .then((result) => {
          this.switcher[3].artists = result.artists?.map((artist) => {
            return {
              ...artist,
              _picUrl: artist.picUrl + "?param=130y130",
            };
          });
          this.switcher[3].total = result.artistCount;
          if (newPageInstance) {
            this.artistsPage = new YPageC(Math.ceil(result.artistCount / 100));
          }
          this.artistsPage.onPageChange = () => {
            this.fetchArtists(false);
          };
        })
        .catch((err) => {
          console.log("fetchArtists", err);
        });
    },
    // 搜索歌词
    async fetchLyrics(newPageInstance = true) {
      await Search.songsWithLyrics(this.search, this.lyricsPage.current)
        .then((result) => {
          this.switcher[4].lyricsList = markRaw(result.songs);
          this.switcher[4].total = result.songCount;
          if (newPageInstance) {
            this.lyricsPage = new YPageC(Math.ceil(result.songCount / 100));
          }
          this.lyricsPage.onPageChange = () => {
            this.fetchLyrics(false);
          };
        })
        .catch((err) => {
          console.log("fetchLyrics", err);
        });
    },
    // 搜索用户
    async fetchUsers(newPageInstance = true) {
      await Search.users(this.search, this.usersPage.current)
        .then((result) => {
          this.switcher[5].users = result.userprofiles?.map((user) => {
            return {
              ...user,
              _picUrl: user.avatarUrl + "?param=130y130",
            };
          });
          this.switcher[5].total = result.userprofileCount;
          if (newPageInstance) {
            this.usersPage = new YPageC(
              Math.ceil(result.userprofileCount / 100)
            );
          }
          this.usersPage.onPageChange = () => {
            this.fetchUsers(false);
          };
        })
        .catch((err) => {
          console.log("fetchUsers", err);
        });
    },
    fetchData(position: string) {
      switch (position) {
        case "song":
          this.fetchTracks();
          break;
        case "album":
          this.fetchAlbums();
          break;
        case "playlist":
          this.fetchPlaylists();
          break;
        case "artist":
          this.fetchArtists();
          break;
        case "lyric":
          this.fetchLyrics();
          break;
        case "user":
          this.fetchUsers();
          break;
        case "default":
          this.$router.push({
            path: `/search/${this.search}/${this.lastPosition}`,
          });
          break;
      }
    },
  },
  mounted() {
    this.fetchData(this.position);
    // 设置背景颜色
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("Searchview"));
    // 当前位置为默认位置时, 跳转到上次搜索位置
    this.position === "default"
      ? this.$router.push({
          path: `/search/${this.search}/${this.lastPosition}`,
        })
      : null;
  },
});
</script>

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
