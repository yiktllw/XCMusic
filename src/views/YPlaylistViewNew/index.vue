<template>
  <div v-if="loading" class="skeleton">
    <ContentLoader
      :speed="1.5"
      :width="1000"
      :height="800"
      primaryColor="rgba(var(--foreground-color-rgb), 0.2)"
      secondaryColor="rgba(var(--foreground-color-rgb), 0.1)"
    >
      <!-- 封面 -->
      <rect x="20" y="20" rx="10" ry="10" width="160" height="160" />
      <!-- 标题等信息 -->
      <rect x="190" y="30" rx="8" ry="8" width="160" height="16" />
      <rect x="190" y="70" rx="8" ry="8" width="80" height="16" />
      <rect x="190" y="110" rx="8" ry="8" width="80" height="16" />
      <rect x="190" y="150" rx="8" ry="8" width="320" height="16" />
      <rect x="20" y="195" rx="8" ry="8" width="120" height="16" />
      <!-- 歌曲 -->
      <template v-for="index in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]">
        <rect
          x="24"
          :y="243 + 60 * index"
          rx="5"
          ry="5"
          width="20"
          height="10"
        />
        <rect
          x="60"
          :y="230 + 60 * index"
          rx="8"
          ry="8"
          width="40"
          height="40"
        />
        <rect
          x="110"
          :y="233 + 60 * index"
          rx="5"
          ry="5"
          width="400"
          height="10"
        />
        <rect
          x="110"
          :y="253 + 60 * index"
          rx="5"
          ry="5"
          width="200"
          height="10"
        />
        <rect
          x="540"
          :y="243 + 60 * index"
          rx="5"
          ry="5"
          width="200"
          height="10"
        />
      </template>
    </ContentLoader>
  </div>
  <YSongsTableNew v-else class="songs-table" :options="songsTableProps">
    <template #slot-prepend>
      <div class="info">
        <div class="left">
          <img
            class="cover"
            id="playlist-cover"
            :src="playlistDetail.cover"
            @load="setBkgColor"
            v-if="playlistDetail.cover"
          />
          <div class="cover" v-else />
          <div class="gradient-overlay" v-if="playlistDetail.playCount > 0" />
          <div class="play-info" v-if="playlistDetail.playCount > 0">
            <img class="play-icon" :src="play_svg" />
            <span class="play-count">{{ playlistDetail.playCount }}</span>
          </div>
        </div>
        <div class="right">
          <h2
            class="title font-color-main"
            :title="
              playlistDetail.name +
              (playlistDetail.transName ? '\n' : '') +
              playlistDetail.transName
            "
            v-if="playlistDetail.name"
          >
            {{ playlistDetail.name }}
            <span v-if="playlistDetail.transName" class="font-color-standard">
              {{ playlistDetail.transName }}
            </span>
          </h2>
          <div class="artists font-color-high">
            <div
              class="creator"
              v-if="type === 'playlist' && playlistDetail.creatorName"
              @click="openUser()"
            >
              <img :src="playlistDetail.creatorAvatar" class="avatar" />
              {{ playlistDetail.creatorName }}
            </div>
            <template v-else v-for="artist in playlistDetail.artists">
              <span
                class="artist"
                @click="openArtist(artist.id)"
                :title="artist.name"
              >
                {{ artist.name }}
              </span>
              <span
                v-if="
                  playlistDetail.artists.indexOf(artist) !==
                  playlistDetail.artists.length - 1
                "
                >,
              </span>
            </template>
          </div>
          <div class="publish-time font-color-high">
            {{ playlistDetail.createTime }}
            {{
              type === "playlist"
                ? $t("playlist_view.created_time")
                : $t("playlist_view.published_time")
            }}
          </div>
          <div class="buttons">
            <button :tabindex="-1" class="play-btn btn" @click="playAll">
              <img :src="play_svg" class="icn" />
              {{ $t("playlist_view.play") }}
            </button>
            <button
              :tabindex="-1"
              class="add-to-playlist-btn btn"
              @click="addToPlaylist"
            >
              <img :src="addToPlaylist_svg" class="icn g-icon" />
              {{ $t("playlist_view.add_to_playlist") }}
            </button>
            <button :tabindex="-1" class="btn" @click="downloadAll">
              <img :src="download_svg" class="icn g-icon" />
              <span>{{ $t("playlist_view.download") }}</span>
            </button>
            <button :tabindex="-1" class="btn" @click="subscribe">
              <img :src="subscribe_svg" class="icn g-icon" />
              {{
                (type === "playlist" &&
                  userSubscribeIds.includes(playlistId)) ||
                (type === "album" && userSubscribeAlbumIds.includes(playlistId))
                  ? $t("playlist_view.subscribed")
                  : $t("playlist_view.subscribe")
              }}
            </button>
            <button :tabindex="-1" class="btn" @click="multiChoice">
              <img :src="multichoice_svg" class="icn g-icon" />
              {{ $t("playlist_view.multi_select") }}
            </button>
          </div>
        </div>
      </div>
      <div class="middle">
        <div class="font-color-main header">
          <span class="txt-songs">
            {{ $t("playlist_view.songs") }}
          </span>
          <span class="txt-number">
            {{ playlistDetail.trackCount }}
          </span>
          <span class="comment font-color-standard" @click="openComment">
            {{ $t("playlist_view.comments") }}
          </span>
          <div class="choosed" />
        </div>
        <div class="search">
          <input
            type="text"
            @keydown.enter="
              handleSearch(($event.target as HTMLInputElement).value, true)
            "
            @keydown.escape="handleEscape"
            @input="
              handleSearch(($event.target as HTMLInputElement).value, false)
            "
            :placeholder="$t('playlist_view.search') + '...'"
            spellcheck="false"
            v-model="searchQuery"
            class="search-input font-color-main"
          />
          <img :src="search_svg" class="img-search" />
          <img
            v-if="searchQuery.length > 0"
            :src="clear_svg"
            class="img-clear"
            @click="searchQuery = ''"
          />
        </div>
      </div>
    </template>
  </YSongsTableNew>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import YSongsTableNew from "@/components/list/YSongsTableNew/index.vue";
