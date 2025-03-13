<template>
  <YVirtualScroll
    :items="options.songs"
    :item-height="60"
    :slots="slots"
    class="font-color-main virtual-scroll g-scrollable"
    ref="virtualScroll"
  >
    <template #item="{ item, index: item_index }">
      <!-- 歌曲 -->
      <div
        class="song-item"
        @contextmenu="openContextMenu($event, item, 'show')"
        @dblclick="handleDoubleClick(item)"
      >
        <div class="align-left">
          <div class="index font-color-standard" v-if="options.columns.index">
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
                options.mode === "album" && options.reelOptions?.showReels
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
            class="song-album font-color-standard"
            v-if="options.columns.album"
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
            <span v-if="item.al.tns?.length > 0"
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
import { defineComponent, useTemplateRef } from "vue";
import type { ComponentExposed } from "vue-component-type-helpers";
import YVirtualScroll from "@/components/base/YVirtualScroll.vue";
import type { SlotConfig } from "@/components/base/YVirtualScroll.interface";
import YPlaying from "@/components/base/YPlaying.vue";
import { useStore } from "vuex";
import type { ITrack } from "@/utils/tracks";
import { formatTime_mmss_From_ms } from "./time";
import { isLocal } from "@/utils/localTracks_renderer";
import { Like, Song } from "@/utils/api";
import { type ISongsTableProps } from "./types";
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
  },
  setup() {
    const virtualScroll =
      useTemplateRef<ComponentExposed<typeof YVirtualScroll>>("virtualScroll");
    const store = useStore();

    return {
      formatTime: formatTime_mmss_From_ms,
      virtualScroll,
      player: store.state.player,
      login: store.state.login,
      setting: store.state.setting,
      download: store.state.download,
    };
  },
  data() {
    const defaultSlot: SlotConfig[] = [
      {
        type: "prepend",
        height: this.options.showHeader ? 235 : 0,
      },
      {
        type: "append",
        height: 5,
      },
    ];
    return {
      nowPlayingId: 0,
      downloadedSongIds: [] as number[],
      defaultSlot: defaultSlot,
      slots: defaultSlot as SlotConfig[],
      first_tracks: [] as number[],
      success_svg,
      smalldownload_svg,
      subscribe_svg,
      comment_svg,
      detail_svg,
      delete_svg,
      likes_svg,
      unlikes_svg,
    };
  },
  computed: {
    likelist() {
      return this.login.likelist ?? [];
    },
  },
  mounted() {
    this.nowPlayingId = this.player.currentTrack?.id ?? 0;
    this.player.subscriber.on(
      this.options.id_for_subscribe,
      PlayerEvents.track,
      () => {
        this.nowPlayingId = this.player.currentTrack?.id ?? 0;
      },
    );
    this.downloadedSongIds = this.download.downloadedSongIds.slice();
    this.download.subscriber.on(
      this.options.id_for_subscribe,
      DownloadEvents.Complete,
      () => {
        this.downloadedSongIds = this.download.downloadedSongIds.slice();
      },
    );
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
  },
  methods: {
    _toogleLike(id: number, status: boolean) {
      if (!id || isLocal(id)) return;

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
      if (!track.id || isLocal(track.id)) return;

      const url = await Song.getUrl(track.id, this.setting.download.quality);

      this.download.add(url, track, this.setting.download.path);
    },
    openComment(id: number) {
      if (!id || isLocal(id)) return;
      this.$router.push({ path: `/comment/song/${id}` });
    },
    openArtist(id: number) {
      if (!id || isLocal(id)) return;
      this.$router.push(`/artist/${id}`);
    },
    openAlbum(id: number) {
      if (!id || isLocal(id)) return;
      this.$router.push(`/album/${id}`);
    },
    open_addToPlaylist(id: number) {
      if (!id || isLocal(id)) return;
      window.postMessage({
        type: "song-open-add-to-playlist",
        data: { ids: [id] },
      });
    },
    openContextMenu(event: MouseEvent, item: ITrack, type: "toogle" | "show") {
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
        this.slots = this.defaultSlot.slice();
        return;
      }

      const NAME_HEIGHT = 29;
      const ARTISTS_HEIGHT = 26;
      const SPACE_HEIGHT = 15;

      const reels = this.options.reelOptions.reels;
      const songs = this.options.songs;

      const first_tracks = songs.filter((item) => item.songInReelIndex === 0);

      this.first_tracks = [];
      this.slots = this.defaultSlot.slice();

      reels.forEach((reel, index) => {
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
  },
});
</script>

<style lang="scss" scoped>
.virtual-scroll {
  // width: 100%;
  // height: calc(100vh - 65px - 85px);

  .song-item {
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

      .index {
        min-width: 55px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
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

      .song-album {
        width: 200px;
        padding-right: 20px;
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

      .song-like {
        width: 50px;
        .like-img {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      }

      .song-duration {
        font-size: 14px;
        width: 70px;
      }

      .popularity {
        display: flex;
        align-items: center;
        width: 60px;
        position: relative;
        transform: translateY(-2px);

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
    }
  }
}

.reel {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 15px 0 0 20px;

  .reel-title {
    height: 29px;
  }
  .reel-artists {
    height: 26px;
    font-size: 15px;
    color: var(--font-color-standard);
  }
}
</style>
