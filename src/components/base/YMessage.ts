import { defineComponent } from "vue";

export default defineComponent({
  name: "YMessage",
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
      default: 1500,
    },
    aniDuration: {
      type: Number,
      default: 400,
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
    _color(): string {
      const colors: {
        [key in "info" | "success" | "warning" | "error"]: string;
      } = {
        info: "rgba(64, 66, 66, .8)",
        success: "rgba(60, 118, 61, .8)",
        warning: "rgba(100, 86, 70, .8)",
        error: "rgba(138, 88, 82, .8)",
      };
      return colors[this.type as "info" | "success" | "warning" | "error"];
    },
    _animationTime() {
      return this.aniDuration / 1000 + "s";
    },
    slideDistance() {
      return 100;
    },
    slideDistanceXY() {
      return 100;
    },
    slideTransform() {
      const directions = [
        `translateY(-${this.slideDistance}%)`,
        `translate(${this.slideDistanceXY}%, -${this.slideDistanceXY}%)`,
        `translateX(${this.slideDistance}%)`,
        `translate(${this.slideDistanceXY}%, ${this.slideDistanceXY}%)`,
        `translateY(${this.slideDistance}%)`,
        `translate(-${this.slideDistanceXY}%, ${this.slideDistanceXY}%)`,
        `translateX(-${this.slideDistance}%)`,
        `translate(-${this.slideDistanceXY}%, -${this.slideDistanceXY}%)`,
        "",
        "",
      ];
      return directions[this.slideDirection - 1];
    },
    zIndex() {
      return 200;
    },
  },
  data() {
    return {
      showMsg: true,
    };
  },
  mounted() {
    setTimeout(() => {
      this.showMsg = false;
    }, this.duration);
  },
});
