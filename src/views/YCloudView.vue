<template>
  <div class="main">
    <div class="title font-color-main">
      {{ $t("cloud") }}
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

export default defineComponent({
  name: "YCloudView",
  setup() {
    const store = useStore();
    return {
      login: store.state.login,
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
    margin: 20px 30px;
  }
}
</style>
