<template>
  <!--  音乐云盘界面  -->
  <div class="main">
    <div class="title font-color-main" ref="top_ref">
      {{ $t("cloud") }}
    </div>
    <div class="play-buttons">
      <button :tabindex="-1" class="play-button" @click="playAll">
        <img
          src="@/assets/play.svg"
          style="width: 15px; height: 15px; padding-right: 5px"
        />
        <span style="padding-bottom: 2px">
          {{ $t("context.playAll") }}
        </span>
      </button>
      <button :tabindex="-1" class="add-button" @click="addToQueue">
        <img
          class="g-icon"
          src="@/assets/addtoplaylist.svg"
          style="width: 15px; height: 15px; padding-right: 5px"
        />
        {{ $t("playlist_view.add_to_playlist") }}
      </button>
      <button :tabindex="-1" class="download-button" @click="downloadAll">
        <img
          class="g-icon"
          src="@/assets/download.svg"
          style="width: 15px; height: 15px; padding-right: 5px"
        />
        {{ $t("playlist_view.download_all") }}
      </button>
      <button
        :tabindex="-1"
        class="download-button"
        @click="downloadCurrentPage"
      >
        <img
          class="g-icon"
          src="@/assets/download.svg"
          style="width: 15px; height: 15px; padding-right: 5px"
        />
        {{ $t("playlist_view.download_current_page") }}
      </button>
    </div>
    <YSongsTable
      v-model="tracks"
      id="CloudView"
      :resortable="false"
      :show-header="false"
      :show-track-popularity="false"
      v-if="!loading"
    />
    <YSongsTableSkeleton style="margin-top: 10px" v-else />
    <YPage v-model="page" />
  </div>
</template>

<script src="./YCloudView.ts" lang="ts"></script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  padding: 10px 20px 20px 20px;

  .title {
    text-align: left;
    font-size: 22px;
    font-weight: bold;
    margin: 20px 32.1px;
  }
  .play-buttons {
    display: inline-flex;
    width: 100%;
    height: 35px;
    margin: 0 0 10px 32.1px;

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
  }
}
</style>
