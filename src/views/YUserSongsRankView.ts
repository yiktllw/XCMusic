import { defineComponent } from "vue";
import YHeader from "@/components/base/YHeader.vue";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { type ITrack } from "@/utils/tracks";
import { User } from "@/utils/api";
import { useStore } from "vuex";
import { YColor } from "@/utils/color";
import YSongsTableSkeleton from "@/components/list/YSongsTableSkeleton.vue";
import { getStorage, setStorage, StorageKey } from "@/utils/render_storage";

const songsRankSources = ["netease", "local", "mixed"] as const;
type SongsRankSource = (typeof songsRankSources)[number];

function normalizeSongsRankSource(source: unknown): SongsRankSource {
  if (songsRankSources.includes(source as SongsRankSource)) {
    return source as SongsRankSource;
  }
  return "netease";
}

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
    YSongsTableSkeleton,
  },
  setup() {
    const store = useStore();
    return {
      login: store.state.login,
    };
  },
  computed: {
    displayTracks() {
      const isRecent = this.position === "recent";
      if (this.source === "local") {
        return isRecent ? this.localRecentTracks : this.localAlltimeTracks;
      }
      if (this.source === "mixed") {
        return isRecent ? this.mixedRecentTracks : this.mixedAlltimeTracks;
      }
      return isRecent ? this.recentTracks : this.alltimeTracks;
    },
  },
  data() {
    const source = normalizeSongsRankSource(
      getStorage(StorageKey.User_SongsRank_Source),
    );
    return {
      loading: true,
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
      source,
      recentTracks: [] as ITrack[],
      alltimeTracks: [] as ITrack[],
      localRecentTracks: [] as ITrack[],
      localAlltimeTracks: [] as ITrack[],
      mixedRecentTracks: [] as ITrack[],
      mixedAlltimeTracks: [] as ITrack[],
    };
  },
  methods: {
    handleNewPosition(position: string) {
      this.position = position;
    },
    handleNewSource(source: SongsRankSource) {
      this.source = source;
      setStorage(StorageKey.User_SongsRank_Source, source);
    },
    async fetchUserSongsRank() {
      this.loading = true;
      const [
        recent,
        alltime,
        localRecent,
        localAlltime,
        mixedRecent,
        mixedAlltime,
      ] = await Promise.all([
        User.songsRank(this.userId, "week"),
        User.songsRank(this.userId, "alltime"),
        User.localSongsRank("week"),
        User.localSongsRank("alltime"),
        User.combinedSongsRank(this.userId, "week"),
        User.combinedSongsRank(this.userId, "alltime"),
      ]);
      this.recentTracks = recent;
      this.alltimeTracks = alltime;
      this.localRecentTracks = localRecent;
      this.localAlltimeTracks = localAlltime;
      this.mixedRecentTracks = mixedRecent;
      this.mixedAlltimeTracks = mixedAlltime;
      this.loading = false;
    },
  },
  mounted() {
    this.fetchUserSongsRank();
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("songs rank"));
  },
});
