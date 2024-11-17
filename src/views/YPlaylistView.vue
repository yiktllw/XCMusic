<template>
  <!-- 0 滚动容器 -->
  <div class="scrollable y-playlist-view font-color-main" ref="scrollable">
    <!-- 1 歌单视图 -->
    <div class="playlist-view" ref="playlist_view">
      <!-- 2 歌单信息 -->
      <div class="playlist-info">
        <!-- 3 歌单封面 -->
        <div class="playlist-cover-container">
          <!-- 4 封面图片 -->
          <img
            v-if="playlist.coverImgUrl"
            :src="playlist.coverImgUrl"
            alt="Cover Image"
            class="playlist-cover"
            @load="_setBackgroundColor"
          />
          <div
            v-if="!playlist.coverImgUrl"
            class="playlist-cover"
            style="background-color: rgba(var(--foreground-color-rgb), 0.3)"
          ></div>
          <!-- 4 渐变层 -->
          <div class="gradient-overlay" v-if="type === 'playlist'"></div>
          <!-- 4 播放次数 -->
          <div class="play-info" v-if="type === 'playlist'">
            <img src="@/assets/play.svg" class="play-icon" />
            <span class="play-count">{{ playlist.playCount }}</span>
          </div>
        </div>
        <!-- 3 歌单详情 -->
        <div class="playlist-details" v-if="playlist.name">
          <div
            class="align-up"
            :class="type === 'playlist' ? '' : 'align-up-album'"
          >
            <!-- 4 歌单名称 -->
            <div class="playlist-name">
              {{
                playlist.name + (playlist.transName ? playlist.transName : "")
              }}
            </div>
            <!-- 4 创建信息 -->
            <div class="createrInfo" v-if="type === 'playlist'">
              <!-- 5 创建者头像 -->
              <img
                v-if="playlist.createrAvatarUrl"
                :src="playlist.createrAvatarUrl"
                class="createrAvatar"
              />
              <div
                v-if="!playlist.createrAvatarUrl"
                class="createrAvatar"
                style="background-color: rgba(var(--foreground-color-rgb), 0.3)"
              ></div>
              <!-- 5 创建者名称 -->
              <span class="creater-name">
                {{ playlist.createrName }}
              </span>
              <span
                v-if="!playlist.createrAvatarUrl"
                class="creater-name"
                style="background-color: rgba(var(--foreground-color-rgb), 0.3)"
              >
                {{ $t("playlist_view.creator") }}
              </span>
              <!-- 5 创建时间 -->
              <span class="create-time font-color-standard">
                {{ playlist.createTime }}
                {{ $t("playlist_view.created_time") }}
              </span>
            </div>
            <!-- 4 创建信息 -->
            <div class="album-artist font-color-high" v-else>
              <span
                v-for="(artist, index) in playlist.artists"
                :key="artist.id"
              >
                <!-- 5 歌手按钮 -->
                <span
                  @click="handleArtistClick(artist.id)"
                  class="artist-button"
                  :title="artist.name + (artist.tns ? '\n' + artist.tns : '')"
                >
                  {{ artist.name }}
                </span>
                <span v-if="index < playlist.artists.length - 1">
                  /&nbsp;
                </span>
              </span>
            </div>
            <div class="createrInfo" v-if="type === 'album'">
              <!-- 5 创建时间 -->
              <span class="create-time-album font-color-standard">
                {{ playlist.createTime }}&nbsp;
                {{ $t("playlist_view.published_time") }}
              </span>
            </div>
          </div>
          <div class="align-down">
            <!-- 4 歌单按钮 -->
            <div class="play-buttons">
              <!-- 5 播放按钮 -->
              <button :tabindex="-1" class="play-button" @click="playAll">
                <img
                  src="@/assets/play.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                <span style="padding-bottom: 2px">
                  {{ $t("playlist_view.play") }}
                </span>
              </button>
              <!-- 5 添加到播放列表按钮 -->
              <button
                :tabindex="-1"
                class="add-button"
                @click="addPlaylistToQueue"
              >
                <img
                  class="g-icon"
                  src="@/assets/addtoplaylist.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                {{ $t("playlist_view.add_to_playlist") }}
              </button>
              <!-- 5 下载按钮 -->
              <button
                :tabindex="-1"
                class="download-button"
                @click="downloadPlaylist"
              >
                <img
                  class="g-icon"
                  src="@/assets/download.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                {{ $t("playlist_view.download") }}
              </button>
              <!-- 5 多选按钮 -->
              <button
                :tabindex="-1"
                class="multichoice-button"
                @click="multiChoice"
              >
                <img
                  class="g-icon"
                  src="@/assets/multichoice.svg"
                  style="width: 15px; height: 15px; padding-right: 5px"
                />
                {{ $t("playlist_view.multi_select") }}
              </button>
              <!-- 5 搜索框 -->
              <div class="input-wrapper">
                <input
                  type="text"
                  class="search-input font-color-main"
                  @keydown.enter="
                    handleSearch(
                      ($event.target as HTMLInputElement).value,
                      true
                    )
                  "
                  @input="
                    handleSearch(
                      ($event.target as HTMLInputElement).value,
                      false
                    )
                  "
                  :placeholder="$t('playlist_view.search') + '...'"
                  spellcheck="false"
                  v-model="searchQuery"
                />
                <img src="@/assets/search.svg" class="img-search g-icon" />
                <img
                  v-if="searchQuery !== ''"
                  class="img-clear"
                  src="@/assets/clear2.svg"
                  @click="searchQuery = ''"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 2 切换歌曲或评论 -->
      <div class="orienter">
        <!-- 3 歌曲 -->
        <div class="orient-songs">
          <!-- 4 歌曲按钮 -->
          <button
            :tabindex="-1"
            class="orient-button"
            @click="orient = 'songs'"
          >
            <span
              style="font-size: 16px; color: var(--font-color-main)"
              :style="{
                'font-weight': orient === 'songs' ? 'bold' : '500',
                color:
                  orient === 'songs'
                    ? 'var(--font-color-main)'
                    : 'var(--font-color-standard)',
              }"
            >
              {{ $t("playlist_view.songs") }}
            </span>
            <div
              class="choosed"
              style="
                transform: translate(7px, 4px);
                width: 60%;
                height: 4px;
                border-radius: 2px;
              "
              v-if="orient === 'songs'"
            ></div>
          </button>
        </div>
        <div
          class="songs-count"
          style="
            color: var(--font-color-main);
            margin: 0;
            padding: 0 20px 0px 2px;
            font-size: 13px;
            font-weight: bold;
          "
          :style="{
            color:
              orient === 'songs'
                ? 'var(--font-color-main)'
                : 'var(--font-color-standard)',
          }"
        >
          {{ playlist.trackCount }}
        </div>
        <!-- 3 评论 -->
        <div class="orient-comments">
          <!-- 4 评论按钮 -->
          <button
            :tabindex="-1"
            class="orient-button"
            @click="orient = 'comments'"
          >
            <span
              style="font-size: 16px"
              :style="{
                'font-weight': orient === 'comments' ? 'bold' : '500',
                color:
                  orient === 'comments'
                    ? 'var(--font-color-main)'
                    : 'var(--font-color-standard)',
              }"
            >
              {{ $t("playlist_view.comments") }}
            </span>
            <div
              class="choosed"
              style="
                transform: translate(7px, 4px);
                width: 60%;
                height: 4px;
                border-radius: 2px;
              "
              v-if="orient === 'comments'"
            ></div>
          </button>
        </div>
      </div>
      <!-- 2 加载中动画 -->
      <YLoading v-if="isLoading" />
      <!-- 2 歌曲列表 -->
      <YSongsTable
        v-if="!isLoading && type === 'playlist' && orient === 'songs'"
        v-model="filteredTracks"
        :showTrackPopularity="false"
        id="YPlaylist.vue-playlist"
        :from="playlistId"
        ref="playlist_songstable"
      />
      <YSongsTable
        v-if="!isLoading && type === 'album' && orient === 'songs'"
        v-model="filteredTracks"
        :showTrackAlbum="false"
        :showTrackCover="false"
        :al-reels="playlist.alReels"
        id="YPlaylist.vue-album"
        :type="'album'"
        :show-header="false"
        :resortable="false"
        ref="album_songstable"
      />
      <!-- 2 分页 -->
      <YComment
        :type="type"
        :id="playlistId"
        v-if="orient === 'comments'"
        :show-header="false"
        ref="ycomment"
      />
      <!-- 2 滚动按钮 -->
      <div class="scroll-buttons">
        <div class="button" @click="scrollToCurrentTrack">
          <img src="@/assets/position.svg" class="g-icon" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import YSongsTable from "@/components/list/YSongsTable.vue";
