import YWindow from "@/components/base/YWindow.vue";
import { IEqualizer, equalizerFreqsDisplay } from "@/dual/player";
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YEqualizerWindow",
  components: {
    YWindow,
  },
  setup() {
    const window = ref<InstanceType<typeof YWindow> | null>();
    const store = useStore();
    const player = store.state.player;
    const setting = store.state.setting;

    return {
      window,
      player,
      setting,
    };
  },
  data() {
    let equalizer: IEqualizer = {
      _32Hz: 0,
      _64Hz: 0,
      _125Hz: 0,
      _250Hz: 0,
      _500Hz: 0,
      _1kHz: 0,
      _2kHz: 0,
      _4kHz: 0,
      _8kHz: 0,
      _16kHz: 0,
    };
    const eqkeys = Object.keys(equalizer) as Array<keyof IEqualizer>;
    const freaDisplay = equalizerFreqsDisplay;

    return {
      equalizer,
      eqkeys,
      freaDisplay,
    };
  },
  emits: ["new-window-state"],
  mounted() {
    this.equalizer = this.player.getEqualizer();
  },
  beforeUnmount() {
    this.window = null;
  },
  methods: {
    handleNewWindowState(val: boolean) {
      this.$emit("new-window-state", val);
    },
    apply() {
      try {
        this.setting.play.equalizer = Object.assign(this.equalizer);
        this.player.setEqualizer(this.equalizer);
      } catch (e) {
        console.error(e);
      }
    },
    reset() {
      this.equalizer = {
        _32Hz: 0,
        _64Hz: 0,
        _125Hz: 0,
        _250Hz: 0,
        _500Hz: 0,
        _1kHz: 0,
        _2kHz: 0,
        _4kHz: 0,
        _8kHz: 0,
        _16kHz: 0,
      };
      this.apply();
    },
  },
});
