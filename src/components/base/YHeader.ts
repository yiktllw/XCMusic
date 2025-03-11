import { defineComponent, type PropType } from "vue";

interface SwitcherItem {
  num: number;
  showNum: boolean;
  position: string;
  display: string;
}

export default defineComponent({
  name: "YHeader",
  props: {
    switcher: {
      type: Array as PropType<SwitcherItem[]>,
      default: () => [
        {
          num: 0,
          showNum: true,
          position: "default",
          display: "default",
        },
      ],
    },
  },
  data() {
    return {
      position: "",
      timeoutId: null as NodeJS.Timeout | null,
    };
  },
  methods: {
    handleSwitcher(position: string) {
      this.$emit("new-position", position);
      this.timeoutId = setTimeout(() => {
        this.position = position;
      }, 16 * 2);
    },
    setPosition(position: string) {
      this.position = position;
    },
  },
  mounted() {
    this.position = (this.switcher as SwitcherItem[])[0].position;
  },
  beforeUnmount() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  },
});