import YLoading from "@/components/base/YLoading.vue";
import YComment from "@/components/list/YComment.vue";
import { Message } from "@/dual/YMessageC";
import { ITrack, Tracks } from "@/utils/tracks";
import { Playlist, useApi } from "@/utils/api";
import { formatDate_yyyymmdd } from "@/utils/time";
import { YColor } from "@/utils/color";
import { Theme1, Theme2, themes } from "@/utils/theme";
import { useStore } from "vuex";
import { preparePlaylist } from "@/utils/playlist";
import { markRaw, ref, defineComponent } from "vue";
import { AlReels } from "@/dual/YSongsTable";
import { IArtist } from "@/dual/YPlaylistView";
import { RouteLocationNormalized, NavigationGuardNext } from "vue-router";

export default defineComponent({
  name: "YPlaylist",
  components: {
    YSongsTable,
    YLoading,
    YComment,
  },
  props: {
    // 传入的歌单 ID
    playlistId: {
      type: Number,
      required: true,
    },
    // 传入的歌单类型
    type: {
      type: String,
      default: "playlist", // playlist, album
    },
  },
  setup() {
    const store = useStore();
    const playlist_songstable = ref<typeof YSongsTable | null>(null);
    const album_songstable = ref<typeof YSongsTable | null>(null);

    return {
      player: store.state.player,
      login: store.state.login,
      openedPlaylist: store.state.openedPlaylist,
      setting: store.state.setting,
      download: store.state.download,
      playlist_songstable,
      album_songstable,
    };
  },
  computed: {
    likelist() {
      return this.login.likelist;
    },
  },
  data() {
    return {
      playlist: {
        name: "", // 歌单名称
        transName: "", // 歌单翻译名称
        coverImgUrl: "", // 封面图片 URL
        artists: [] as IArtist[], // 歌单歌手
        playCount: 0, // 播放次数
        createTime: "", // 创建时间
        createrId: 0, // 创建者 ID
        createrName: "", // 创建者名称
        createrAvatarUrl: "", // 创建者头像 URL
        trackCount: 0, // 歌曲数量
        alReels: [] as AlReels[], // 专辑信息
        tracks: [] as ITrack[], // 歌曲列表
      },
      isLoading: true, // 是否正在加载
      searchQuery: "", // 搜索关键字
      filteredTracks: [] as ITrack[], // 搜索过滤后的歌曲列表
      orient: "songs", // 歌曲列表或评论列表
      page: 1, // 歌单页数
    };
  },
  watch: {
    // 监听 playlistId 的变化，当 playlistId 变化时重新获取歌单信息
    playlistId: {
      immediate: true,
      handler(newVal) {
        this.fetchPlaylist(newVal);
        this.isLoading = true;
        this.orient = "songs";
        if (this.type === "playlist") {
          this.openedPlaylist.id = newVal;
        }
        this.searchQuery = "";
      },
    },
    // 监听 playlist.coverImgUrl 的变化，当 coverImgUrl 变化时重新设置背景颜色
    "playlist.coverImgUrl": function () {
      this._setBackgroundColor();
    },
    // 监听 searchQuery 的变化，当 searchQuery 变化时重新过滤歌曲列表
    searchQuery: {
      handler() {
        this.updateTracks();
      },
    },
    isLoading(val) {
      if (!val) {
        this.$nextTick(() => {
          let mainScroll = document.getElementById("yscroll-display-area");
          if (window.savedPositions[this.$route.path] && mainScroll) {
            mainScroll.scrollTop = window.savedPositions[this.$route.path]
              .top as number;
          }
          mainScroll = null;
        });
      }
    },
    $route(to, from) {
      const mainScroll = document.getElementById("yscroll-display-area");
      window.savedPositions[from.path] = {
        top: mainScroll?.scrollTop ?? 0,
        left: 0,
      };
    },
  },
  beforeRouteLeave(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const mainScroll = document.getElementById("yscroll-display-area");
    window.savedPositions[from.path] = {
      top: mainScroll?.scrollTop ?? 0,
      left: 0,
    };
    next();
  },
  methods: {
    // 获取歌单
    async fetchPlaylist(id: number) {
      try {
        let requests = [];
        if (this.type === "playlist") {
          // 获取歌单详情
          requests = [
            Playlist.getDetail(id)
              .then((response) => {
                if (id !== this.playlistId) {
                  return;
                }
                // 歌单名称
                this.playlist.name = response.playlist.name;
                // 歌单翻译名称
                this.playlist.transName = "";
                // 封面图片 URL
                this.playlist.coverImgUrl = response.playlist.coverImgUrl;
                // 播放次数
                this.playlist.playCount = response.playlist.playCount;
                // 创建时间
                this.playlist.createTime = formatDate_yyyymmdd(
                  response.playlist.createTime
                );
                // 创建者ID
                this.playlist.createrId = response.playlist.userId;
                // 创建者名称
                this.playlist.createrName = response.playlist.creator.nickname;
                // 创建者头像 URL
                this.playlist.createrAvatarUrl =
                  response.playlist.creator.avatarUrl;
                // 歌曲数量
                this.playlist.trackCount = response.playlist.trackCount;
                this.page = Math.floor(response.playlist.trackCount / 1000) + 1;
                return response;
              })
              .catch((error) => {
                console.error("Failed to fetch playlist:", error);
                throw error;
              }),
            this.login.userId
              ? useApi("/user/playlist", {
                  uid: this.login.userId,
                })
                  .then((myFavoriteId) => {
                    // 如果是我喜欢的音乐
                    if (myFavoriteId.playlist[0].id == id) {
                      return myFavoriteId.playlist[0].id;
                    }
                  })
                  .catch((error) => {
                    console.error("Failed to fetch myFavoriteId:", error);
                    throw error;
                  })
              : null,
            this.fetchTracks(id, 1)
              .then((getTracks) => {
                // 第一页的歌曲列表
                if (id !== this.playlistId) {
                  return;
                }
                this.playlist.tracks = getTracks;
                this.updateTracks();
                this.isLoading = false;
                return getTracks;
              })
              .catch((error) => {
                console.error("Failed to fetch tracks:", error);
                throw error;
              }),
          ];
        } else {
          requests = [
            useApi(`/api/album/v3/detail?id=${id}`)
              .then((response) => {
                // 专辑名称
                if (id !== this.playlistId) {
                  return;
                }
                this.playlist.name = response.album.name;
                // 专辑翻译名称
                this.playlist.transName = response.album.transNames
                  ? " (" + response.album.transNames + ")"
                  : "";
                // 封面图片 URL
                this.playlist.coverImgUrl = response.album.picUrl;
                // 创建时间
                this.playlist.createTime = formatDate_yyyymmdd(
                  response.album.publishTime
                );
                // 创建者ID
                this.playlist.artists = response.album.artists;
                // 歌曲数量
                this.playlist.trackCount = response.album.size;
                // 添加专辑信息
                this.playlist.tracks = markRaw(
                  new Tracks({
                    url: "/api/album/v3/detail",
                    tracks: response.songs,
                    params: {
                      needIndex: true,
                      reels: response.showreels,
                    },
                  }).tracks
                );
                this.playlist.alReels = response.showreels;
                // 更新歌曲列表
                this.updateTracks();
                // 加载完成
                this.isLoading = false;
                return response;
              })
              .catch((error) => {
                console.error("Failed to fetch album:", error);
                throw error;
              }),
            this.login.userId
              ? useApi("/user/playlist", {
                  uid: this.login.userId,
                })
                  .then((myFavoriteId) => {
                    // 我喜欢的音乐
                    if (myFavoriteId.playlist[0].id == id) {
                      this.playlist.name = this.$t(
                        "playlist_view.my_favorite_musics"
                      );
                    }
                    return myFavoriteId;
                  })
                  .catch((error) => {
                    console.error("Failed to fetch myFavoriteId:", error);
                    throw error;
                  })
              : null,
          ];
        }

        // 使用Promise.allSettled来处理可能出现的null值（避免报错）
        let result = await Promise.allSettled(requests).catch((error) => {
          console.error("Failed to fetch playlist or tracks:", error);
          throw error;
        });
        if (
          this.type === "playlist" &&
          result[1].status === "fulfilled" &&
          result[1].value === id
        ) {
          // 我喜欢的音乐
          this.playlist.name = this.$t("playlist_view.my_favorite_musics");
        }

        // 处理fetchTracks获取的多个页面的track
        if (this.page > 1 && this.type === "playlist") {
          const promises = [];

          for (let i = 2; i <= this.page; i++) {
            promises.push(this.fetchTracks(id, i));
          }

          const addedTracksArray = await Promise.all(promises);
          if (id !== this.playlistId) {
            return;
          }
          this.playlist.tracks = this.playlist.tracks.concat(
            ...addedTracksArray
          );
          this.updateTracks();
        }
      } catch (error) {
        console.error("Failed to fetch playlist or tracks:", error);
      }
    },
    // 获取当前页的歌曲列表
    async fetchTracks(id: number, page: number) {
      const limit = 1000;
      let result = await Playlist.fetchTracks(id, page, limit);
      return result;
    },
    // 设置背景颜色
    async _setBackgroundColor() {
      try {
        const theme = YColor.findTheme(this.setting.display.theme);
        YColor.setBkColorFromImg(
          this.playlist.coverImgUrl,
          document,
          (theme as Theme1).type,
          (theme as Theme2).background
        );
      } catch (error) {
        console.error("Failed to set background color:", error);
      }
    },
    // 处理搜索
    handleSearch(input: string, fromEnter: boolean) {
      console.log("search", input);
      // 更新搜索关键字
      if (fromEnter) {
        this.searchQuery = input;
      } else if (this.playlist.tracks.length < 500 || input === "") {
        this.searchQuery = input;
      }
    },
    // 更新歌曲列表 搜索过滤
    updateTracks() {
      if (!this.searchQuery) {
        this.filteredTracks = this.playlist.tracks;
        return;
      }
      const query = this.searchQuery.toLowerCase();
      // 否则返回包含搜索关键字的歌曲
      this.filteredTracks = this.playlist.tracks.filter((track) => {
        // 歌曲名称
        const trackName = track.name.toLowerCase();
        // 处理歌曲别名
        let trackNameTns = "";
        if (track.tns) {
          trackNameTns = track.tns[0] ? track.tns[0].toLowerCase() : "";
        }
        // 歌手名称
        const trackArtist = track.ar
          .map((artist) => {
            if (!artist.name) {
              return '';
            }
            artist.name.toLowerCase();
          })
          .join(" / ");
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
      });
    },
    // 播放歌单
    async playAll() {
      console.log("playAll");
      // 预处理歌单
      let playlist = preparePlaylist(this.playlist.tracks);
      this.player.playAll(playlist);
      Message.post(
        "success",
        this.$t("message.playlist_view.added_to_playlist")
      );
      if (this.type === "playlist") {
        await this.updatePlayCount();
      }
    },
    // 添加到播放列表
    async addPlaylistToQueue() {
      this.player.addPlaylist(this.playlist.tracks);
      Message.post(
        "success",
        this.$t("message.playlist_view.added_to_playlist")
      );
    },
    // 播放歌曲
    async playSongs(track: ITrack) {
      console.log("playSongs");
      await this.player.playTrack(track);
      this.player.playState = "play";
      if (this.type === "playlist") {
        await this.updatePlayCount();
      }
    },
    // 更新歌单播放次数
    async updatePlayCount() {
      let result = await useApi("/playlist/update/playcount", {
        id: this.playlistId,
      }).catch((error) => {
        console.error("Failed to update play count:", error);
        throw error;
      });
      console.log("updatePlayCount:", JSON.stringify(result, null, 2));
    },
    // 处理歌手点击
    handleArtistClick(artistId: number | string) {
      this.$router.push({
        path: "/artist/" + artistId,
      });
    },
    scrollToCurrentTrack() {
      let songstable =
        this.playlist_songstable ?? this.album_songstable ?? null;
      if (songstable) {
        songstable.scrollToCurrentTrack();
      }
    },
    downloadPlaylist() {
      this.download.addList(this.filteredTracks);
      Message.post("success", this.$t("playlist_view.list_added_to_download"));
    },
    multiChoice() {
      Message.post("info", "功能暂未实现");
    },
  },
  beforeUnmount() {
    // 组件销毁时发送消息
    this.openedPlaylist.id = 0;
    this.playlist_songstable = null;
    this.album_songstable = null;
  },
});
</script>

