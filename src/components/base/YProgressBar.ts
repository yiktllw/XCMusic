import { defineComponent } from "vue";
import { formatDuration_mmss } from "@/utils/time";
import { ref, watch } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      default: 0,
      validator: (value: number) => {
        return value >= 0 && value <= 1;
      },
    },
    /** 是否显示轨道 */
    showTrack: {
      type: Boolean,
      default: true,
    },
    totalTime: {
      type: Number,
      default: 100,
    },
  },
  name: "YProgressBar",
  data() {
    return {
      mouseProgress: 0,
      showInfo: false,
    };
  },
  emits: ["update:modelValue", "set-progress-end"],
  setup(props) {
    // progress 的本地状态
    const progress = ref(props.modelValue);

    // 监听 modelValue 的变化
    watch(
      () => props.modelValue,
      (newValue) => {
        progress.value = newValue;
      },
    );

    const progress_bar = ref<HTMLElement | null>(null);
    const big_frame = ref<HTMLElement | null>(null);
    const progressDOM = ref<HTMLElement | null>(null);
    const noSelect = ref<HTMLElement | null>(null);

    return {
      progress,
      progress_bar,
      big_frame,
      progressDOM,
      noSelect,
    };
  },
  mounted() {
    this.big_frame?.classList.remove("ani");
    this.$nextTick(() => {
      this.big_frame?.classList.add("ani");
    });
  },
  beforeUnmount() {
    window.removeEventListener("mousemove", this.updateProgressEvent);
    window.removeEventListener("mouseup", this.endSetProgress);
    this.progress_bar = null;
    this.big_frame = null;
    this.progressDOM = null;
    this.noSelect = null;
  },
  watch: {
    progress(newValue, oldValue) {
      // 在进度条归零(下一首)时，暂时移除动画
      if (newValue === 0) {
        this.big_frame?.classList.remove("ani");
        this.$nextTick(() => {
          setTimeout(() => {
            this.big_frame?.classList.add("ani");
          }, 500);
        });
      }
    },
  },
  methods: {
    updateProgress(x: number) {
      let rect = null;
      rect = this.progress_bar?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const dx = x - rect.left;
      let progress = dx / rect.width;
      if (progress < 0) {
        progress = 0;
      } else if (progress > 1) {
        progress = 1;
      }
      this.$emit("update:modelValue", progress);
    },
    updateProgressEvent(e: MouseEvent) {
      this.updateProgress(e.clientX);
    },
    onMouseDown(e: MouseEvent) {
      this.big_frame?.classList.remove("ani");
      this.updateProgress(e.clientX);
      window.addEventListener("mousemove", this.updateProgressEvent);
      window.addEventListener("mouseup", this.endSetProgress);
    },
    startSetProgress() {
      window.addEventListener("mousemove", this.updateProgressEvent);
      window.addEventListener("mouseup", this.endSetProgress);
    },
    endSetProgress() {
      window.removeEventListener("mousemove", this.updateProgressEvent);
      this.$emit("set-progress-end");
      this.$nextTick(() => {
        setTimeout(() => {
          this.big_frame?.classList.add("ani");
        }, 500);
      });
    },
    formatDuration(progress: number) {
      let duration = Math.floor(progress * this.totalTime * 1000);
      return formatDuration_mmss(duration);
    },
    handleMousemove(event: MouseEvent) {
      this.mouseProgress =
        event.clientX / (this.big_frame?.getBoundingClientRect().width || 100);
      this.showInfo = true;
    },
    HideInfo() {
      this.showInfo = false;
    },
  },
});
