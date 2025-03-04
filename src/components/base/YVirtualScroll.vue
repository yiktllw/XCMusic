<template>
  <div ref="container" class="virtual-scroll-container" @scroll="handleScroll">
    <div class="virtual-scroll-content" :style="{ height: totalHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.key"
        class="virtual-item"
        :style="itemStyle(item)"
      >
        <slot
          v-if="item.type === 'item'"
          name="item"
          :item="item.data"
          :index="item.index"
        />
        <slot
          v-else-if="item.type === 'slot'"
          :name="`slot-${item.slotType}`"
          :index="item.slotIndex"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect, onMounted, onUnmounted } from "vue";

type SlotConfig = {
  type: "prepend" | "append" | "index";
  index?: number;
  height: number;
};

type VirtualItem = {
  type: "item" | "slot";
  key: string | number;
  height: number;
  offset: number;
  data?: any;
  index?: number;
  slotType?: "prepend" | "append" | "index";
  slotIndex?: number;
};

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  itemHeight: {
    type: [Number, Function],
    required: true,
  },
  slots: {
    type: Array as () => SlotConfig[],
    default: () => [],
  },
});

const container = ref<HTMLElement>();
const scrollTop = ref(0);
const containerHeight = ref(0);
const totalHeight = ref(0);
const virtualItems = ref<VirtualItem[]>([]);

// 生成虚拟列表项
const generateVirtualItems = computed(() => {
  const items: VirtualItem[] = [];
  let offset = 0;

  // 处理前置插槽
  props.slots
    .filter((s) => s.type === "prepend")
    .forEach((slot, i) => {
      items.push({
        type: "slot",
        key: `prepend-${i}`,
        height: slot.height,
        offset,
        slotType: "prepend",
      });
      offset += slot.height;
    });

  // 处理数据项和索引插槽
  props.items.forEach((item, index) => {
    // 处理索引位置的插槽
    props.slots
      .filter((s) => s.type === "index" && s.index === index)
      .forEach((slot, i) => {
        items.push({
          type: "slot",
          key: `index-${index}-${i}`,
          height: slot.height,
          offset,
          slotType: "index",
          slotIndex: index,
        });
        offset += slot.height;
      });

    // 添加数据项
    const height =
      typeof props.itemHeight === "function"
        ? props.itemHeight(item)
        : props.itemHeight;

    items.push({
      type: "item",
      key: index,
      height,
      offset,
      data: item,
      index,
    });
    offset += height;
  });

  // 处理后置插槽
  props.slots
    .filter((s) => s.type === "append")
    .forEach((slot, i) => {
      items.push({
        type: "slot",
        key: `append-${i}`,
        height: slot.height,
        offset,
        slotType: "append",
      });
      offset += slot.height;
    });

  totalHeight.value = offset;
  return items;
});

// 可见项计算
const visibleItems = computed(() => {
  if (!container.value) return [];
  const start = scrollTop.value;
  const end = start + containerHeight.value;

  return virtualItems.value.filter(
    (item) => item.offset + item.height > start && item.offset < end,
  );
});

// 处理滚动事件
const handleScroll = () => {
  if (container.value) {
    scrollTop.value = container.value.scrollTop;
  }
};

// 滚动到指定位置
const scrollToIndex = (index: number) => {
  const item = virtualItems.value.find(
    (item) => item.type === "item" && item.index === index,
  );

  if (item && container.value) {
    const targetPos = item.offset + item.height / 2 - containerHeight.value / 2;
    container.value.scrollTo({
      top: targetPos,
      behavior: "smooth",
    });
  }
};

// 样式计算
const itemStyle = (item: VirtualItem): Record<string, string> => ({
  position: "absolute",
  top: `${item.offset}px`,
  height: `${item.height}px`,
  width: "100%",
});

// 生命周期处理
onMounted(() => {
  if (container.value) {
    containerHeight.value = container.value.clientHeight;
    const resizeObserver = new ResizeObserver(() => {
      if (container.value) {
        containerHeight.value = container.value.clientHeight;
      }
    });
    resizeObserver.observe(container.value);
    onUnmounted(() => resizeObserver.disconnect());
  }
});

watchEffect(() => {
  virtualItems.value = generateVirtualItems.value;
});

defineExpose({
  scrollToIndex,
});
</script>

<style>
.virtual-scroll-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.virtual-scroll-content {
  position: relative;
}
</style>
