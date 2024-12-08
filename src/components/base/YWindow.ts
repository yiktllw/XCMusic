import { defineComponent } from "vue";

export default defineComponent({
  name: "YWindow",
  data() {
    return {
      showWindow: true,
    };
  },
  emits: ["new-window-state"],
  watch: {
    showWindow(val) {
      this.$emit("new-window-state", val);
    },
  },
  methods: {
    toogleWindow() {
      this.showWindow = !this.showWindow;
    },
    displayWindow() {
      this.showWindow = true;
    },
    closeWindow() {
      this.showWindow = false;
    },
  },
  mounted() {},
});
