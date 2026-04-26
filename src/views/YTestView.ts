import { YColor } from "@/utils/color";
import { Message } from "@/dual/YMessageC";
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "YTestView",
  components: {},
  setup() {
    const store = useStore();

    return {
      player: store.state.player,
      setting: store.state.setting,
      download: store.state.download,
    };
  },
  computed: {},
  data() {
    return {};
  },
  methods: {
    notifyByType(type: "info" | "success" | "warning" | "error") {
      const contentMap = {
        info: "Info 通知：用于检查默认信息样式与动画。",
        success: "Success 通知：用于检查成功状态色与图标。",
        warning: "Warning 通知：用于检查警告状态色与可读性。",
        error: "Error 通知：用于检查错误状态色与警示强度。",
      };
      Message.post(type, contentMap[type]);
    },
    notifyLongMessage() {
      Message.post(
        "info",
        "长文本通知测试：用于确认通知在两行文本截断后会出现“展开”按钮；展开后可以完整查看内容，收起后恢复紧凑展示。这里故意追加更多文本用于触发换行与溢出检测，包含一些额外说明来保证在 321px 的宽度下稳定超过两行。",
      );
    },
    notifyDuplicate() {
      Message.post("warning", "重复去重测试：这条消息只应该出现一次。");
      setTimeout(() => {
        Message.post("warning", "重复去重测试：这条消息只应该出现一次。");
      }, 60);
    },
    notifyBurst() {
      const sequence: Array<"info" | "success" | "warning" | "error"> = [
        "info",
        "success",
        "warning",
        "error",
      ];
      for (let i = 0; i < 8; i++) {
        const type = sequence[i % sequence.length];
        setTimeout(() => {
          Message.post(type, `连续通知测试 #${i + 1}`);
        }, i * 120);
      }
    },
    notifyStressDisappear() {
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          Message.post("info", `消失动画与堆叠压力测试 #${i + 1}`);
        }, i * 90);
      }
    },
    clearCache() {
      window.electron.clearCache();
      console.log("clearCache");
      const test = window.electron.getProcessInfo();
      console.log(JSON.stringify(test, null, 4));
    },
    setEq() {
      this.player.setEqualizer({
        _32Hz: 12,
        _64Hz: 8,
        _125Hz: 4,
        _250Hz: 0,
        _500Hz: -2,
        _1kHz: -4,
        _2kHz: -6,
        _4kHz: -8,
        _8kHz: -10,
        _16kHz: -12,
      });
    },
    outputGaplessBufferState() {
      this.player.refreshBufferDebugSnapshot();
      setTimeout(() => {
        const snapshot = this.player.getBufferDebugSnapshot();
        const currentProgress =
          typeof snapshot.currentBufferedProgress === "number"
            ? `${Math.round(snapshot.currentBufferedProgress * 100)}%`
            : "N/A";
        const nextProgress =
          typeof snapshot.nextBufferedProgress === "number"
            ? `${Math.round(snapshot.nextBufferedProgress * 100)}%`
            : "N/A";

        console.log("[YTestView][GaplessBufferState]", snapshot);
        Message.post(
          "info",
          `缓冲状态已输出到控制台。当前缓冲：${currentProgress}，下一首缓冲：${nextProgress}`,
        );
      }, 150);
    },
  },
  mounted() {
    YColor.setBackgroundColorHex2(YColor.stringToHexColor("Test  View"));
  },
  beforeUnmount() {},
});
