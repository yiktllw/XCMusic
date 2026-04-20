<template>
  <!-- 应用内通知组件 -->
  <div class="msg" @mouseenter="pauseAutoClose" @mouseleave="resumeAutoClose">
    <transition
      name="toast-slide"
      @after-leave="$emit('close')"
      v-bind:style="{
        '--slide-transform': slideTransform,
        '--animation-time': _animationTime,
        '--z-index': zIndex,
      }"
    >
      <div
        class="container"
        v-if="showMsg"
        :class="`type-${type}`"
        :role="ariaRole"
        aria-live="polite"
        v-bind:style="{ '--duration': _durationCss }"
        @contextmenu.prevent="close"
      >
        <div class="accent" aria-hidden="true"></div>
        <div class="icon-wrap" aria-hidden="true">
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
        </div>
        <div class="content">
          <div
            class="message font-color-main"
            :class="{ expanded: isExpanded }"
            :title="message"
          >
            {{ message }}
          </div>
        </div>
        <div class="action-column">
          <button
            class="close-button"
            type="button"
            :title="$t('message.toast.close')"
            @click="close"
          >
            <img class="img close-img g-icon" src="@/assets/close.svg" />
          </button>
          <button
            class="expand-button"
            type="button"
            :title="
              isExpanded
                ? $t('message.toast.collapse')
                : $t('message.toast.expand')
            "
            @click="toggleExpanded"
          >
            <img
              class="img expand-img g-icon"
              :class="{ expanded: isExpanded }"
              src="@/assets/more.svg"
            />
          </button>
        </div>
        <div class="lifetime" aria-hidden="true"></div>
      </div>
    </transition>
  </div>
</template>

<script src="./YMessage.ts" lang="ts"></script>

<style lang="scss" scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition:
    transform var(--animation-time) cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity var(--animation-time) cubic-bezier(0.2, 0.8, 0.2, 1),
    filter var(--animation-time) ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: var(--slide-transform) scale(0.98);
  opacity: 0;
  filter: saturate(0.75);
}

.msg {
  display: flex;
  position: relative;
}

.container {
  --accent-color: rgb(72, 145, 255);
  --accent-soft: rgba(72, 145, 255, 0.28);
  width: min(321px, calc(100vw - 24px));
  min-height: 44px;
  background: linear-gradient(
      90deg,
      var(--accent-soft) 0%,
      rgba(var(--foreground-color-rgb), 0.12) 34%,
      rgba(var(--foreground-color-rgb), 0.05) 58%,
      rgba(var(--foreground-color-rgb), 0.03) 100%
    ),
    var(--panel-background-color);
  border-radius: 10px;
  border: 1px solid rgba(var(--foreground-color-rgb), 0.17);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  padding: 7px 10px 8px 10px;
  align-items: center;
  display: flex;
  flex-direction: row;
  position: relative;
  overflow: hidden;
  pointer-events: auto;

  &.type-info {
    --accent-color: rgb(72, 145, 255);
    --accent-soft: rgba(72, 145, 255, 0.28);
  }

  &.type-success {
    --accent-color: rgb(72, 187, 120);
    --accent-soft: rgba(72, 187, 120, 0.26);
  }

  &.type-warning {
    --accent-color: rgb(245, 177, 66);
    --accent-soft: rgba(245, 177, 66, 0.28);
  }

  &.type-error {
    --accent-color: rgb(239, 101, 101);
    --accent-soft: rgba(239, 101, 101, 0.28);
  }

  .accent {
    width: 5px;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: var(--accent-color);
    box-shadow: 0 0 14px var(--accent-soft);
  }

  .icon-wrap {
    width: 20px;
    min-width: 20px;
    height: 20px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 2px;
    margin-right: 8px;
    background-color: var(--accent-soft);
  }

  .content {
    min-width: 0;
    flex: 1;
    margin-right: 4px;
    position: relative;
  }

  .img {
    width: 14px;
    height: 14px;
    min-width: 14px;
    margin: 0;
    opacity: 0.9;
  }

  .warning-img {
    width: 16px;
    height: 16px;
    min-width: 16px;
  }

  .message {
    text-align: left;
    font-size: var(--font-size-small);
    line-height: 1.35;
    letter-spacing: 0.1px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    overflow: hidden;
    overflow-wrap: anywhere;
  }

  .message.expanded {
    display: block;
    line-clamp: unset;
    -webkit-line-clamp: unset;
    overflow: visible;
  }

  .action-column {
    width: 18px;
    min-width: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    margin-top: 1px;
  }

  .expand-button {
    width: 18px;
    min-width: 18px;
    height: 18px;
    border-radius: 5px;
    border: none;
    outline: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--font-color-standard);
    transition: background-color 0.16s ease;

    &:hover {
      background-color: rgba(var(--foreground-color-rgb), 0.12);
    }
  }

  .expand-img {
    width: 12px;
    height: 12px;
    min-width: 12px;
    opacity: 0.7;
    transform: rotate(0deg);
    transition: transform 0.16s ease;
  }

  .expand-img.expanded {
    transform: rotate(180deg);
  }

  .close-button {
    width: 18px;
    min-width: 18px;
    height: 18px;
    border: none;
    outline: none;
    border-radius: 5px;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    transition: background-color 0.16s ease;

    &:hover {
      background-color: rgba(var(--foreground-color-rgb), 0.12);
    }
  }

  .close-img {
    width: 10px;
    height: 10px;
    margin: 0;
  }

  .lifetime {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background-color: rgba(var(--foreground-color-rgb), 0.12);

    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      background-color: var(--accent-color);
      transform-origin: left center;
      animation: toast-lifetime var(--duration) linear forwards;
      opacity: 0.9;
    }
  }
}

.msg:hover .lifetime::after {
  animation-play-state: paused;
}

@keyframes toast-lifetime {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}
</style>
