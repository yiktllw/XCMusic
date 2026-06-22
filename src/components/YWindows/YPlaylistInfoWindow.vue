<template>
  <div class="playlist-info">
    <YWindow ref="window" @new-window-state="$emit('new-window-state', $event)">
      <template #header>
        <span class="window-title">
          {{
            type === "playlist"
              ? $t("playlist_info.playlist_info")
              : $t("playlist_info.album_info")
          }}
        </span>
      </template>
      <YScroll>
        <div class="playlist-info-content">
          <!-- 歌单/专辑名称 -->
          <div class="info-item">
            <div class="left">
              <span class="info-item-title">
                {{ $t("playlist_info.name") }} ：
              </span>
              <span class="info-item-content">{{ detail.name }}</span>
            </div>
            <div class="right">
              <img
                class="icon-copy g-icon"
                @click="copy(detail.name)"
                src="@/assets/copy.svg"
                :title="$t('playlist_info.click_to_copy')"
              />
            </div>
          </div>

          <!-- 歌单/专辑译名 -->
          <div
            class="info-item"
            v-if="detail.transName && detail.transName.length > 0"
          >
            <div class="left">
              <span class="info-item-title">
                {{ $t("playlist_info.tns_name") }} ：
              </span>
              <span class="info-item-content">{{
                detail.transName.slice(2, -1)
              }}</span>
            </div>
            <div class="right">
              <img
                class="icon-copy g-icon"
                @click="copy(detail.transName)"
                src="@/assets/copy.svg"
                :title="$t('playlist_info.click_to_copy')"
              />
            </div>
          </div>

          <!-- 创建者（歌单） -->
          <div
            class="info-item"
            v-if="type === 'playlist' && detail.creatorName"
          >
            <div class="left">
              <span class="info-item-title">
                {{ $t("playlist_info.creator") }} ：
              </span>
              <span class="info-item-content">
                <img class="avatar" :src="detail.creatorAvatar" />
                <span
                  class="underline"
                  @click="openUser(detail.creatorId)"
                  :title="$t('playlist_info.click_to_view')"
                >
                  {{ detail.creatorName }}
                </span>
              </span>
            </div>
            <div class="right">
              <img
                class="icon-copy g-icon"
                @click="copy(detail.creatorName)"
                src="@/assets/copy.svg"
                :title="$t('playlist_info.click_to_copy')"
              />
            </div>
          </div>

          <!-- 艺术家（专辑） -->
          <div
            class="info-item"
            v-if="type === 'album' && detail.artists.length > 0"
          >
            <div class="left">
              <span class="info-item-title">
                {{ $t("playlist_info.artist") }} ：
              </span>
              <div class="info-item-content artist-list">
                <span
                  v-for="(artist, index) in detail.artists"
                  :key="artist.id"
                >
                  <span
                    class="underline"
                    @click="openArtist(artist.id)"
                    :title="$t('playlist_info.click_to_view')"
                  >
                    {{ artist.name }}
                  </span>
                  <span v-if="index < detail.artists.length - 1"> / </span>
                </span>
              </div>
            </div>
            <div class="right">
              <img
                class="icon-copy g-icon"
                @click="copy(detail.artists.map((a) => a.name).join(' / '))"
                src="@/assets/copy.svg"
                :title="$t('playlist_info.click_to_copy')"
              />
            </div>
          </div>

          <!-- 创建时间/发行时间 -->
          <div class="info-item">
            <div class="left">
              <span class="info-item-title">
                {{
                  type === "playlist"
                    ? $t("playlist_info.created_time")
                    : $t("playlist_info.published_time")
                }}
                ：
              </span>
              <span class="info-item-content">{{ detail.createTime }}</span>
            </div>
          </div>

          <!-- 播放次数（歌单） -->
          <div class="info-item" v-if="detail.playCount > 0">
            <div class="left">
              <span class="info-item-title">
                {{ $t("playlist_info.play_count") }} ：
              </span>
              <span class="info-item-content">
                {{ detail.playCount.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- 歌曲数量 -->
          <div class="info-item">
            <div class="left">
              <span class="info-item-title">
                {{ $t("playlist_info.track_count") }} ：
              </span>
              <span class="info-item-content">{{ detail.trackCount }}</span>
            </div>
          </div>

          <!-- 歌单/专辑 ID -->
          <div class="info-item">
            <div class="left">
              <span class="info-item-title">
                {{ $t("playlist_info.id") }} ：
              </span>
              <span class="info-item-content">{{ detail.id }}</span>
            </div>
            <img
              class="icon-copy g-icon"
              @click="copy(detail.id.toString())"
              src="@/assets/copy.svg"
              :title="$t('playlist_info.click_to_copy')"
            />
          </div>

          <!-- 链接 -->
          <div class="info-item">
            <div class="left">
              <span class="info-item-title">
                {{ $t("playlist_info.link") }} ：
              </span>
              <span class="info-item-content link-text">
                {{
                  type === "playlist"
                    ? `https://music.163.com/playlist?id=${detail.id}`
                    : `https://music.163.com/album?id=${detail.id}`
                }}
              </span>
            </div>
            <img
              class="icon-copy g-icon"
              @click="
                copy(
                  type === 'playlist'
                    ? `https://music.163.com/playlist?id=${detail.id}`
                    : `https://music.163.com/album?id=${detail.id}`,
                )
              "
              src="@/assets/copy.svg"
              :title="$t('playlist_info.click_to_copy')"
            />
          </div>
        </div>
      </YScroll>
    </YWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import YScroll from "@/components/base/YScroll.vue";
import { Message } from "@/dual/YMessageC";
import { type IPlaylistDetail } from "@/views/YPlaylistViewNew/utils";

export default defineComponent({
  name: "YPlaylistInfo",
  props: {
    detail: {
      type: Object as () => IPlaylistDetail,
      required: true,
    },
    type: {
      type: String as () => "playlist" | "album",
      required: true,
    },
  },
  components: {
    YWindow,
    YScroll,
  },
  emits: ["new-window-state"],
  methods: {
    copy(text: string) {
      navigator.clipboard.writeText(text).then(
        () => {
          Message.post("success", "复制成功: " + text);
        },
        () => {
          Message.post("error", "复制失败: " + text);
        },
      );
    },
    openUser(userId: number) {
      this.$router.push(`/user/${userId}`);
    },
    openArtist(artistId: number) {
      this.$router.push(`/artist/${artistId}`);
    },
  },
});
</script>

<style lang="scss" scoped>
.playlist-info {
  display: flex;

  .playlist-info-content {
    padding: 10px;
    width: 480px;
    max-height: 432.1px;

    .info-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin: 10px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .cover {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        object-fit: cover;
      }
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin: 15px 10px;
      text-align: left;
      align-items: flex-start;

      .left {
        display: flex;
        align-items: first baseline;
        min-width: 0;
        flex: 1;
      }

      .info-item-title {
        width: 85px;
        min-width: 85px;
        white-space: nowrap;
        font-size: 16px;
        font-weight: bold;
      }

      .info-item-content {
        font-size: 16px;
        margin-left: 10px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        user-select: text;
        overflow: hidden;
        text-overflow: ellipsis;

        &.link-text {
          word-break: break-all;
        }

        .avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }
      }

      .icon-copy {
        width: 20px;
        height: 20px;
        cursor: pointer;
        opacity: 0.6;
        flex-shrink: 0;
        margin-left: 8px;

        &:hover {
          opacity: 1;
        }
      }
    }
  }
}

.underline {
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
