import { defineComponent } from "vue";
import YHeader from "@/components/base/YHeader.vue";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { type ITrack } from "@/utils/tracks";
import { User } from "@/utils/api";
import { useStore } from "vuex";

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
  watch: {
    sortMode(val: "count" | "duration") {
      setStorage(StorageKey.User_SongsRank_SortMode, val);
    },
    mergeAlbum(val: boolean) {
      setStorage(StorageKey.User_SongsRank_MergeAlbum, val);
    },
    userId(val) {
      this.fetchUserSongsRank();
      this.checkUserId();
    },
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
    processedTracks() {
      let tracks = this.displayTracks;
      if (this.source !== "local") return tracks;

      // 按专辑合并
      if (this.mergeAlbum) {
        const albumMap = new Map<
          number,
          { track: ITrack; maxCount: number; listenMs: number; songMs: number }
        >();
        for (const t of tracks) {
          const albumId = t.al?.id ?? 0;
          const existing = albumMap.get(albumId);
          if (existing) {
            existing.maxCount = Math.max(existing.maxCount, t.playCount ?? 0);
            existing.listenMs += (t as any).li_duration_ms ?? 0;
            existing.songMs += t.dt ?? 0;
          } else {
            albumMap.set(albumId, {
              track: { ...t },
              maxCount: t.playCount ?? 0,
              listenMs: (t as any).li_duration_ms ?? 0,
              songMs: t.dt ?? 0,
            });
          }
        }
        tracks = Array.from(albumMap.values()).map((item) => {
          const t = { ...item.track };
          t.playCount = item.maxCount;
          (t as any).li_duration_ms = item.listenMs;
          t.dt = item.songMs;
          t.name = t.al?.name || t.name;
          return t;
        });
      }

      // 排序
      const sorted = [...tracks];
      if (this.sortMode === "duration") {
        sorted.sort(
          (a, b) =>
            ((b as any).li_duration_ms ?? 0) - ((a as any).li_duration_ms ?? 0),
        );
      } else {
        sorted.sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0));
      }
      return sorted;
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
      sortMode:
        getStorage(StorageKey.User_SongsRank_SortMode) ??
        ("count" as "count" | "duration"),
      mergeAlbum: getStorage(StorageKey.User_SongsRank_MergeAlbum) ?? false,
      recentTracks: [] as ITrack[],
      alltimeTracks: [] as ITrack[],
      localRecentTracks: [] as ITrack[],
      localAlltimeTracks: [] as ITrack[],
      mixedRecentTracks: [] as ITrack[],
      mixedAlltimeTracks: [] as ITrack[],
      globalUserID: getStorage(StorageKey.LoginUserId) ?? 0,
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
      console.log(this.recentTracks);
    },
    checkUserId() {
      if (this.globalUserID !== this.userId) {
        this.sortMode = "count";
        this.mergeAlbum = false;
        this.source = "netease";
      } else {
        this.sortMode =
          getStorage(StorageKey.User_SongsRank_SortMode) ??
          ("count" as "count" | "duration");
        this.mergeAlbum =
          getStorage(StorageKey.User_SongsRank_MergeAlbum) ?? false;
        this.source = normalizeSongsRankSource(
          getStorage(StorageKey.User_SongsRank_Source),
        );
      }
    },
  },
  mounted() {
    this.fetchUserSongsRank();
    this.checkUserId();
  },
});
