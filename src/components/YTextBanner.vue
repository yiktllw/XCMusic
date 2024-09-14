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

<script lang="js">
export default {
    name: 'YTextBanner',
    props: {
        text: {
            type: String,
            required: true,
            default: '',
        },
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
            console.log('textwidth',this.textwidth,'mainwidth', this.mainWidth);
            return this.textwidth - 100 > this.mainWidth;
        }
    },
    watch: {
        text() {
            // 确保在更新 scroll 元素之后再获取 textwidth
            this.$nextTick(() => {
                this.mainWidth = this.$refs.main_ref.offsetWidth;
                this.textwidth = this.$refs.scroll_ref.offsetWidth;
                this.updateStyles();
            });
        }
    },
    mounted() {
        this.textwidth = this.$refs.scroll_ref.offsetWidth;
        this.mainWidth = this.$refs.main_ref.offsetWidth;
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
            const existingStyle = this.$refs.main_ref.querySelector('#dynamic-styles');
            if (existingStyle) {
                existingStyle.remove();
            }

            // 创建一个新的 <style> 元素
            const style = document.createElement('style');
            style.type = 'text/css';
            style.id = 'dynamic-styles';

            // 插入 CSS 规则到 <style> 元素
            if (style.styleSheet) {
                style.styleSheet.cssText = cssRules;
            } else {
                style.appendChild(document.createTextNode(cssRules));
            }

            // 将 <style> 元素插入到 <head> 中
            this.$refs.main_ref.appendChild(style);
        }
    }
}
</script>

<style scoped>
.main {
    display: flex;
    color: #fff;
    height: 100%;
    white-space: nowrap;
    overflow: hidden;
}
</style>