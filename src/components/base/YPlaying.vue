<template>
  <div class="container">
    <img src="@/assets/playing.svg" width="15" height="12" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "YPlaying",
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  width: 15px;
  height: 15px;
  align-items: flex-end;
}
</style>
