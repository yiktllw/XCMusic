import { defineComponent } from "vue";
import { useStore } from "vuex";
import { useApi } from "@/utils/api";
import YArtistList from "@/components/list/YArtistList.vue";
import YPage from "@/components/base/YPage.vue";
import { YPageC } from "@/dual/YPageC";
import { YColor } from "@/utils/color";
import { IArtist } from "@/dual/YArtistList";

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
      this.page = new YPageC(0);
      this.page.onPageChange = () => {
        this.fetchData(this.page.current);
      };
      this.fetchData();
    },
    type() {
      this.page = new YPageC(0);
      this.page.onPageChange = () => {
        this.fetchData(this.page.current);
      };
      this.fetchData();
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
    };
  },
  methods: {
    async fetchData(page: number = 1) {
      if (!this.uid) return;
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
          if (!res) return;
          if (!res.more) this.page._allow_page_increase = false;
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
    YColor.setBackgroundColorTheme();
    this.page.onPageChange = () => {
      this.fetchData(this.page.current);
    };
    this.fetchData();
  },
});
