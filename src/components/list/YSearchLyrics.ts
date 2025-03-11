import { defineComponent, ref, watch } from "vue";
import YSongsTable from "@/components/list/YSongsTable.vue";
import { type ITrack } from "@/utils/tracks";

export default defineComponent({
  name: "YSearchLyrics",
  props: {
    modelValue: {
      type: Array as () => ITrack[],
      default: () => [],
    },
  },
  setup(props) {
    // progress 的本地状态
    const listWithLyrics = ref(props.modelValue);

    // 监听 modelValue 的变化
    watch(
      () => props.modelValue,
      (newValue) => {
        listWithLyrics.value = newValue;
      },
    );
    return {
      listWithLyrics,
    };
  },
  components: {
    YSongsTable,
  },
});
