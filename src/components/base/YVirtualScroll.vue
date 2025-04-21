<template>
  <div ref="container" class="virtual-scroll-container" @scroll="handleScroll">
    <div class="virtual-scroll-content" :style="{ height: totalHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.key"
        :style="itemStyle(item as VirtualItem<T>) as any"
        :class="{
          'dragging-item': draggingIndex === (item as VirtualItem<T>).index,
        }"
        @mousedown="handleMouseDown(item as VirtualItem<T>, $event)"
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
      <div
        v-if="placeholderOffset !== null"
        class="drag-placeholder"
        :style="{
          top: `${placeholderOffset}px`,
          height: `${dragItemHeight}px`,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, ref, watchEffect, onMounted, onUnmounted } from "vue";
import type { SlotConfig, VirtualItem } from "./YVirtualScroll.interface";

const props = defineProps<{
  items: T[];
  itemHeight: number | ((item: T) => number);
  slots?: SlotConfig[];
}>();

const emit = defineEmits<{
  "did-change": [items: T[]];
}>();

defineSlots<{
  item?: (props: { item: T; index: number }) => any;
  "slot-prepend"?: (props: object) => any;
  "slot-append"?: (props: object) => any;
  "slot-index"?: (props: { index: number }) => any;
}>();

const container = ref<HTMLElement>();
const scrollTop = ref(0);
const containerHeight = ref(0);
const totalHeight = ref(0);
const virtualItems = ref<VirtualItem<T>[]>([]);

// 拖拽相关状态
const draggingIndex = ref<number | null>(null);
const currentDragIndex = ref<number | null>(null);
const startY = ref(0);
const dragItemHeight = ref(0);
const placeholderOffset = ref<number | null>(null);
const itemOffsets = ref<
  Array<{ index: number; offset: number; height: number }>
>([]);
const dragCloneParent = ref<HTMLElement | null>(null);
const dragClone = ref<HTMLElement | null>(null);
const isDragging = ref(false);
/** 拖动阈值 */
const DRAG_THRESHOLD = 5;

const generateVirtualItems = computed(() => {
  const items: VirtualItem<T>[] = [];
  let offset = 0;
  itemOffsets.value = [];

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

    itemOffsets.value.push({ index, offset, height });

    items.push({
      type: "item",
      key: index,
      height,
      offset,
      data: item as T,
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

function handleMouseDown(item: VirtualItem<T>, event: MouseEvent) {
  // 只响应左键点击
  if (event.button !== 0 || item.type !== "item" || !container.value) return;

  startY.value = event.clientY;
  const originalElement = event.currentTarget as HTMLElement;

  const tempDragState = {
    item,
    element: originalElement,
    rect: originalElement.getBoundingClientRect(),
    index: item.index!,
  };

  const onMove = (moveEvent: MouseEvent) => {
    // 检查是否达到拖动阈值
    if (
      !isDragging.value &&
      Math.abs(moveEvent.clientY - startY.value) < DRAG_THRESHOLD
    ) {
      return;
    }

    // 正式进入拖动状态
    if (!isDragging.value) {
      isDragging.value = true;
      draggingIndex.value = tempDragState.index;
      dragItemHeight.value = tempDragState.item.height;

      // 创建克隆元素
      const clone = tempDragState.element.cloneNode(true) as HTMLElement;
      clone.className = "drag-clone";
      clone.style.cssText = `
        overflow: hidden !important;
        position: fixed !important;
        left: ${tempDragState.rect.left}px !important;
        top: ${tempDragState.rect.top}px !important;
        width: ${tempDragState.rect.width}px !important;
        height: ${tempDragState.rect.height}px !important;
        opacity: 0.8 !important;
        z-index: 9999 !important;
        pointer-events: none !important;
        border: 1px dashed rgba(var(--foreground-color-rgb), 0.9) !important;
        transition: none !important;
      `;
      dragCloneParent.value = tempDragState.element.parentElement;
      dragCloneParent.value?.appendChild(clone);
      dragClone.value = clone;
    }

    handleDrag(moveEvent);
  };

  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);

    if (isDragging.value) {
      stopDrag();
    } else {
      resetDrag();
    }
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

function handleDrag(event: MouseEvent) {
  if (!container.value || !isDragging.value) return;

  if (dragClone.value) {
    dragClone.value.style.left = `${event.clientX - dragClone.value.offsetWidth / 2}px`;
    dragClone.value.style.top = `${event.clientY - dragClone.value.offsetHeight / 2}px`;
  }

  const containerRect = container.value.getBoundingClientRect();
  const scrollTop = container.value.scrollTop;
  const relativeY = event.clientY - containerRect.top + scrollTop;

  let newIndex = -1;
  for (let i = 0; i < itemOffsets.value.length; i++) {
    const { index, offset, height } = itemOffsets.value[i];
    if (relativeY >= offset && relativeY <= offset + height) {
      const mid = offset + height / 2;
      newIndex = relativeY < mid ? index : index + 1;
      break;
    }
  }
  if (newIndex === -1) newIndex = props.items.length;
  newIndex = Math.max(0, Math.min(newIndex, props.items.length));

  if (newIndex === draggingIndex.value) {
    placeholderOffset.value = null;
    return;
  }

  currentDragIndex.value = newIndex;

  const targetItem = itemOffsets.value.find((item) => item.index === newIndex);
  if (targetItem) {
    placeholderOffset.value = targetItem.offset;
  } else {
    const lastItem = itemOffsets.value[itemOffsets.value.length - 1];
    placeholderOffset.value = lastItem ? lastItem.offset + lastItem.height : 0;
  }

  const edgeThreshold = 50;
  const scrollSpeed = 20;
  const { top, bottom } = containerRect;
  if (event.clientY < top + edgeThreshold) {
    container.value.scrollTop -= scrollSpeed;
  } else if (event.clientY > bottom - edgeThreshold) {
    container.value.scrollTop += scrollSpeed;
  }
}

function stopDrag() {
  if (draggingIndex.value !== null && currentDragIndex.value !== null) {
    if (draggingIndex.value !== currentDragIndex.value) {
      const newItems = [...props.items];
      const [movedItem] = newItems.splice(draggingIndex.value, 1);
      newItems.splice(currentDragIndex.value, 0, movedItem);
      emit("did-change", newItems);
    }
  }
  resetDrag();
}

function resetDrag() {
  if (dragClone.value) {
    dragCloneParent.value?.removeChild(dragClone.value);
    dragCloneParent.value = null;
    dragClone.value = null;
  }
  isDragging.value = false;
  draggingIndex.value = null;
  currentDragIndex.value = null;
  startY.value = 0;
  dragItemHeight.value = 0;
  placeholderOffset.value = null;
}

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

const scrollToIndex = (index: number, noAnimation = false) => {
  const item = virtualItems.value.find(
    (item) => item.type === "item" && item.index === index,
  );
  if (item && container.value) {
    const targetPos = item.offset + item.height / 2 - containerHeight.value / 2;
    container.value.scrollTo({
      top: targetPos,
      behavior: noAnimation ? "instant" : "smooth",
    });
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
.virtual-scroll-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
}
.virtual-scroll-content {
  position: relative;
}

.dragging-item {
  opacity: 0.5;
  pointer-events: none;
}
.drag-placeholder {
  position: absolute;
  left: 0;
  right: 0;
  border: 1px dashed rgba(var(--foreground-color-rgb), 0.9);
  border-radius: 4px;
  opacity: 0.8;
  pointer-events: none;
}
</style>
