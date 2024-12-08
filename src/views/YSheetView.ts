import { defineComponent } from "vue";
import { useStore } from "vuex";
import { Song } from "@/utils/api";
import YPage from "@/components/base/YPage.vue";
import { YPageC } from "@/dual/YPageC";
import { YColor } from "@/utils/color";
import { ISheet } from "@/dual/YSheetView";

export default defineComponent({
  name: "YSheetView",
  props: {
    sheetId: {
      required: true,
      type: Number,
    },
  },
  components: {
    YPage,
  },
  data() {
    return {
      sheet: [] as ISheet[],
      page: new YPageC(1),
      scrollInterval: null as NodeJS.Timeout | null,
    };
  },
  setup() {
    const store = useStore();
    return {
      login: store.state.login,
    };
  },
  watch: {
    sheetId() {
      this.getSheet();
    },
    "page.current"() {
      this.$nextTick(() => {
        const scrollDom = document.getElementById("yscroll-display-area");
        scrollDom?.scrollTo({
          top: 0,
          behavior: "auto",
        });
      });
    },
  },
  methods: {
    async getSheet() {
      Song.getSheetDetail(this.sheetId).then((res) => {
        if (!res?.data) return;
        this.sheet = res.data;
        this.sheet = this.sheet.sort((a, b) => a.id - b.id);
        this.page = new YPageC(this.sheet.length > 0 ? this.sheet.length : 1);
      });
    },
    handleKeydown(e: KeyboardEvent) {
      if (this.scrollInterval) return;

      switch (e.key) {
        case "h":
        case "H":
        case "ArrowLeft":
          this.page.previous();
          break;
        case "l":
        case "L":
        case "ArrowRight":
          this.page.next();
          break;
        case "j":
        case "J":
        case "ArrowDown":
          this.startScrolling("DOWN");
          break;
        case "k":
        case "K":
        case "ArrowUp":
          this.startScrolling("UP");
          break;
      }
    },
    handleKeyup(e: KeyboardEvent) {
      switch (e.key) {
        case "j":
        case "J":
        case "k":
        case "K":
        case "ArrowUp":
        case "ArrowDown":
          this.stopScrolling();
          break;
      }
    },
    startScrolling(direction: "UP" | "DOWN") {
      this.scroll(direction);
      this.scrollInterval = setInterval(() => {
        this.scroll(direction);
      }, 1000 / 60);
    },
    stopScrolling() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },
    scroll(direction: "UP" | "DOWN") {
      const scrollDom = document.getElementById("yscroll-display-area");
      scrollDom?.scrollBy({
        top: direction === "UP" ? -14 : 14,
        behavior: "auto",
      });
    },
  },
  mounted() {
    this.getSheet();
    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("keyup", this.handleKeyup);
    YColor.setBackgroundColorTheme();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
    window.removeEventListener("keyup", this.handleKeyup);
    this.stopScrolling();
  },
});
