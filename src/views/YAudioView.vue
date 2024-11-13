<template>
  <div class="main font-color-main">
    <div class="gain">
      <input
        type="range"
        min="0"
        max="3"
        step="0.1"
        v-model="currentGain"
        :style="{
          width: '321px',
        }"
      />
    </div>
    {{ currentGain }}
    <div class="apply" @click="applyGain" style="cursor: pointer">点击应用</div>
  </div>
</template>

<script lang="ts">
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
      this.player._gainNode!.gain.value = this.currentGain!;
    },
  },
  mounted() {
    this.currentGain = this.player._gainNode?.gain.value;
    this.player.subscriber.on({
      id: "YAudioView",
      type: "gain",
      func: () => {
        this.currentGain = this.player._gainNode?.gain.value;
      },
    });
  },
  beforeUnmount() {
    this.player.subscriber.offAll("YAudioView");
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
