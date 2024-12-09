import { defineComponent, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YCloseWindow",
  setup() {
    const store = useStore();
    const window = ref<InstanceType<typeof YWindow> | null>();
    return {
      setting: store.state.setting,
      window,
    };
  },
  data() {
    return {
      closeBehavior: "minimize" as "minimize" | "quit",
      closeAlwaysAsk: false,
    };
  },
  components: {
    YWindow,
  },
  mounted() {
    this.closeBehavior = this.setting.titleBar.closeButton;
    this.closeAlwaysAsk = this.setting.titleBar.closeAlwaysAsk;
  },
  beforeUnmount() {
    this.window = null;
  },
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    setClose(val: "minimize" | "quit") {
      this.closeBehavior = val;
      this.setting.titleBar.closeButton = val;
    },
    setAlwaysAsk(val: boolean) {
      this.closeAlwaysAsk = val;
      this.setting.titleBar.closeAlwaysAsk = val;
    },
    ensure() {
      if (window.electron?.isElectron) {
        window.electron.ipcRenderer.send(
          this.closeBehavior === "minimize" ? "close" : "quit"
        );
        this.window?.closeWindow();
      }
    },
    cancel() {
      this.window?.closeWindow();
    },
  },
});
