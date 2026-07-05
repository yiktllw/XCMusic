import { PlayerEvents } from "@/dual/player";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YAudioView",
  setup() {
    const store = useStore();
    return {
      player: store.state.player,
    };
  },
  data() {
    return {
      currentGain: 0 as number | undefined,
    };
  },
  methods: {
    applyGain() {
      this.player.setManualGain(this.currentGain ?? 1);
    },
  },
  mounted() {
    this.player.subscriber.on("YAudioView", PlayerEvents.gain, () => {
      this.currentGain = this.player.currentGain;
    })?.();
  },
  beforeUnmount() {
    this.player.subscriber.offAll("YAudioView");
  },
});
