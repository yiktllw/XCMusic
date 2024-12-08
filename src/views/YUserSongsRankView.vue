<template>
  <!-- 用户听歌排行界面 -->
  <YHeader :switcher="switcher" @new-position="handleNewPosition" />
  <YSongsTable
    :show-track-album="false"
    :show-track-popularity="false"
    :show-header="false"
    :show-listen-count="true"
    :local-play="true"
    :resortable="false"
    v-model="displayTracks"
    style="margin: 0px 20px 0px 10px"
    :id="'YUserSongRankView.vue'"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import YHeader from "@/components/base/YHeader.vue";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { ITrack } from "@/utils/tracks";
import { User } from "@/utils/api";
import { useStore } from "vuex";
import { YColor } from "@/utils/color";

export default defineComponent({
  name: "YUserSongsRank",
  props: {
    userId: {
      type: Number,
      required: true,
    },
  },
  components: {
    YHeader,
    YSongsTable,
  },
  setup() {
    const store = useStore();
    return {
      login: store.state.login,
    };
  },
  computed: {
    displayTracks() {
      return this.position === "recent"
        ? this.recentTracks
        : this.alltimeTracks;
    },
  },
  data() {
    return {
      switcher: [
        {
          num: 0,
          showNum: false,
          position: "recent",
          display: "user_songs_rank_view.last_week",
        },
        {
          num: 0,
          showNum: false,
          position: "alltime",
          display: "user_songs_rank_view.alltime",
        },
      ],
      position: "recent",
      recentTracks: [] as ITrack[],
      alltimeTracks: [] as ITrack[],
    };
  },
  methods: {
    handleNewPosition(position: string) {
      this.position = position;
    },
    async fetchUserSongsRank() {
      await User.songsRank(this.userId, "week").then((res) => {
        this.recentTracks = res;
      });
      await User.songsRank(this.userId, "alltime").then((res) => {
        this.alltimeTracks = res;
      });
    },
  },
  mounted() {
    this.fetchUserSongsRank();
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("songs rank"));
  },
});
</script>
