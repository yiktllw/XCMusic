import { defineComponent } from "vue";
import YWindow from "@/components/base/YWindow.vue";

export default defineComponent({
  name: "YLoginWindow",
  setup() {
    return {};
  },
  emits: ["new-window-state"],
  props: {
    base64Image: {
      type: String,
      required: true,
    },
  },
  components: {
    YWindow,
  },
  data() {
    return {};
  },
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
  },
});