<style lang="scss" scoped>
.playlist-view {
  padding: 20px;
  background-color: transparent;

  .playlist-info {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;

    .playlist-cover-container {
      position: relative;
      display: inline-block;
      margin-right: 20px;

      .playlist-cover {
        display: block;
        width: 160px;
        height: 160px;
        border-radius: 10px;
        user-select: none;
        -webkit-user-drag: none;
      }

      .gradient-overlay {
        position: absolute;
        border-radius: 10px;
        top: 0;
        left: 0;
        width: 100%;
        height: 50%;
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
          height: 11px;
          margin-right: 3px;
        }

        .play-count {
          font-size: 14px;
          color: #fff;
        }
      }
    }

    .playlist-details {
      display: flex;
      justify-content: space-between;
      width: calc(100% - 180px);
      height: 160px;
      flex-direction: column;

      .align-up {
        display: inherit;
        flex-direction: inherit;
        margin-top: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .align-up-album {
        width: 100%;
        margin-top: 5px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playlist-name {
        text-align: left;
        font-size: 24px;
        font-weight: bold;
        margin-top: 0px;
        margin-bottom: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .createrInfo {
        display: inline-flex;
        align-items: center;

        .createrAvatar {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          margin-right: 5px;
        }

        .creater-name {
          color: var(--font-color-high);
        }

        .create-time {
          padding-bottom: 3px;
          padding-left: 10px;
        }

        .create-time-album {
          font-size: 14px;
        }
      }

      .album-artist {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .artist-button {
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          text-overflow: ellipsis;
        }
      }

      .align-down {
        display: inherit;
        flex-direction: inherit;
        margin-bottom: 5px;

        .play-buttons {
          display: inline-flex;
          width: 100%;
          height: 35px;

          .play-button {
            color: #fff;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            background-color: transparent;
            border-style: none;
            border-radius: 5px;
            padding: 7px 15px 7px 12px;
            margin-right: 5px;
            background-color: rgb(var(--highlight-color-rgb));
            &:hover {
              background-color: rgba(var(--highlight-color-rgb), 0.8);
            }
          }

          .add-button,
          .download-button,
          .multichoice-button {
            color: var(--font-color-main);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            background-color: transparent;
            border-style: none;
            border-radius: 5px;
            padding: 7px 15px 7px 12px;
            margin-left: 5px;
            margin-right: 5px;
            padding-top: 8px;
            padding-bottom: 8px;
            background-color: rgba(var(--foreground-color-rgb), 0.1);

            &:hover {
              background-color: rgba(var(--foreground-color-rgb), 0.2);
            }
          }

          .input-wrapper {
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
    }
  }

  .orienter {
    display: flex;
    margin-bottom: 20px;
    background-color: transparent;

    .orient-songs {
      background-color: transparent;
    }

    .orient-comments {
      background-color: transparent;
    }

    .orient-button {
      cursor: pointer;
      background-color: transparent;
      border-style: none;
      padding: 0;
    }

    .choosed {
      width: 90%;
      height: 2px;
      background-color: rgb(var(--highlight-color-rgb));
      transform: translateY(1px);
      transform: translateX(1px);
    }
  }

  .scroll-buttons {
    position: absolute;
    right: 20px;
    bottom: 20px;
    display: flex;
    align-items: center;
    flex-direction: column;

    .button {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background-color: var(--panel-background-color);
      border-style: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      box-shadow: 0 0 5px rgba($color: #000000, $alpha: 0.4);
      padding: 0;

      img {
        width: 32.1px;
        height: 32.1px;
        opacity: 0.6;
      }

      &:hover {
        img {
          opacity: 1;
        }
      }
    }
  }
}
</style>
