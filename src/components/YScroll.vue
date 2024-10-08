<template>
    <div class="scrollable">
        <slot></slot>
    </div>
</template>

<script lang="js">
export default {
    name: 'YScroll',
}
</script>

<style lang="scss" scoped>
.scrollable {
    overflow-y: auto;
    overflow-x: hidden;
    user-select: none;
    -webkit-user-drag: none;
    // scroll-behavior: smooth;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 6px;
    }

    &:hover::-webkit-scrollbar-thumb {
        background-color: rgba(var(--foreground-color-rgb), 0.1);
        /* 滚动条滑块背景 */
    }

    &:hover::-webkit-scrollbar-thumb:hover {
        background-color: rgba(var(--foreground-color-rgb), 0.2);
        /* 滚动条滑块悬停背景 */
    }
}
</style>