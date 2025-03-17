<template>
  <div class="skeleton">
    <ContentLoader
      :speed="1.5"
      :width="1000"
      :height="600"
      primaryColor="rgba(var(--foreground-color-rgb), 0.2)"
      secondaryColor="rgba(var(--foreground-color-rgb), 0.1)"
    >
      <!-- 歌曲 -->
      <template v-for="index in 10">
        <template v-if="type === 'small'">
          <rect
            x="16"
            :y="0 + 60 * (index - 1)"
            rx="8"
            ry="8"
            width="40"
            height="40"
          />
          <rect
            x="66"
            :y="3 + 60 * (index - 1)"
            rx="5"
            ry="5"
            width="200"
            height="10"
          />
          <rect
            x="66"
            :y="23 + 60 * (index - 1)"
            rx="5"
            ry="5"
            width="100"
            height="10"
          />
          <rect
            x="313"
            :y="8 + 60 * (index - 1)"
            rx="5"
            ry="5"
            width="20"
            height="20"
          />
        </template>
        <template v-else>
          <rect
            x="24"
            :y="13 + 60 * (index - 1)"
            rx="5"
            ry="5"
            width="20"
            height="10"
          />
          <rect
            x="60"
            :y="0 + 60 * (index - 1)"
            rx="8"
            ry="8"
            width="40"
            height="40"
          />
          <rect
            x="110"
            :y="3 + 60 * (index - 1)"
            rx="5"
            ry="5"
            width="400"
            height="10"
          />
          <rect
            x="110"
            :y="23 + 60 * (index - 1)"
            rx="5"
            ry="5"
            width="200"
            height="10"
          />
          <rect
            x="540"
            :y="13 + 60 * (index - 1)"
            rx="5"
            ry="5"
            width="200"
            height="10"
          />
        </template>
      </template>
    </ContentLoader>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ContentLoader } from "vue-content-loader";

export default defineComponent({
  components: {
    ContentLoader,
  },
  props: {
    type: {
      type: String as () => "small" | "other",
      required: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.skeleton {
  align-items: start;
  justify-content: start;
  justify-self: start;
  overflow: hidden;
  height: 100%;
}
</style>
