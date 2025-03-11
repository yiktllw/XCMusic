import { defineComponent, type PropType, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import { type IConfirm } from "@/utils/globalMsg";

export default defineComponent({
  name: "YCreatePlaylist",
  components: {
    YWindow,
  },
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();

    return {
      window,
    };
  },
  props: {
    confirm: {
      type: Object as PropType<IConfirm>,
      required: true,
    },
  },
  data() {
    return {};
  },
  emits: ["new-window-state"],
  mounted() {
    if (this.confirm === null) {
      this.window?.closeWindow();
    }
  },
  beforeUnmount() {
    this.window = null;
  },
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    cancel() {
      this.window?.closeWindow();
    },
    ensure() {
      this.confirm.callback();
      this.window?.closeWindow();
    },
  },
});
