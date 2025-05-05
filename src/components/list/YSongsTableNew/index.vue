<!--
多选功能仅在 YPlaylistViewNew 中使用。
-->
<template>
  <YVirtualScroll
    :items="options.songs"
    :item-height="60"
    :slots="slots"
    @did-change="handlePlaylistSort"
    class="font-color-main virtual-scroll g-scrollable"
    ref="virtualScroll"
  >
    <template #item="{ item, index: item_index }">
      <!-- 歌曲 -->
      <div
        class="song-item"
        @contextmenu="openContextMenu($event, item, 'show')"
        @click="handleItemClick($event, item, item_index)"
        @dblclick="handleDoubleClick(item)"
      >
        <div class="align-left">
          <div class="index" v-if="isMultiSelect">
            <input
              type="checkbox"
              :checked="selected.has(item.id)"
              @change="handleMultiSelect($event, item.id)"
            />
          </div>
          <div
            class="index font-color-standard"
            v-else-if="options.columns.index"
          >
            <span v-if="nowPlayingId !== item.id">
              {{ item_index + 1 }}
            </span>
            <YPlaying v-else />
          </div>
          <img
            class="song-img"
            :class="options.columns.index ? '' : 'no-index'"
            :src="item._picUrl ?? undefined"
            v-if="options.columns.cover"
          />
          <div class="song-info">
            <div
              class="song-name"
              :style="{
                color:
                  item.id === nowPlayingId
                    ? 'rgba(var(--highlight-color-rgb), 1)'
                    : 'var(--font-color-main)',
              }"
              v-if="options.columns.title"
              :title="
                item.tns?.length > 0
                  ? item.name + '\n' + item.tns[0]
                  : item.name
              "
            >
              {{
                options.mode === "album" &&
                options.reelOptions?.showReels &&
                item.reelName
                  ? item.reelName
                  : item.name
              }}
              <span
                :style="{
                  color:
                    item.id === nowPlayingId
                      ? 'rgba(var(--highlight-color-rgb), .6)'
                      : 'var(--font-color-standard)',
                }"
                v-if="item.tns?.length > 0"
                >&nbsp;({{ item.tns[0] }})</span
              >
            </div>
            <div
              class="song-artist font-color-standard"
              v-if="options.columns.artist"
            >
              <img
                class="success-img"
                :src="success_svg"
                v-if="downloadedSongIds.includes(item.id)"
              />
              <template
                v-if="item.ar[0].name"
                v-for="(artist, artist_index) in item.ar"
                :key="artist.id"
              >
                <span
                  :style="{
                    color:
                      item.id === nowPlayingId
                        ? 'rgba(var(--highlight-color-rgb), .6)'
                        : 'var(--font-color-standard)',
                  }"
                >
                  <span
                    class="artist-name"
                    :title="artist.name"
                    @click="openArtist(artist.id)"
                  >
                    {{ artist.name }}
                  </span>
                  <span v-if="artist_index !== item.ar?.length - 1"
                    >&nbsp;/&nbsp;</span
                  >
                </span>
              </template>
              <span v-else>{{ $t("songs_table.unknown_artist") }}</span>
            </div>
          </div>
        </div>
        <div class="align-right">
          <div class="menu">
            <img
              class="menu-img g-icon"
              :title="$t('context.download')"
              @click="downloadSong(item)"
              v-if="!downloadedSongIds.includes(item.id)"
              :src="smalldownload_svg"
            />
            <img
              class="menu-img g-icon"
              :title="$t('context.subscribe')"
              @click="open_addToPlaylist(item.id)"
              :src="subscribe_svg"
            />
            <img
              class="menu-img menu-img-comment g-icon"
              :title="$t('context.view_comment')"
              @click="openComment(item.id)"
              :src="comment_svg"
            />
            <img
              class="menu-img g-icon"
              :title="$t('songs_table.more')"
              @click="openContextMenu($event, item, 'toogle')"
              :src="detail_svg"
            />
            <img
              class="menu-img g-icon"
              :title="$t('playbar.delete_from_playlist')"
              @click="deleteSong(item.id)"
              :src="delete_svg"
              v-if="options.showDeleteButton"
            />
          </div>
          <div
            class="song-album album-width font-color-standard"
            v-if="options.columns.album"
            :style="{
              width: alWidth + 'px !important',
            }"
            :title="
              item.al.tns?.length > 0
                ? item.al.name + '\n' + item.al.tns[0]
                : item.al.name
            "
          >
            <span v-if="item.al.name" @click="openAlbum(item.al.id)">
              {{ item.al.name }}
            </span>
            <span v-else>{{ $t("songs_table.unknown_album") }}</span>
            <span v-if="item.al.tns?.length > 0" @click="openAlbum(item.al.id)"
              >&nbsp;({{ item.al.tns[0] }})</span
            >
          </div>
          <div class="song-like" v-if="options.columns.like">
            <img
              v-if="likelist.includes(item.id)"
              class="like-img"
              :title="$t('playbar.cancel_like')"
              :src="likes_svg"
              @click="_toogleLike(item.id, true)"
            />
            <img
              v-else
              class="like-img g-icon"
              style="opacity: 0.65"
              :title="$t('playbar.like')"
              :src="unlikes_svg"
              @click="_toogleLike(item.id, false)"
            />
          </div>
          <div
            class="song-duration font-color-standard"
            v-if="options.columns.duration"
          >
            {{ formatTime(item.dt) }}
          </div>
          <div class="popularity" v-if="options.columns.popularity">
            <div
              class="popularity-bar"
              :style="{
                width: (item.pop / 100) * 50 + 'px',
              }"
            />
            <div class="popularity-track" />
          </div>
        </div>
      </div>
    </template>

    <template #slot-prepend>
      <slot name="slot-prepend" />
      <div
        v-if="options.slot_prepend?.showTableHeader"
        class="song-item table-header font-color-standard"
      >
        <div class="align-left table-header-left">
          <template v-if="isMultiSelect">
            <div class="index">
              <input
                type="checkbox"
                @change="handleMultiSelectHeader($event)"
              />
            </div>
          </template>
          <div v-else-if="options.columns.index" class="index">#</div>
          <div
            class="song-info title-title title-item"
            v-if="options.columns.title || options.columns.artist"
            @click="handleSort('info')"
          >
            {{ $t("songs_table.title") }}
            <img class="sort-icon" :src="currentSort('info').icon" />
            <span class="sort-text">
              {{ $t(currentSort("info").text) }}
            </span>
          </div>
        </div>
        <div class="align-right">
          <div class="set-album-width" @mousedown="handleResizeMouseDown" />
          <div
            class="album-width title-album title-item"
            :style="{
              width: alWidth + 'px !important',
            }"
            v-if="options.columns.album"
            @click="handleSort('album')"
          >
            {{ $t("songs_table.album") }}
            <img class="sort-icon" :src="currentSort('album').icon" />
            <span class="sort-text">
              {{ $t(currentSort("album").text) }}
            </span>
          </div>
          <div
            class="song-like title-like title-item"
            v-if="options.columns.like"
          >
            {{ $t("songs_table.like") }}
          </div>
          <div
            class="song-duration title-duration title-item"
            v-if="options.columns.duration"
            @click="handleSort('duration')"
          >
            {{ $t("songs_table.duration") }}
            <img class="sort-icon" :src="currentSort('duration').icon" />
          </div>
          <div
            class="popularity title-popularity title-item"
            v-if="options.columns.popularity"
            @click="handleSort('popularity')"
          >
            {{ $t("songs_table.popularity") }}
            <img class="sort-icon" :src="currentSort('popularity').icon" />
          </div>
        </div>
      </div>
    </template>

    <template #slot-append>
      <slot name="slot-append" />
    </template>

    <template
      #slot-index="{ index }"
      v-if="options.reelOptions?.showReels && options.mode === 'album'"
    >
      <div class="reel">
        <div class="reel-title">
          {{
            options.reelOptions.reels[first_tracks.indexOf(index)]
              .showreelName ?? $t("songs_table.unknown_name")
          }}
        </div>
        <div
          class="reel-artists"
          v-for="artist in options.reelOptions.reels[
            first_tracks.indexOf(index)
          ].otherArtists"
        >
          {{ artist }}
        </div>
      </div>
    </template>
  </YVirtualScroll>
