<template>
  <!-- 下载管理界面 -->
  <div class="main">
    <!-- 下载管理器 -->
    <div class="manager-section">
      <div class="section-header">
        <h2 class="title">{{ $t("download.manager.title") }}</h2>
        <button
          @click="toggleManager"
          class="toggle-btn"
          :title="$t('download.manager.toggle')"
        >
          {{ showManagerContent ? "▼" : "▶" }}
        </button>
      </div>
      <YDownloadManager v-show="showManagerContent" />
    </div>

    <div class="title">
      {{ $t("localsongs.downloaded") }}
    </div>
    <YSongsTable
      :resortable="false"
      :canSendPlaylist="false"
      :showHeader="false"
      v-model="tracks"
      :showTrackPopularity="false"
      :id="'YLocalSongsView.vue'"
      v-if="!loading"
    />
    <YSongsTableSkeleton style="margin-top: 40px" v-else />
  </div>
</template>

<script src="./YDownloadView.ts" lang="ts"></script>

<style lang="scss" scoped>
.main {
  padding: 0;
  text-align: left;
  padding: 10px 20px 20px 20px;

  .manager-section {
    margin-bottom: 24px;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .title {
        width: inherit;
        color: var(--font-color-main);
        text-align: left;
        font-size: 22px;
        font-weight: bold;
        margin: 20px 30px;
      }

      .toggle-btn {
        background: none;
        border: 1px solid rgba(var(--foreground-color-rgb), 0.2);
        color: var(--font-color-main);
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        margin-right: 30px;

        &:hover {
          background: rgba(var(--foreground-color-rgb), 0.1);
        }
      }
    }
  }

  .title {
    width: inherit;
    color: var(--font-color-main);
    text-align: left;
    font-size: 22px;
    font-weight: bold;
    margin: 20px 30px;
  }
}
</style>
