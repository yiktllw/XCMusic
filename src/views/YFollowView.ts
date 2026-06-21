import { defineComponent } from "vue";
import { useStore } from "vuex";
import { useApi } from "@/utils/api";
import YArtistList from "@/components/list/YArtistList.vue";
import YPage from "@/components/base/YPage.vue";
import { YPageC } from "@/dual/YPageC";

import { type IArtist } from "@/dual/YArtistList";

export default defineComponent({
  name: "YFollowView",
  props: {
    uid: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: "follows", // follows: 关注, followers: 粉丝
    },
  },
  components: {
    YArtistList,
    YPage,
  },
  watch: {
    uid() {
      this.resetPager();
      void this.fetchData();
    },
    type() {
      this.resetPager();
      void this.fetchData();
    },
  },
  setup() {
    const store = useStore();

    return {
      login: store.state.login,
    };
  },
  data() {
    return {
      users: [] as IArtist[],
      page: new YPageC(0),
      followRequestId: 0,
    };
  },
  methods: {
    resetPager() {
      this.page = new YPageC(0);
      this.page.onPageChange = () => {
        void this.fetchData(this.page.current);
      };
    },
    nextFollowRequestId() {
      this.followRequestId += 1;
      return this.followRequestId;
    },
    isLatestFollowRequest(requestId: number) {
      return requestId === this.followRequestId;
    },
    async fetchData(page: number = 1) {
      if (!this.uid) return;
      const requestId = this.nextFollowRequestId();
      const path =
        "/user/" + (this.type === "follows" ? "follows" : "followeds");
      const LIMIT = 30;
      const offset = (page - 1) * LIMIT;
      await useApi(path, {
        uid: this.uid,
        cookie: this.login.cookie,
        limit: LIMIT,
        offset: offset,
      })
        .then((res) => {
          if (!this.isLatestFollowRequest(requestId)) return;
          if (!res) return;
          this.page.setHasMore(Boolean(res.more));
          if (this.type === "follows") {
            this.users =
              res.follow?.map((item: { avatarUrl: string }) => {
                return {
                  ...item,
                  _picUrl: item.avatarUrl + "?param=130y130",
                };
              }) ?? [];
          } else {
            this.users =
              res.followeds?.map((item: { avatarUrl: string }) => {
                return {
                  ...item,
                  _picUrl: item.avatarUrl + "?param=130y130",
                };
              }) ?? [];
          }
        })
        .catch((err) => {
          console.error("fetchData error: ", err);
        });
    },
  },
  mounted() {
    this.resetPager();
    void this.fetchData();
  },
});
