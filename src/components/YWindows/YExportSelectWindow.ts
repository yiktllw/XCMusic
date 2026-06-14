import { defineComponent, ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";

export interface IExportOptions {
  settings: boolean;
  playHistory: boolean;
  downloadedSongs: boolean;
}

export default defineComponent({
  name: "YExportSelectWindow",
  components: {
    YWindow,
  },
  props: {
    options: {
      type: Object as () => IExportOptions,
      required: true,
    },
    callback: {
      type: Function as unknown as () => (opts: IExportOptions) => void,
      required: true,
    },
    titleKey: {
      type: String,
      default: "setting_view.about.export_user_data",
    },
    disabledOptions: {
      type: Object as () => IExportOptions,
      default: () => ({
        settings: false,
        playHistory: false,
        downloadedSongs: false,
      }),
    },
  },
  emits: ["new-window-state"],
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>(null);
    return { window };
  },
  data() {
    return {
      selected: { ...this.options } as IExportOptions,
    };
  },
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    cancel() {
      this.window?.closeWindow();
    },
    confirm() {
      this.callback({ ...this.selected });
      this.window?.closeWindow();
    },
  },
});
