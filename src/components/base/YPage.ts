import { YPageC } from "@/dual/YPageC";
import { defineComponent, ref, watch } from "vue";
export default defineComponent({
  name: "YPage",
  data() {
    return {
      tempPage: 1,
    };
  },
  props: {
    modelValue: {
      type: YPageC,
      default: new YPageC(1),
    },
  },
  watch: {
    "page.current"(newVal) {
      this.page.current = newVal;
    },
  },
  setup(props) {
    const page = ref(props.modelValue);

    // 监听 modelValue 的变化
    watch(
      () => props.modelValue,
      (newValue) => {
        page.value = newValue;
      },
    );

    return {
      page,
    };
  },
  methods: {
    goto() {
      if (this.tempPage < 1) {
        this.tempPage = 1;
      } else if (this.tempPage > this.page.total) {
        this.tempPage = this.page.total;
      }
      this.page.current = this.tempPage;
    },
  },
});
