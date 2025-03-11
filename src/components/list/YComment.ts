import { defineComponent } from "vue";
import YPage from "@/components/base/YPage.vue";
import { YCommentC, type Types } from "@/dual/YCommentC";
import { formatDate_yyyymmdd } from "@/utils/time";
import YLoading from "@/components/base/YLoading.vue";

export default defineComponent({
  name: "YComment",
  props: {
    type: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    YPage,
    YLoading,
  },
  watch: {
    type() {
      this.refresh();
    },
    id() {
      this.refresh();
    },
  },
  data() {
    return {
      cmt: new YCommentC(this.type as Types, this.id),
      loading: true,
    };
  },
  methods: {
    _formatDate_yyyymmdd(time: number) {
      return formatDate_yyyymmdd(time);
    },
    openUserPage(id: number | string) {
      this.$router.push({ path: `/user/${id}` });
    },
    refresh() {
      this.loading = true;
      this.cmt = new YCommentC(this.type as Types, this.id);
      this.cmt.initData().then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.cmt.initData().then(() => {
      this.loading = false;
    });
  },
});
