<template>
  <div class="font-stack-container">
    <div class="selected-fonts" @dragover.prevent @drop.prevent="handleDrop">
      <span class="font-color-low" v-if="selectedFonts.length === 0">{{
        $t("font.please_add_fonts")
      }}</span>
      <div
        v-for="(font, index) in selectedFonts"
        :key="font"
        class="font-tag"
        draggable="true"
        data-drag-item
        @dragstart="handleDragStart(index)"
        @dragend="handleDragEnd"
      >
        <span>{{ font }}</span>
        <div class="remove-btn" @click="removeFont(index)">
          <img class="g-icon" src="@/assets/close.svg" width="10" height="10" />
        </div>
      </div>
    </div>

    <div ref="font_search_container" class="input-wrapper">
      <input
        ref="font_search_trigger"
        v-model="searchQuery"
        type="text"
        :placeholder="$t('font.add_font')"
        @focus="showPanel"
        @input="showPanel"
      />
      <YPanel
        :animation-time="0.2"
        :default-show="true"
        :slide-distance="20"
        :slide-direction="1"
        :trigger="font_search_trigger"
        :z-index="100"
        ref="font_search_panel"
        class="search-results"
      >
        <div class="g-scrollable" id="panel">
          <span
            v-if="filteredFonts.length === 0"
            class="font-color-standard"
            style="padding: 8px"
          >
            {{ $t("font.no_result") }}
          </span>
          <div
            v-for="font in filteredFonts"
            :key="font"
            class="font-option"
            @click="addFont(font)"
          >
            <span :style="{ fontFamily: font }">{{ font }}</span>
          </div>
        </div>
      </YPanel>
    </div>

    <!-- 预览 -->
    <div class="preview-box font-color-main" :style="previewStyle">
      Freude, schöner Götterfunken,<br />
      天上楽園の乙女よ<br />
      欢乐女神圣洁美丽<br /><br />
      Tochter aus Elysium<br />
      歓喜よ、神々の麗しき霊感よ<br />
      灿烂光芒照大地<br />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import YPanel from "./YPanel.vue";

// 系统字体列表
const fonts: readonly string[] = window.fonts ?? [];

interface DragState {
  isDragging: boolean;
  startIndex: number | null;
}

const selectedFonts = ref<string[]>([]);
const searchQuery = ref("");
const dragState = ref<DragState>({
  isDragging: false,
  startIndex: null,
});

const font_search_container = ref<HTMLElement | null>(null);
const font_search_trigger = ref<HTMLElement | undefined>();
const font_search_panel = ref<InstanceType<typeof YPanel> | null>(null);

// 过滤字体列表
const filteredFonts = computed(() => {
  return fonts.filter(
    (font) =>
      font.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      !selectedFonts.value.includes(font),
  );
});
// 预览样式
const previewStyle = computed(() => ({
  fontFamily: selectedFonts.value.join(", "),
}));

const addFont = (font: string) => {
  if (!selectedFonts.value.includes(font)) {
    selectedFonts.value = [...selectedFonts.value, font];
    searchQuery.value = "";
    font_search_panel.value && (font_search_panel.value.showPanel = false);
  }
};

const removeFont = (index: number) => {
  selectedFonts.value = selectedFonts.value.filter((_, i) => i !== index);
};

const handleDragStart = (index: number) => {
  dragState.value = {
    isDragging: true,
    startIndex: index,
  };
};

const handleDragEnd = () => {
  dragState.value = {
    isDragging: false,
    startIndex: null,
  };
};

const handleDrop = (e: DragEvent) => {
  if (!dragState.value.isDragging || dragState.value.startIndex === null)
    return;

  const target = e.currentTarget as HTMLElement;
  const dragEndIndex = Array.from(target.children).findIndex((child) => {
    const dragElement = document.elementFromPoint(e.clientX, e.clientY);
    return child.contains(dragElement) || child === dragElement;
  });

  if (dragEndIndex === -1 || dragState.value.startIndex === dragEndIndex)
    return;

  const newFonts = [...selectedFonts.value];
  const [movedFont] = newFonts.splice(dragState.value.startIndex, 1);
  newFonts.splice(dragEndIndex, 0, movedFont);
  selectedFonts.value = newFonts;
};

const showPanel = () => {
  font_search_panel.value && (font_search_panel.value.showPanel = true);
};

onMounted(() => {
  // do nothing
});

onUnmounted(() => {
  font_search_container.value = null;
  font_search_trigger.value = undefined;
});
</script>

<style lang="scss" scoped>
.font-stack-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 15px;
}
.selected-fonts {
  display: flex;
  flex-wrap: wrap;
  width: 321px;
  align-items: center;
  flex-wrap: wrap;
  padding: 5px 15px;
  color: var(--font-color-main);
  border: 1px solid rgba(var(--foreground-color-rgb), 0.2);
  border-radius: 4px;
  min-height: 45px;

  .font-tag {
    padding: 6px 8px;
    margin-right: 5px;
    height: fit-content;
    border-radius: 5px;
    display: flex;
    align-items: baseline;
    cursor: move;
    .remove-btn {
      cursor: pointer;
      margin-left: 8px;
      background: none;
      border: none;
      opacity: 0.6;
      padding: 2px;
      &:hover {
        opacity: 1;
      }
    }
    &:hover {
      transition: background-color 0s;
      background-color: rgba(var(--foreground-color-rgb), 0.1);
    }
  }
}

.input-wrapper {
  position: relative;
  width: 321px;

  input {
    width: 100%;
    height: 28px;
    padding: 0 15px;
    border: 1px solid rgba(var(--foreground-color-rgb), 0.2);
  }

  .search-results {
    position: absolute;
    top: 40px;

    #panel {
      background: var(--panel-background-color);
      padding: 15px 4px 15px 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      text-align: left;
      width: 250px;
      color: var(--font-color-main);
      max-width: 250px;
      max-height: 321px;
      overflow-y: auto;
      z-index: 100;
      .font-option {
        padding: 8px;
        cursor: pointer;
        &:hover {
          color: rgb(var(--highlight-color-rgb));
          background-color: rgba(var(--foreground-color-rgb), 0.1);
        }
      }
    }
  }
}

.preview-box {
  text-align: left;
  width: 321px;
  padding: 15px;
  border: 1px solid rgba(var(--foreground-color-rgb), 0.2);
}
</style>
