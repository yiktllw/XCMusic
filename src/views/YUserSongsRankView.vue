<template>
  <!-- 用户听歌排行界面 -->
  <YHeader :switcher="switcher" @new-position="handleNewPosition" />
  <div class="source-row" v-if="globalUserID === userId">
    <span class="source-title">{{
      $t("user_songs_rank_view.source_title")
    }}</span>
    <div class="source-switcher font-color-standard">
      <button
        :tabindex="-1"
        class="source-item"
        :class="{ active: source === 'netease' }"
        @click="handleNewSource('netease')"
      >
        {{ $t("user_songs_rank_view.source_netease") }}
      </button>
      <button
        :tabindex="-1"
        class="source-item"
        :class="{ active: source === 'local' }"
        @click="handleNewSource('local')"
      >
        {{ $t("user_songs_rank_view.source_local") }}
      </button>
      <button
        :tabindex="-1"
        class="source-item"
        :class="{ active: source === 'mixed' }"
        @click="handleNewSource('mixed')"
      >
        {{ $t("user_songs_rank_view.source_mixed") }}
      </button>
    </div>
    <div class="source-tip-wrap">
      <span class="source-tip">?</span>
      <div class="source-tooltip">
        {{ $t("user_songs_rank_view.source_tip") }}
      </div>
    </div>
  </div>
  <div
    class="local-options"
    v-if="source === 'local' && globalUserID === userId"
  >
    <button
      :tabindex="-1"
      class="option-item"
      :class="{ active: sortMode === 'count' }"
      @click="sortMode = 'count'"
    >
      {{ $t("user_songs_rank_view.sort_by_count") }}
    </button>
    <button
      :tabindex="-1"
      class="option-item"
      :class="{ active: sortMode === 'duration' }"
      @click="sortMode = 'duration'"
    >
      {{ $t("user_songs_rank_view.sort_by_duration") }}
    </button>
    <span class="option-divider">|</span>
    <button
      :tabindex="-1"
      class="option-item"
      :class="{ active: mergeAlbum }"
      @click="mergeAlbum = !mergeAlbum"
    >
      {{ $t("user_songs_rank_view.merge_album") }}
    </button>
  </div>
  <YSongsTable
    :show-track-album="false"
    :show-track-popularity="false"
    :show-header="true"
    :show-listen-count="true"
    :listen-count-mode="source === 'local' ? sortMode : 'count'"
    :local-play="true"
    :resortable="false"
    v-model="processedTracks"
    style="margin: 0px 20px 0px 10px"
    :id="'YUserSongRankView.vue'"
    v-if="!loading"
  />
  <YSongsTableSkeleton v-else style="margin-top: 20px" />
</template>

<script src="./YUserSongsRankView.ts" lang="ts"></script>

<style lang="scss" scoped>
.local-options {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 20px;
  font-size: 13px;
  color: var(--font-color-standard);
  user-select: none;

  .option-item {
    border: none;
    background: transparent;
    color: var(--font-color-standard);
    font-size: 13px;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;

    &:hover {
      color: var(--font-color-main);
    }

    &.active {
      color: var(--font-color-main);
      font-weight: 700;
      background-color: rgba(var(--foreground-color-rgb), 0.08);
    }
  }

  .option-divider {
    color: rgba(var(--foreground-color-rgb), 0.2);
    margin: 0 2px;
  }
}

.source-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px 24px;
  color: var(--font-color-standard);
  user-select: none;

  .source-title {
    font-size: 13px;
    white-space: nowrap;
  }

  .source-switcher {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    .source-item {
      border: none;
      background: transparent;
      color: var(--font-color-standard);
      font-size: 13px;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;

      &:hover {
        color: var(--font-color-main);
      }

      &.active {
        color: var(--font-color-main);
        font-weight: 700;
        background-color: rgba(var(--foreground-color-rgb), 0.08);
      }
    }
  }

  .source-tip-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;

    .source-tip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 600;
      cursor: help;
      color: var(--font-color-main);
      background-color: rgba(var(--foreground-color-rgb), 0.12);
    }

    .source-tooltip {
      position: absolute;
      left: 18px;
      top: -4px;
      width: 340px;
      padding: 8px 10px;
      border-radius: 8px;
      background: rgba(24, 24, 28, 0.96);
      color: #f3f3f3;
      font-size: 12px;
      line-height: 1.5;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition:
        opacity 0s,
        visibility 0s;
      z-index: 12;
    }

    &:hover .source-tooltip {
      opacity: 1;
      visibility: visible;
    }
  }
}
</style>
