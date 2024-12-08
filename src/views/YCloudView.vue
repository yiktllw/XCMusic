<template>
  <!--  音乐云盘界面  -->
  <div class="main">
    <div class="title font-color-main">
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
        {{ $t("playlist_view.download") }}
      </button>
    </div>
    <YSongsTable
      v-model="tracks"
      id="CloudView"
      :resortable="false"
      :show-header="false"
      :show-track-popularity="false"
    />
    <YPage v-model="page" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { User } from "@/utils/api";
import { useStore } from "vuex";
import { ITrack, Tracks } from "@/utils/tracks";
import YPage from "@/components/base/YPage.vue";
import { YPageC } from "@/dual/YPageC";
import { YColor } from "@/utils/color";
import { Message } from "@/dual/YMessageC";

export default defineComponent({
  name: "YCloudView",
  setup() {
    const store = useStore();
    return {
      login: store.state.login,
      download: store.state.download,
      player: store.state.player,
    };
  },
  components: {
    YSongsTable,
    YPage,
  },
  mounted() {
    const color = YColor.stringToHexColor("CLOUD");
    YColor.setBackgroundColorHex2(color);
    this.fetchTracks(true);
  },
  beforeUnmount() {},
  data() {
    return {
      tracks: [] as ITrack[],
      page: new YPageC(1),
    };
  },
  watch: {
    "page.current"() {
      this.fetchTracks();
    },
  },
  methods: {
    fetchTracks(newPage = false) {
      const limit = 50;
      User.getCloudInfo({
        cookie: this.login.cookie,
        limit: limit,
        offset: (this.page.current - 1) * limit,
      }).then((res) => {
        this.tracks = new Tracks({
          url: "/user/cloud",
          tracks: res.data,
        }).tracks;

        if (newPage) {
          this.page = new YPageC(Math.ceil(res.count / limit));
        }
      });
    },
    downloadAll() {
      User.getAllCloudTracks().then((res) => {
        const allTracks = new Tracks({
          url: "/user/cloud",
          tracks: res,
        }).tracks;

        this.download.addList(allTracks);
        Message.post("success", "localsongs.downloading", true);
      });
    },
    playAll() {
      User.getAllCloudTracks().then((res) => {
        const allTracks = new Tracks({
          url: "/user/cloud",
          tracks: res,
        }).tracks;

        this.player.playAll(allTracks);
        Message.post("success", "context.playAll", true);
      });
    },
    addToQueue() {
      User.getAllCloudTracks().then((res) => {
        const allTracks = new Tracks({
          url: "/user/cloud",
          tracks: res,
        }).tracks;

        this.player.addPlaylist(allTracks);
        Message.post(
          "success",
          "message.playlist_view.added_to_playlist",
          true
        );
      });
    },
  },
});
</script>

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
