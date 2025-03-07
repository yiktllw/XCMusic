<template>
  <YVirtualScroll
    :items="songs"
    :item-height="60"
    :slots="[
      { type: 'prepend', height: 50 },
      { type: 'append', height: 50 },
      { type: 'index', index: 5, height: 30 },
    ]"
    class="font-color-main virtual-scroll g-scrollable"
  >
    <template #item="{ item, index }">
      <!-- 歌曲 -->
      <div :style="{ height: '60px' }">{{ item.name }}</div>
    </template>

    <template #slot-prepend>
      <div style="height: 50px">前置内容</div>
    </template>

    <template #slot-append>
      <div style="height: 50px">后置内容</div>
    </template>

    <template #slot-index="{ index }">
      <div style="height: 30px">固定在位置 {{ index }} 的内容</div>
    </template>
  </YVirtualScroll>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import YVirtualScroll from "@/components/base/YVirtualScroll.vue";
import { useStore } from "vuex";
import { ITrack } from "@/utils/tracks";

export default defineComponent({
  components: {
    YVirtualScroll,
  },
  setup() {
    const virtualScroll = ref<typeof YVirtualScroll>();
    const store = useStore();
    const player = store.state.player;
    return {
      virtualScroll,
      player,
    };
  },
  data() {
    return {
      songs: [] as ITrack[],
    };
  },
  mounted() {
    this.songs = this.player.playlist.slice();
    console.log("new table mounted");
  },
});
</script>

<style lang="scss" scoped>
.virtual-scroll {
  width: 100%;
  height: calc(100vh - 65px - 85px);
}
</style>
