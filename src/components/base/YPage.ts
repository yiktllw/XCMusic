import type { YPageC } from "@/dual/YPageC";
import { defineComponent, type PropType } from "vue";
export default defineComponent({
  name: "YPage",
  emits: ["change"],
  data() {
    return {
      tempPage: 1,
    };
  },
  props: {
    modelValue: {
      type: Object as PropType<YPageC>,
      required: true,
    },
  },
  computed: {
    page(): YPageC {
      return this.modelValue;
    },
    canPrevious(): boolean {
      return this.page.current > 1;
    },
    canNext(): boolean {
      if (this.page._unknown_page) {
        return this.page._allow_page_increase;
      }
      return this.page.current < this.page.total;
    },
  },
  watch: {
    "page.current"(newValue: number) {
      this.tempPage = newValue;
    },
  },
  mounted() {
    this.tempPage = this.page.current;
  },
  methods: {
    emitPageChange(reason: string) {
      this.$emit("change", {
        page: this.page.current,
        total: this.page.total,
        unknown: Boolean(this.page._unknown_page),
        reason,
      });
    },
    selectPage(page: number) {
      this.page.current = page;
      this.emitPageChange("click-page");
    },
    previousPage() {
      if (!this.canPrevious) return;
      this.page.previous();
      this.emitPageChange("click-prev");
    },
    nextPage() {
      if (!this.canNext) return;
      this.page.next();
      this.emitPageChange("click-next");
    },
    goto() {
      const totalForInput = this.page._unknown_page
        ? Number.MAX_SAFE_INTEGER
        : this.page.total;
      let target = Math.floor(Number(this.tempPage));

      if (!Number.isFinite(target) || target < 1) {
        target = 1;
      }
      if (target > totalForInput) {
        target = totalForInput;
      }

      this.tempPage = target;
      this.page.current = target;
      this.emitPageChange("input-goto");
    },
  },
});
