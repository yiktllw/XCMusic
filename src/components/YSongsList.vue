<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ITrack } from "@/utils/tracks";

export default defineComponent({
  name: "YSongsList",
  props: {
    tracks: {
      type: Array as () => ITrack[],
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