</template>

<script lang="ts">
import { defineComponent, ref, useTemplateRef } from "vue";
import type { ComponentExposed } from "vue-component-type-helpers";
import YVirtualScroll from "@/components/base/YVirtualScroll.vue";
import type { SlotConfig } from "@/components/base/YVirtualScroll.interface";
import YPlaying from "@/components/base/YPlaying.vue";
import { useStore } from "vuex";
import type { ITrack } from "@/utils/tracks";
import { formatTime_mmss_From_ms } from "./time";
import { isLocal } from "@/utils/localTracks_renderer";
import { Like, Song } from "@/utils/api";
import {
  type ISongsTableProps,
  type SortRole,
  type ISortOptions,
  getSort,
  getNextPosition,
} from "./utils";
import { DownloadEvents } from "@/dual/download_renderer";
import { toRaw } from "vue";
import { PlayerEvents } from "@/dual/player";
import success_svg from "@/assets/success.svg";
import smalldownload_svg from "@/assets/smalldownload.svg";
import subscribe_svg from "@/assets/subscribe.svg";
import comment_svg from "@/assets/comment.svg";
import detail_svg from "@/assets/detail.svg";
import delete_svg from "@/assets/delete.svg";
import likes_svg from "@/assets/likes.svg";
import unlikes_svg from "@/assets/unlikes.svg";

