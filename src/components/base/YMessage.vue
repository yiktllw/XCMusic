<template>
  <!-- 应用内通知组件 -->
  <div class="msg theme-dark">
    <transition
      name="slide-fade"
      v-bind:style="{
        '--slide-transform': slideTransform,
        '--animation-time': _animationTime,
        '--z-indez': zIndex,
      }"
    >
      <div
        class="container"
        v-if="showMsg"
        v-bind:style="{ '--color': _color }"
      >
        <img class="img" src="@/assets/info.svg" v-if="type === 'info'" />
        <img
          class="img error-img"
          src="@/assets/error.svg"
          v-else-if="type === 'error'"
        />
        <img
          class="img warning-img"
          src="@/assets/warning.svg"
          v-else-if="type === 'warning'"
        />
        <img
          class="img success-img"
          src="@/assets/success.svg"
          v-else-if="type === 'success'"
        />
        <div class="message font-color-main" :title="message">
          {{ message }}
        </div>
        <img
          class="img close-img g-icon"
          src="@/assets/close.svg"
          @click="showMsg = false"
        />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
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
</script>

<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all var(--animation-time) ease-out;
}

.slide-fade-leave-active {
  transition: all var(--animation-time) ease-out;
  z-index: var(--z-indez);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: var(--slide-transform);
  opacity: 0;
  z-index: var(--z-indez);
}

.msg {
  display: flex;
  position: relative;
}

.container {
  background-color: var(--color);
  border-radius: 100px;
  padding: 5px 10px;
  align-items: center;
  display: flex;
  flex-direction: row;

  .img {
    width: 20px;
    height: 20px;
    min-width: 20px;
    margin-right: 5px;
  }

  .warning-img {
    width: 22px;
    height: 22px;
    min-width: 22px;
  }

  .message {
    max-width: 432.1px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .close-img {
    width: 14px;
    height: 14px;
    margin: 0px 5px 0px 10px;
    cursor: pointer;
  }
}
</style>
