import { defineComponent, ref } from "vue";
import { YContextMenuItemC } from "@/dual/YContextMenuItemC";
import YPanel from "@/components/base/YPanel.vue";

export default defineComponent({
  name: "YContextMenu",
  setup() {
    const panel = ref<InstanceType<typeof YPanel> | null>();
    return {
      panel,
    };
  },
  beforeUnmount() {
    this.panel = null;
  },
  props: {
    items: {
      type: Array<YContextMenuItemC>,
      required: true,
      validator: function (value: YContextMenuItemC[]) {
        return value.every((item) => item instanceof YContextMenuItemC);
      },
    },
    // 以鼠标位置为原点，控制在哪个象限显示
    direction: {
      type: Number,
      default: 4,
      validator: function (value) {
        return value === 1 || value === 2 || value === 3 || value === 4;
      },
    },
    target: {
      default: null as any,
    },
    posX: {
      type: String,
      default: "0px",
    },
    posY: {
      type: String,
      default: "0px",
    },
  },
  components: {
    YPanel,
  },
  emits: ["menu-click"],
  computed: {
    _transform() {
      const directions = [
        "translateY(-100%)",
        "translate3D(-100% , -100% , 0)",
        "translateX(-100%)",
        "",
      ];
      return directions[this.direction - 1];
    },
  },
  methods: {
    handleClick(role: string) {
      this.$emit("menu-click", {
        role: role,
        target: this.target,
        from: this.target?.from,
      });
      this.panel?.tooglePanel();
    },
    showContextMenu() {
      this.panel?._showPanel();
    },
    closeContextMenu() {
      this.panel?.closePanel();
    },
    toogleContextMenu() {
      this.panel?.tooglePanel();
    },
  },
});
