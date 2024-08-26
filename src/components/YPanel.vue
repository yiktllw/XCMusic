<template>
    <transition name="slide-fade" v-bind:style="{ '--slide-transform': slideTransform }">
        <div class="panel" v-show="showPanel" ref="panel">
            <slot></slot>
        </div>
    </transition>
</template>

<script lang="js">
export default {
    name: 'YPanel',
    data() {
        return {
            showPanel: false,
        }
    },
    props: {
        trigger: {
            type: Element,
            default: null,
        },
        defaultShow: {
            type: Boolean,
            default: false,
        },
        slideDirection: {
            type: Number,
            default: 1,
        },
    },
    computed: {
        slideTransform() {
            const directions = ['translateY(-20px)', 'translate(14px, -14px)', 'translateX(20px)', 'translate(14px, 14px)', 'translateY(20px)', 'translate(-14px, 14px)', 'translateX(-20px)', 'translate(-14px, -14px)'];
            return directions[this.slideDirection - 1];
        },
    },
    watch: {
        showPanel(val) {
            if (val) {
                window.addEventListener('click', this.handleClickOutside);
            } else {
                window.removeEventListener('click', this.handleClickOutside);
            }
        }
    },
    methods: {
        tooglePanel() {
            this.showPanel = !this.showPanel;
        },
        _showPanel() {
            this.showPanel = true;
        },
        closePanel() {
            this.showPanel = false;
        },
        handleClickOutside(event) {
            console.log('handleClickOutside');
            if (this.$refs.panel && !this.$refs.panel.contains(event.target) && this.trigger && !this.trigger.contains(event.target) && this.showPanel) {
                this.showPanel = false;
                console.log('handleClickOutside and close panel');
            }
        },
    },
    mounted() {
        if (this.defaultShow) {
            this.showPanel = true;
        }
    },
    beforeUnmount() {
        window.removeEventListener('click', this.handleClickOutside);
    },
}

</script>


<style scoped>
.slide-fade-enter-active {
    transition: all 0.15s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: var(--slide-transform);
    opacity: 0;
}

.panel {
    display: relative;
    margin: 0;
    padding: 0;
    background-color: transparent;
}
</style>