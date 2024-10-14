<template>
    <div class="main" ref="main_ref">
        <div class="scroll"
            v-bind:style="{ '--animation-time': animationTime, '--animation-distance': animationDistance }">
            <span ref="scroll_ref" style="padding-right: 100px;">
                {{ text }}
            </span>
            <span v-if="showAni">
                {{ text }}
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'YTextBanner',
    props: {
        text: {
            type: String,
            required: true,
            default: '',
        },
    },
    setup() {
        const main_ref = ref<HTMLElement | null>(null);
        const scroll_ref = ref<HTMLElement | null>(null);

        return {
            main_ref,
            scroll_ref,
        };
    },
    computed: {
        animationTime() {
            if (!this.showAni) {
                return '0s';
            }
            return (this.textwidth / 40).toFixed(1) + 's';
        },
        animationDistance() {
            return '-' + this.textwidth + 'px';
        },
        showAni() {
            return this.textwidth - 100 > this.mainWidth;
        }
    },
    watch: {
        text() {
            // 确保在更新 scroll 元素之后再获取 textwidth
            this.$nextTick(() => {
                if (this.main_ref) {
                    this.mainWidth = this.main_ref?.offsetWidth;
                }
                if (this.scroll_ref) {
                    this.textwidth = this.scroll_ref?.offsetWidth;
                }
                this.updateStyles();
            });
        }
    },
    mounted() {
        if (this.scroll_ref) {
            this.textwidth = this.scroll_ref?.offsetWidth;
        }
        if (this.main_ref) {
            this.mainWidth = this.main_ref?.offsetWidth;
        }
        this.updateStyles();
    },
    data() {
        return {
            textwidth: 0,
            mainWidth: 0,
        };
    },
    methods: {
        updateStyles() {
            let time = new Date().getTime();
            let cssRules = '';
            if (this.showAni) {
                cssRules = `
                .scroll {
                    display: flex;
                    align-items: center;
                    animation: scroll-${time} ${this.animationTime} linear infinite;
                }
                
                @keyframes scroll-${time} {
                    0% {
                        transform: translateX(0);
                    }
                    ${(1 / (this.textwidth / 40) * 100).toFixed(1)}% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(${this.animationDistance});
                    }
                }
            `;
            } else {
                cssRules = `
                .scroll {
                    display: flex;
                    align-items: center;
                }
            `;
            }

            // 移除现有的 style 元素
            const existingStyle = this.main_ref?.querySelector('#dynamic-styles');
            if (existingStyle) {
                existingStyle.remove();
            }

            // 创建一个新的 <style> 元素
            const style = document.createElement('style');
            style.type = 'text/css';
            style.id = 'dynamic-styles';

            // 插入 CSS 规则到 <style> 元素
            style.appendChild(document.createTextNode(cssRules));

            // 将 <style> 元素插入到 <head> 中
            this.main_ref?.appendChild(style);
        }
    }
})
</script>

<style lang="scss" scoped>
.main {
    display: flex;
    height: 100%;
    white-space: nowrap;
    overflow: hidden;
}
</style>