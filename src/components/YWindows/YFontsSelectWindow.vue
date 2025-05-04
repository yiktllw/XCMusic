<template>
  <YWindow
    style="width: fit-content"
    ref="ywindow"
    @new-window-state="handleNewWindowState"
  >
    <template #header>{{ props.title }}</template>
    <YFontsSelect
      ref="font_select"
      style="padding: 20px 15px"
      :selected-fonts="props.selectedFonts"
    />
    <div class="buttons">
      <button @click="close">{{ $t("cancel") }}</button>
      <button @click="ensure">{{ $t("ensure") }}</button>
    </div>
  </YWindow>
</template>
<script setup lang="ts">
import { ref } from "vue";
import YWindow from "@/components/base/YWindow.vue";
import YFontsSelect from "@/components/base/YFontsSelect.vue";
import { type IEscapedFonts } from "@/utils/fonts";

const ywindow = ref<InstanceType<typeof YWindow> | null>();
const font_select = ref<InstanceType<typeof YFontsSelect> | null>();

const props = defineProps<{
  title: string;
  selectedFonts: IEscapedFonts;
}>();
const emit = defineEmits<{
  "new-window-state": [boolean];
  ensure: [IEscapedFonts];
}>();
function handleNewWindowState(val: boolean) {
  emit("new-window-state", val);
}
function ensure() {
  emit("ensure", font_select.value?.selectedFonts ?? []);
}
function close() {
  ywindow.value?.closeWindow();
}
defineExpose({
  close,
});
</script>

<style lang="scss" scoped>
.buttons {
  display: flex;
  width: calc(100% - 30px);
  margin: -5px 0 5px 0;
  button {
    width: 50%;
    font-weight: bold;
    font-size: 17px;
    padding: 7px 0;
    border-radius: 0;
  }
}
</style>