export default defineComponent({
  components: {
    YVirtualScroll,
    YPlaying,
  },
  props: {
    options: {
      type: Object as () => ISongsTableProps,
      required: true,
    },
    isMultiSelect: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const virtualScroll =
      useTemplateRef<ComponentExposed<typeof YVirtualScroll>>("virtualScroll");
    const store = useStore();
    const selected = ref<Set<number>>(new Set<number>());

    return {
      formatTime: formatTime_mmss_From_ms,
      virtualScroll,
      player: store.state.player,
      login: store.state.login,
      setting: store.state.setting,
      download: store.state.download,
      selected,
    };
  },
  data() {
    return {
      nowPlayingId: 0,
      downloadedSongIds: [] as number[],
      slots: [] as SlotConfig[],
      first_tracks: [] as number[],
      success_svg,
      smalldownload_svg,
      subscribe_svg,
      comment_svg,
      detail_svg,
      delete_svg,
      likes_svg,
      unlikes_svg,
      sort: getSort(),
      alWidth: 200,
      lastSelectedIndex: -1,
    };
  },
  emits: ["sort"],
  computed: {
    likelist() {
      return this.login.likelist ?? [];
    },
  },
  mounted() {
    this.player.subscriber.on(
      this.options.id_for_subscribe,
      PlayerEvents.track,
      () => {
        this.nowPlayingId = this.player.currentTrack?.id ?? 0;
      },
    )?.();
    this.alWidth = this.setting.display.albumWidth;
    this.download.subscriber.on(
      this.options.id_for_subscribe,
      DownloadEvents.Complete,
      () => {
        this.downloadedSongIds = this.download.downloadedSongIds.slice();
      },
    )?.();
  },
  beforeUnmount() {
    this.download.subscriber.offAll(this.options.id_for_subscribe);
    this.player.subscriber.offAll(this.options.id_for_subscribe);
  },
  watch: {
    "options.reelOptions.showReels": {
      handler: "computeReels",
      immediate: true,
    },
    "options.reelOptions": {
      handler: "computeReels",
      immediate: true,
    },
    "options.slot_prepend": {
      handler: "updatePrepend",
      immediate: true,
    },
  },
  methods: {
    _toogleLike(id: number, status: boolean) {
      if (!id || isLocal(id) || this.isMultiSelect) return;

      Like.toggle(id, status).then((res) => {
        if (res?.code === 200) {
          this.login.reloadLikelist();
        } else {
          console.error(
            "Failed to toggle like status",
            JSON.stringify(res, null, 4),
          );
        }
      });
    },
    async downloadSong(track: ITrack) {
      if (!track.id || isLocal(track.id) || this.isMultiSelect) return;

      const url = await Song.getUrl(track.id, this.setting.download.quality);

      this.download.add(url, track, this.setting.download.path);
    },
    openComment(id: number) {
      if (!id || isLocal(id) || this.isMultiSelect) return;
      this.$router.push({ path: `/comment/song/${id}` });
    },
    openArtist(id: number) {
      if (!id || isLocal(id) || this.isMultiSelect) return;
      this.$router.push(`/artist/${id}`);
    },
    openAlbum(id: number) {
      if (!id || isLocal(id) || this.isMultiSelect) return;
      this.$router.push(`/album/${id}`);
    },
    open_addToPlaylist(id: number) {
      if (!id || isLocal(id) || this.isMultiSelect) return;
      window.postMessage({
        type: "song-open-add-to-playlist",
        data: { ids: [id] },
      });
    },
    openContextMenu(event: MouseEvent, item: ITrack, type: "toogle" | "show") {
      if (this.isMultiSelect) return;
      event.preventDefault();
      let from = -1;
      if (this.options.editable && this.options.mode === "playlist") {
        from = this.options.playlistId ?? -1;
      }
      window.postMessage({
        type:
          type === "show"
            ? "song-open-context-menu"
            : "song-toogle-context-menu",
        data: {
          x: event.clientX,
          y: event.clientY,
          track: JSON.stringify(toRaw(item)),
          from,
        },
      });
    },
    handleDoubleClick(item: ITrack) {
      if (this.isMultiSelect) return;
      if (this.options.allow_play_all && this.setting.play.dbclick === "all") {
        this.player.playlist = this.options.songs.slice();
      }
      this.player.playTrack(item);
    },
    deleteSong(id: number) {
      if (!this.options.editable) return;
      this.options.songs = this.options.songs.filter((item) => item.id !== id);
      if (this.options.id_for_subscribe === "YPlaybar.vue")
        this.player.deleteTrack(id);
    },
    scrollToCurrentTrack(noAnimation = false) {
      const index = this.options.songs.findIndex(
        (item) => item.id === this.nowPlayingId,
      );
      if (index !== -1) {
        (this.virtualScroll as any)?.scrollToIndex(index, noAnimation);
      }
    },
    computeReels() {
      if (
        !this.options.reelOptions?.showReels ||
        this.options.mode !== "album"
      ) {
        this.first_tracks = [];
        this.slots = this.getDefaultSlot().slice();
        return;
      }

      const NAME_HEIGHT = 29;
      const ARTISTS_HEIGHT = 26;
      const SPACE_HEIGHT = 15;

      const reels = this.options.reelOptions.reels;
      const songs = this.options.songs;

      const first_tracks = songs.filter((item) => item.songInReelIndex === 0);

      this.first_tracks = [];
      this.slots = this.getDefaultSlot().slice();

      reels?.forEach((reel, index) => {
        const song = first_tracks[index];
        const slotIndexInSongs = songs.indexOf(song);

        this.first_tracks.push(slotIndexInSongs);
        this.slots.push({
          type: "index",
          index: slotIndexInSongs,
          height:
            SPACE_HEIGHT +
            NAME_HEIGHT +
            ARTISTS_HEIGHT * reel.otherArtists.length,
        });
      });
    },
    handleSort(key: "info" | "album" | "duration" | "popularity") {
      const ori_position = this.sort[key].position;
      (Object.keys(this.sort) as Array<typeof key>).forEach((k) => {
        this.sort[k].position = "default";
      });
      this.sort[key].position = getNextPosition(ori_position, key);

      this.sortTracks(this.sort[key].position);
    },

    sortTracks(sortRole: SortRole) {
      switch (sortRole) {
        case "default":
          this.options.songs.sort((a, b) => a.originalIndex - b.originalIndex);
          break;
        case "title_asc":
          this.options.songs.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "title_desc":
          this.options.songs.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "artist_asc":
          this.options.songs.sort((a, b) =>
            a.ar[0].name?.localeCompare(b.ar[0].name),
          );
          break;
        case "artist_desc":
          this.options.songs.sort((a, b) =>
            b.ar[0].name?.localeCompare(a.ar[0].name),
          );
          break;
        case "album_asc":
          this.options.songs.sort((a, b) =>
            a.al.name?.localeCompare(b.al.name),
          );
          break;
        case "album_desc":
          this.options.songs.sort((a, b) =>
            b.al.name?.localeCompare(a.al.name),
          );
          break;
        case "duration_asc":
          this.options.songs.sort((a, b) => a.dt - b.dt);
          break;
        case "duration_desc":
          this.options.songs.sort((a, b) => b.dt - a.dt);
          break;
        case "popularity_asc":
          this.options.songs.sort((a, b) => a.pop - b.pop);
          break;
        case "popularity_desc":
          this.options.songs.sort((a, b) => b.pop - a.pop);
          break;
      }
    },
    currentSort(
      key: "info" | "album" | "duration" | "popularity",
    ): ISortOptions {
      return this.sort[key].options.filter(
        (item) => item.role === this.sort[key].position,
      )[0];
    },
    handleResizeMouseDown(event: MouseEvent) {
      const startX = event.clientX;
      let dx = 0;
      const originalWidth = this.alWidth;
      const onMouseMove = (e: MouseEvent) => {
        dx = -e.clientX + startX;
        try {
          this.setting.display.albumWidth = originalWidth + dx;
          this.alWidth = this.setting.display.albumWidth;
        } catch {
          // do nothing
        }
      };
      document.addEventListener("mousemove", onMouseMove);

      const removeListener = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", removeListener);
      };
      document.addEventListener("mouseup", removeListener);
    },
    handlePlaylistSort(newValue: ITrack[]) {
      if (!this.options.editable || this.isMultiSelect) return;
      this.$emit("sort", newValue);
    },
    handleItemClick(event: MouseEvent, item: ITrack, index: number) {
      if (!this.isMultiSelect) return;

      if (event.shiftKey && this.lastSelectedIndex !== -1) {
        // 处理范围选择
        const start = Math.min(this.lastSelectedIndex, index);
        const end = Math.max(this.lastSelectedIndex, index);
        for (let i = start; i <= end; i++) {
          this.selected.add(this.options.songs[i].id);
        }
      } else {
        this.toggleSelect(item.id);
      }
      this.lastSelectedIndex = index;
    },
    toggleSelect(id: number) {
      if (this.selected.has(id)) {
        this.selected.delete(id);
      } else {
        this.selected.add(id);
      }
    },
    handleMultiSelect(event: Event, id: number) {
      event.stopPropagation();
      if (!this.isMultiSelect) return;
      const target = event.target as HTMLInputElement;
      if (target.checked) {
        this.selected.add(id);
      } else {
        this.selected.delete(id);
      }
    },
    handleMultiSelectHeader(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.checked) {
        this.selectAll();
      } else {
        this.clearSelect();
      }
    },
    selectAll() {
      this.selected.clear();
      this.options.songs.forEach((item) => {
        this.selected.add(item.id);
      });
    },
    clearSelect() {
      this.selected.clear();
    },
    getDefaultSlot() {
      let prependHeight = 0;
      const TABLE_HEADER_HEIGHT = 40;
      if (this.options.showHeader) {
        if (this.options.slot_prepend) {
          if (this.options.slot_prepend.showTableHeader)
            prependHeight += TABLE_HEADER_HEIGHT;
        }
        if (this.options.slot_prepend?.showPrepend) {
          prependHeight += this.options.slot_prepend.prependHeight;
        }
      }
      const defaultSlot: SlotConfig[] = [
        {
          type: "prepend",
          height: prependHeight,
        },
        {
          type: "append",
          height: 5,
        },
      ];
      return defaultSlot;
    },
    updatePrepend() {
      this.slots = this.getDefaultSlot().slice();
    },
  },
});
</script>

