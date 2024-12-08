<template>
  <!-- 下载管理界面 -->
  <div class="main">
    <div class="title" v-if="downloading.length > 0">
      {{ $t("localsongs.downloading") }}
    </div>
    <div class="downloading font-color-high" v-if="downloading.length > 0">
      <div v-for="item in downloading" class="downloading-item">
        <div class="downloading-item-info">
          <div class="downloading-item-info-title">
            {{ item.track.name }}
          </div>
          <div class="downloading-item-info-progress">{{ item.percent }}%</div>
        </div>
        <div class="downloading-item-progress">
          <div
            class="downloading-item-progress-bar"
            :style="{ width: item.percent + '%' }"
          ></div>
        </div>
      </div>
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
    />
  </div>
</template>

<script src="./YDownloadView.ts" lang="ts"></script>

<style lang="scss" scoped>
.main {
  padding: 0;
  text-align: left;
  padding: 10px 20px 20px 20px;

  .title {
    width: inherit;
    color: var(--font-color-main);
    text-align: left;
    font-size: 22px;
    font-weight: bold;
    margin: 20px 30px;
  }

  .downloading {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    width: calc(100% - 20px);
    padding: 10px;

    .downloading-item {
      width: inherit;
      padding: 5px 0;
      display: flex;
      border-radius: 10px;

      &:hover {
        background-color: rgba(var(--foreground-color-rgb), 0.1);
      }

      .downloading-item-info {
        width: calc(100% - 10px);
        max-width: calc(100% - 30px);
        padding: 5px 15px;
        display: flex;
        justify-content: space-between;
        flex-direction: row;

        .downloading-item-info-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: calc(100% - 100px);
        }

        .downloading-item-info-progress {
          width: 50px;
          text-align: center;
        }
      }
    }
  }
}
</style>
