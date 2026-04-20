import { defineComponent } from "vue";

export default defineComponent({
  name: "YMessage",
  emits: ["close"],
  props: {
    type: {
      type: String,
      default: "error",
      validator(value: string) {
        return ["info", "success", "warning", "error"].includes(value);
      },
    },
    message: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 4200,
    },
    aniDuration: {
      type: Number,
      default: 260,
    },
    slideDirection: {
      type: Number,
      default: 3,
      validator(value: number) {
        return value >= 1 && value <= 10;
      },
    },
  },
  computed: {
    _animationTime() {
      return this.aniDuration / 1000 + "s";
    },
    _durationCss() {
      return `${Math.max(1000, this.duration)}ms`;
    },
    slideDistance() {
      return 20;
    },
    slideDistanceXY() {
      return 16;
    },
    slideTransform() {
      const directions = [
        `translateY(-${this.slideDistance}px)`,
        `translate(${this.slideDistanceXY}px, -${this.slideDistanceXY}px)`,
        `translateX(${this.slideDistance}px)`,
        `translate(${this.slideDistanceXY}px, ${this.slideDistanceXY}px)`,
        `translateY(${this.slideDistance}px)`,
        `translate(-${this.slideDistanceXY}px, ${this.slideDistanceXY}px)`,
        `translateX(-${this.slideDistance}px)`,
        `translate(-${this.slideDistanceXY}px, -${this.slideDistanceXY}px)`,
        "",
        "",
      ];
      return directions[this.slideDirection - 1];
    },
    zIndex() {
      return 200;
    },
    ariaRole() {
      return this.type === "error" || this.type === "warning"
        ? "alert"
        : "status";
    },
  },
  data() {
    return {
      showMsg: true,
      timer: null as number | null,
      timeoutStartAt: 0,
      remainingDuration: this.duration,
      isExpanded: false,
    };
  },
  beforeUnmount() {
    this.clearAutoCloseTimer();
  },
  mounted() {
    this.startAutoCloseTimer();
  },
  methods: {
    startAutoCloseTimer() {
      this.clearAutoCloseTimer();
      this.timeoutStartAt = Date.now();
      this.timer = window.setTimeout(() => {
        this.close();
      }, this.remainingDuration);
    },
    clearAutoCloseTimer() {
      if (this.timer !== null) {
        window.clearTimeout(this.timer);
        this.timer = null;
      }
    },
    pauseAutoClose() {
      if (!this.showMsg || this.timer === null) {
        return;
      }
      const elapsed = Date.now() - this.timeoutStartAt;
      this.remainingDuration = Math.max(300, this.remainingDuration - elapsed);
      this.clearAutoCloseTimer();
    },
    resumeAutoClose() {
      if (!this.showMsg || this.timer !== null) {
        return;
      }
      this.startAutoCloseTimer();
    },
    close() {
      this.clearAutoCloseTimer();
      this.showMsg = false;
    },
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.pauseAutoClose();
        return;
      }
      this.remainingDuration = Math.max(1500, this.remainingDuration);
      this.resumeAutoClose();
    },
  },
});