<style lang="scss" scoped>
.virtual-scroll {
  // width: 100%;
  // height: calc(100vh - 65px - 85px);

  .song-item,
  .drag-clone {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    width: 100%;
    text-align: left;
    overflow: hidden;
    border-radius: 10px;

    .menu {
      display: none;
      gap: 10px;
      padding-right: 20px;

      .menu-img {
        width: 18px;
        height: 18px;
        cursor: pointer;
        opacity: 0.62;

        &:hover {
          opacity: 1;
        }
      }

      .menu-img-comment {
        width: 19px;
        height: 19px;
        opacity: 0.7;
      }
    }

    &:hover {
      background-color: rgba(var(--foreground-color-rgb), 0.1);
      .menu {
        display: flex;
      }
    }

    .align-left {
      display: flex;
      align-items: center;
      flex-direction: row;
      overflow: hidden;
      padding-right: 15px;

      .song-info {
        display: flex;
        overflow: hidden;
        flex-direction: column;
        justify-content: center;
        .song-name {
          font-size: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .song-name-now-playing {
          font-weight: bold;
        }
        .song-artist {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          .success-img {
            width: 14px;
            height: 14px;
            margin-bottom: -2px;
          }
          .artist-name {
            cursor: pointer;
            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .title-title {
        width: 100%;
        justify-content: start !important;
        padding: 0 0 0 5px;
      }

      .index {
        min-width: 55px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        input {
          cursor: pointer;
          height: 15px;
          width: 15px;
        }
      }

      .song-img {
        width: 40px;
        height: 40px;
        border-radius: 5px;
        margin-right: 15px;
      }

      .no-index {
        margin-left: 15px;
      }
    }

    .align-right {
      display: flex;
      flex-direction: row;

      .set-album-width {
        width: 10px;
        height: 25px;
        cursor: ew-resize;
      }

      .album-width {
        width: 200px;
      }
      .song-album {
        font-size: 15px;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
      .title-album {
        display: flex;
        align-items: center;
        padding-left: 5px;
        &:hover {
          text-decoration: none;
        }
      }

      .song-like {
        width: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        .like-img {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      }
      .title-like {
        cursor: unset;
        &:hover {
          background: transparent;
        }
      }

      .song-duration {
        display: flex;
        padding-left: 5px;
        text-wrap: nowrap;
        align-items: center;
        font-size: 14px;
        width: 60px;
        .sort-icon {
          margin: 0 0 0 2px !important;
        }
      }

      .title-duration {
        width: 50px;
        margin-right: 10px;
        font-size: 16px;
      }

      .popularity {
        display: flex;
        align-items: center;
        padding-left: 5px;
        width: 60px;
        position: relative;

        .popularity-bar {
          position: absolute;
          height: 4px;
          background-color: rgba(var(--highlight-color-rgb), 1);
          border-radius: 5px;
        }

        .popularity-track {
          width: 50px;
          height: 4px;
          background-color: rgba(var(--foreground-color-rgb), 0.321);
          border-radius: 5px;
        }
      }
      .title-popularity {
        transform: none;
        .sort-icon {
          margin: 0 0 0 2px !important;
        }
      }
    }
  }
  .table-header {
    .table-header-left {
      width: 100%;
    }
    .title-item {
      display: flex;
      align-items: center;
      flex-direction: row !important;
      height: 27px;
      border-radius: 5px;
      cursor: pointer;
      &:hover {
        background: rgba(var(--foreground-color-rgb), 0.1);
        .sort-icon {
          display: unset;
        }
        .sort-text {
          display: unset;
        }
      }
      .sort-icon {
        display: none;
        width: 14px;
        margin: 0 0 0 13px;
        opacity: 0.6;
      }
      .sort-text {
        display: none;
      }
    }
    margin-top: 3px;
    height: 40px;
    border-radius: 0;
    &:hover {
      background-color: transparent;
    }
  }
}

.reel {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 15px 0 0 20px;
  overflow: hidden;

  .reel-title {
    height: 29px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
  .reel-artists {
    height: 26px;
    font-size: 15px;
    color: var(--font-color-standard);
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
}
</style>
