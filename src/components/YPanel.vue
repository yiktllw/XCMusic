<template>
    <div>
        <transition name="slide-fade"
            v-bind:style="{ '--slide-transform': slideTransform, '--animation-time': _animationTime, '--z-indez': zIndex }"
            v-if="hideMode === 'if'">
            <div class="panel" v-if="showPanel" ref="panel">
                <slot></slot>
            </div>
        </transition>
        <transition name="slide-fade"
            v-bind:style="{ '--slide-transform': slideTransform, '--animation-time': _animationTime, '--z-indez': zIndex }"
            v-if="hideMode === 'show'">
            <div class="panel" v-show="showPanel" ref="panel">
                <slot></slot>
            </div>
        </transition>
    </div>
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
        slideDistance: {
            type: Number,
            default: 20,
        },
        animationTime: {
            type: Number,
            default: 0.15,
        },
        zIndex: {
            type: Number,
            default: 100,
        },
        hideMode: {
            type: String,
            default: 'if',
            validator: function (value) {
                return value === 'if' || value === 'show';
            },
        },
    },
    computed: {
        _animationTime() {
            return this.animationTime + 's';
        },
        slideDistanceXY() {
            return this.slideDistance * Math.sqrt(2) / 2;
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
                '',
                '',
            ];
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
            if (this.trigger) {
                if (this.$refs.panel && !this.$refs.panel.contains(event.target) && !this.trigger.contains(event.target) && this.showPanel) {
                    this.showPanel = false;
                    console.log('handleClickOutside and close panel');
                }
            } else {
                if (this.$refs.panel && !this.$refs.panel.contains(event.target) && this.showPanel) {
                    this.showPanel = false;
                    console.log('No trigger, handleClickOutside and close panel');
                }
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
    transition: all var(--animation-time) ease-out;
}

.slide-fade-leave-active {
    transition: all var(--animation-time) cubic-bezier(1, 0.5, 0.8, 1);
    z-index: var(--z-indez);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: var(--slide-transform);
    opacity: 0;
    z-index: var(--z-indez);
}

.panel {
    position: relative;
    margin: 0;
    padding: 0;
    background-color: transparent;
    z-index: var(--z-indez);
}
</style>