import { getSongsTableOptions } from "@/components/list/YSongsTableNew/types";
import {
  getAlbumDetail,
  getPlaylistDetail,
  getDefaultPlaylistDetail,
} from "./utils";
import type { ITrack } from "@/utils/tracks";
import { YColor } from "@/utils/color";
import { getStorage, StorageKey } from "@/utils/render_storage";
import type { Theme1, Theme2 } from "@/utils/theme";
import play_svg from "@/assets/play.svg";
import addToPlaylist_svg from "@/assets/addtoplaylist.svg";
import download_svg from "@/assets/download.svg";
import subscribe_svg from "@/assets/subscribe3.svg";
import multichoice_svg from "@/assets/multichoice.svg";
import search_svg from "@/assets/search.svg";
import clear_svg from "@/assets/clear2.svg";
import { useStore } from "vuex";
import { Playlist } from "@/utils/api";
import { LoginEvents } from "@/dual/login";
import { Message } from "@/dual/YMessageC";
import { ContentLoader } from "vue-content-loader";

export default defineComponent({
  name: "YPlaylistViewNew",
  components: {
    YSongsTableNew,
    ContentLoader,
  },
  props: {
    playlistId: {
      type: Number,
      required: true,
    },
    type: {
      type: String as () => "playlist" | "album",
      required: true,
      default: "playlist",
    },
  },
  watch: {
    type() {
      this.init();
    },
    playlistId() {
      this.init();
    },
    searchQuery() {
      this.updateTracks();
    },
  },
  setup() {
    const store = useStore();

    return {
      player: store.state.player,
      download: store.state.download,
      login: store.state.login,
    };
  },
  data() {
    const songsTableProps = getSongsTableOptions(`YPlaylistView-${this.type}`);
    const playlistDetail = getDefaultPlaylistDetail();
    return {
      songsTableProps,
      searchQuery: "",
      playlistDetail,
      tracksDisplay: [] as ITrack[],
      play_svg,
      addToPlaylist_svg,
      download_svg,
      subscribe_svg,
      multichoice_svg,
      search_svg,
      clear_svg,
      userSubscribeIds: [] as number[],
      userSubscribeAlbumIds: [] as number[],
      userCreateIds: [] as number[],
      loading: true,
    };
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
    this.login.subscriber.offAll("YPlaylistViewNew");
  },
  methods: {
    async init() {
      this.loading = true;
      this.searchQuery = "";
      this.songsTableProps = getSongsTableOptions(`YPlaylistView-${this.type}`);
      this.userSubscribeIds = this.login.userSubscribeIds.slice();
      this.userSubscribeAlbumIds = this.login.userSubscribeAlbumIds.slice();
      this.userCreateIds = this.login.userPlaylists.map((p) => p.id);
      this.login.subscriber.on(
        "YPlaylistViewNew",
        LoginEvents.userPlaylists,
        () => {
          this.userSubscribeIds = this.login.userSubscribeIds.slice();
          this.userSubscribeAlbumIds = this.login.userSubscribeAlbumIds.slice();
          this.userCreateIds = this.login.userPlaylists.map((p) => p.id);
        },
      );
      if (this.type === "playlist") {
        this.songsTableProps.playlistId = this.playlistId;
        if (this.userCreateIds.includes(this.playlistId)) {
          this.songsTableProps.editable = true;
        }
        await getPlaylistDetail(this.playlistId).then((res) => {
          if (res.id !== this.playlistId) return;
          this.playlistDetail = res;
          this.songsTableProps.reelOptions = undefined;
          this.songsTableProps.songs = this.playlistDetail.tracks.slice();
          this.loading = false;
          if (res.trackCount > 1000)
            Playlist.getAllTracks(this.playlistId, res.trackCount).then(
              (res2) => {
                if (res.id !== this.playlistId) return;
                this.playlistDetail.tracks = res2;
                this.songsTableProps.songs = this.playlistDetail.tracks.slice();
              },
            );
        });
      } else {
        this.songsTableProps.playlistId = -1;
        this.songsTableProps.editable = undefined;
        await getAlbumDetail(this.playlistId).then((res) => {
          if (res.id !== this.playlistId) return;
          this.playlistDetail = res;
          this.songsTableProps.songs = this.playlistDetail.tracks.slice();
          this.songsTableProps.reelOptions = {
            showReels: true,
            reels: res.alReels,
          };
        });
      }
      this.loading = false;
      this.updateTracks();
    },
    setBkgColor() {
      try {
        const theme = YColor.findTheme(
          getStorage(StorageKey.Setting_Display_Theme) ?? "dark",
        );
        YColor.setBkColorFromImg(
          this.playlistDetail.cover,
          document,
          (theme as Theme1).type,
          (theme as Theme2).background,
        );
      } catch (error) {
        console.error("Failed to set background color:", error);
      }
    },
    openArtist(artistId: number) {
      this.$router.push({ path: `/artist/${artistId}` });
    },
    playAll() {
      this.player.playAll(this.playlistDetail.tracks);
    },
    addToPlaylist() {
      this.player.addPlaylist(this.playlistDetail.tracks);
    },
    downloadAll() {
      this.download.addList(this.playlistDetail.tracks);
    },
    async subscribe() {
      let type: "on" | "off" = "on";
      if (
        (this.userSubscribeIds.includes(this.playlistId) &&
          this.type === "playlist") ||
        (this.userSubscribeAlbumIds.includes(this.playlistId) &&
          this.type === "album")
      ) {
        type = "off";
      }
      let res;
      if (this.type === "playlist") {
        res = await Playlist.subPlaylist(this.playlistId, type);
        this.login.refreshUserPlaylists();
      } else {
        res = await Playlist.subAlbum(this.playlistId, type);
        this.login.refreshUserAlbums();
      }
      console.log(type, res);
    },
    multiChoice() {
      Message.post("info", "功能暂未实现");
    },
    openComment() {
      this.$router.push({ path: `/comment/${this.type}/${this.playlistId}` });
    },
    openUser() {
      this.$router.push({ path: `/user/${this.playlistDetail.creatorId}` });
    },
    handleSearch(input: string, fromEnter: boolean) {
      // // 更新搜索关键字
      // if (
      //   fromEnter ||
      //   this.playlistDetail.tracks.length < 500 ||
      //   input === ""
      // ) {
      this.searchQuery = input;
      console.log("search", input);
      // }
    },
    updateTracks() {
      if (!this.searchQuery) {
        this.songsTableProps.songs = this.playlistDetail.tracks.slice();
        return;
      }
      const query = this.searchQuery.toLowerCase();
      // 否则返回包含搜索关键字的歌曲
      this.songsTableProps.songs = this.playlistDetail.tracks.filter(
        (track) => {
          // 歌曲名称
          const trackName = track.name.toLowerCase();
          // 处理歌曲别名
          let trackNameTns = "";
          if (track.tns) {
            trackNameTns = track.tns[0] ? track.tns[0].toLowerCase() : "";
          }
          // 歌手名称
          const trackArtist = track.ar
            .map((artist) => (artist.name ? artist.name.toLowerCase() : ""))
            .join("/");
          // 歌手别名
          const trackArtistTns = track.ar
            .map((artist) => (artist.tns[0] ? artist.tns[0].toLowerCase() : ""))
            .join("/");
          // 专辑名称
          const trackAlbum = track.al.name?.toLowerCase();
          // 专辑别名
          const trackAlbumTns = track.al.tns[0]
            ? track.al.tns[0].toLowerCase()
            : "";
          return (
            trackName?.includes(query) ||
            trackNameTns.includes(query) ||
            trackArtistTns.includes(query) ||
            trackArtist.includes(query) ||
            trackAlbum?.includes(query) ||
            trackAlbumTns.includes(query)
          );
        },
      );
    },
    handleEscape(event: KeyboardEvent) {
      if (this.searchQuery === "") (event.target as HTMLElement)?.blur();
      else this.searchQuery = "";
    },
  },
});
</script>

