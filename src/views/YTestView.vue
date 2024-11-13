<template>
  <div class="display">
    <div class="font-color-main" @click="$router.push({ path: '/audio/test' })">
      点击跳转到音频调试界面
    </div>
    <YListRandom/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import YSongsTable from "@/components/YSongsTable.vue";
import YListRandom from "@/components/base/YListRandom.vue";

export default defineComponent({
  name: "YTestView",
  components: {
    YSongsTable,
    YListRandom,
  },
  setup() {
    const store = useStore();

    return {
      player: store.state.player,
      setting: store.state.setting,
      download: store.state.download,
    };
  },
  computed: {},
  data() {
    return {};
  },
  methods: {},
  async mounted() {},
  beforeUnmount() {},
});
</script>

<style lang="scss" scoped>
.display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .scrollable {
    width: 100%;
    height: 100%;
  }
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}
</style>
