<!-- VirtualScroll.vue -->
<template>
  <div ref="container" class="virtual-scroll-container" @scroll="handleScroll">
    <div class="virtual-scroll-content" :style="{ height: totalHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.key"
        :style="itemStyle(item as VirtualItem<T>) as any"
      >
        <slot
          v-if="item.type === 'item'"
          name="item"
          :item="item.data! as T"
          :index="item.index!"
        />
        <slot
          v-else-if="item.type === 'slot'"
          :name="`slot-${item.slotType!}`"
          :index="item.slotIndex!"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, ref, watchEffect, onMounted, onUnmounted } from "vue";

type SlotConfig = {
  type: "prepend" | "append" | "index";
  index?: number;
  height: number;
};

type VirtualItem<T> = {
  type: "item" | "slot";
  key: string | number;
  height: number;
  offset: number;
  data?: T;
  index?: number;
  slotType?: "prepend" | "append" | "index";
  slotIndex?: number;
};

const props = defineProps<{
  items: T[];
  itemHeight: number | ((item: T) => number);
  slots?: SlotConfig[];
}>();

defineSlots<{
  item?: (props: { item: T; index: number }) => any;
  "slot-prepend"?: (props: {}) => any;
  "slot-append"?: (props: {}) => any;
  "slot-index"?: (props: { index: number }) => any;
}>();

const container = ref<HTMLElement>();
const scrollTop = ref(0);
const containerHeight = ref(0);
const totalHeight = ref(0);
const virtualItems = ref<VirtualItem<T>[]>([]);

const generateVirtualItems = computed(() => {
  const items: VirtualItem<T>[] = [];
  let offset = 0;

  props.slots?.forEach((slot) => {
    if (slot.type === "prepend") {
      items.push({
        type: "slot",
        key: `prepend-${slot.index ?? ""}`,
        height: slot.height,
        offset,
        slotType: "prepend",
      });
      offset += slot.height;
    }
  });

  props.items.forEach((item, index) => {
    // 处理索引插槽
    props.slots
      ?.filter((s) => s.type === "index" && s.index === index)
      .forEach((slot) => {
        items.push({
          type: "slot",
          key: `index-${index}`,
          height: slot.height,
          offset,
          slotType: "index",
          slotIndex: index,
        });
        offset += slot.height;
      });

    const height =
      typeof props.itemHeight === "function"
        ? props.itemHeight(item)
        : props.itemHeight;

    items.push({
      type: "item",
      key: index,
      height,
      offset,
      data: item as T, // 显式类型断言
      index,
    });
    offset += height;
  });

  props.slots?.forEach((slot) => {
    if (slot.type === "append") {
      items.push({
        type: "slot",
        key: `append-${slot.index ?? ""}`,
        height: slot.height,
        offset,
        slotType: "append",
      });
      offset += slot.height;
    }
  });

  totalHeight.value = offset;
  return items;
});

// 可见项计算（显式类型声明）
const visibleItems = computed(() => {
  if (!container.value) return [];
  const start = scrollTop.value;
  const end = start + containerHeight.value;
  return virtualItems.value.filter(
    (item) => item.offset + item.height > start && item.offset < end,
  );
});

const handleScroll = () => {
  if (container.value) scrollTop.value = container.value.scrollTop;
};

const scrollToIndex = (index: number) => {
  const item = virtualItems.value.find(
    (item) => item.type === "item" && item.index === index,
  );
  if (item && container.value) {
    const targetPos = item.offset + item.height / 2 - containerHeight.value / 2;
    container.value.scrollTo({ top: targetPos, behavior: "smooth" });
  }
};

const itemStyle = (item: VirtualItem<T>) => ({
  position: "absolute",
  top: `${item.offset}px`,
  height: `${item.height}px`,
  width: "100%",
});

onMounted(() => {
  if (container.value) {
    containerHeight.value = container.value.clientHeight;
    const resizeObserver = new ResizeObserver(() => {
      containerHeight.value = container.value?.clientHeight || 0;
    });
    resizeObserver.observe(container.value);
    onUnmounted(() => resizeObserver.disconnect());
  }
});

watchEffect(() => {
  virtualItems.value = generateVirtualItems.value;
});

defineExpose({ scrollToIndex });
</script>

<style>
/* 样式保持不变 */
.virtual-scroll-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
}
.virtual-scroll-content {
  position: relative;
}
</style>