<style lang="scss" scoped>
.skeleton {
  align-items: start;
  justify-content: start;
  justify-self: start;
  overflow: hidden;
  height: 100%;
}
.songs-table {
  width: calc(100% - 20px);
  height: calc(100vh - 85px - 65px);
  text-align: left;
  padding: 0 10px 0 10px;

  .info {
    padding: 20px 0 0 10px;
    display: flex;
    flex-direction: row;
    .left {
      position: relative;
      .cover {
        width: 160px;
        height: 160px;
        border-radius: 10px;
      }

      .gradient-overlay {
        border-radius: 10px;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.3),
          rgba(0, 0, 0, 0)
        );
        pointer-events: none;
        z-index: 1;
      }

      .play-info {
        position: absolute;
        top: 3px;
        right: 3px;
        display: flex;
        align-items: center;
        padding: 5px;
        border-radius: 5px;
        z-index: 1;

        .play-icon {
          width: 11px;
          margin-right: 3px;
        }

        .play-count {
          font-size: 14px;
          color: white;
        }
      }
    }

    .right {
      margin: 0 0 0 15px;
      overflow: hidden;
      .title {
        margin: 8px 0;
        overflow: hidden;
        text-overflow: ellipsis;
        text-wrap: nowrap;
      }
      .artists {
        margin-top: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        .creator {
          width: fit-content;
          display: flex;
          align-items: center;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
          .avatar {
            width: 24px;
            border-radius: 20px;
            margin-right: 5px;
          }
        }
        .artist {
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
      .publish-time {
        margin-top: 12px;
        font-size: 14px;
      }
      .buttons {
        display: flex;
        flex-direction: row;
        gap: 10px;
        margin-top: 16px;
        .btn {
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 7px 20px 9px 13px;
          border-radius: 5px;
          background: rgba(var(--foreground-color-rgb), 0.15);
          &:hover {
            background: rgba(var(--foreground-color-rgb), 0.25);
          }
          .icn {
            width: 16px;
            margin-right: 5px;
          }
        }
        .play-btn {
          background: rgba(var(--highlight-color-rgb), 1);
          &:hover {
            background: rgba(var(--highlight-color-rgb), 0.8);
          }
        }
      }
    }
  }

  .middle {
    display: flex;
    margin: 13px 0 0 10px;
    justify-content: space-between;
    .header {
      display: flex;
      flex-direction: row;
      position: relative;
      cursor: pointer;
      font-weight: bold;
      .txt-songs {
        font-size: 16px;
      }
      .txt-number {
        font-size: 13px;
        padding: 0 0 0 2px;
      }
      .choosed {
        position: absolute;
        width: 18px;
        height: 4px;
        background: rgb(var(--highlight-color-rgb));
        border-radius: 2px;
        left: 8px;
        top: 26px;
      }
      .comment {
        margin-left: 18px;
        font-weight: 500;
      }
    }
    .search {
      position: relative;
      display: flex;
      margin-left: auto;
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
</style>
