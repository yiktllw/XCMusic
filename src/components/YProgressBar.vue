<template>
    <div class="progress-bigframe">
        <div class="progress-bar" @click="onClick" ref="progress_bar" v-if="true">
            <div :class="showTrack ? 'progress-fill' : 'progress-no-track'"
                :style="{ clipPath: `inset( 0 ${100 - progress * 100}% 0 0 round 20px)` }"
                :ref="showTrack ? 'noSelect' : 'progressDOM'"></div>
            <div class="progress-pointer" :style="{ left: 'calc(' + progress * 100 + '%' + ' - 7px )' }"
                @mousedown="startSetProgress" @mouseup="endSetProgress"></div>
            <div class="progress-track" v-if="showTrack"></div>
        </div>
    </div>
</template>

<script lang="js">
import { ref, watch } from 'vue';

export default {
    name: 'YProgressBar',
    data() {
        return {
        };
    },
    emits: [
        'update:modelValue',
        'set-progress-end'
    ],
    setup(props) { // eslint-disable-line
        // progress 的本地状态
        const progress = ref(props.modelValue);

        // 监听 modelValue 的变化
        watch(() => props.modelValue, (newValue) => {
            progress.value = newValue;
        });
        return {
            progress
        };
    },
    props: {
        modelValue: {
            default: 0,
            validator: (value) => {
                return value >= 0 && value <= 1;
            }
        },
        showTrack: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        updateProgress(x) {
            let rect = null;
            rect = this.$refs.progress_bar.getBoundingClientRect();
            const dx = x - rect.left;
            let progress = dx / rect.width;
            if (progress < 0) {
                progress = 0;
            } else if (progress > 1) {
                progress = 1;
            }
            this.$emit('update:modelValue', progress);
        },
        updateProgressEvent(e) {
            this.updateProgress(e.clientX);
        },
        onClick(e) {
            this.updateProgress(e.clientX);
            this.$emit('set-progress-end');
        },
        startSetProgress() {
            window.addEventListener('mousemove', this.updateProgressEvent);
            window.addEventListener('mouseup', this.endSetProgress);
        },
        endSetProgress() {
            window.removeEventListener('mousemove', this.updateProgressEvent);
            this.$emit('set-progress-end');
        }
    }
};

</script>

<style lang="scss" scoped>
.progress-bigframe {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    position: relative;

    .progress-bar {
        width: 100%;
        height: 5px;
        position: relative;
        cursor: pointer;

        .progress-fill {
            width: 100%;
            height: 100%;
            background-color: rgb(254, 60, 90);
            border-radius: 10px;
        }

        .progress-no-track {
            height: 75%;
            background: linear-gradient(to right, rgba(200, 135, 165, 0.1), #cc88aa);
            border-radius: 10px;
            transition: all 1s linear;
        }

        .progress-pointer {
            width: 14px;
            height: 14px;
            background-color: #fff;
            box-shadow: -0px 0px 5px rgba(0, 0, 0, 0.4);
            border-radius: 50%;
            position: absolute;
            top: -5.0px;
            z-index: 3;
            opacity: 0;
        }

        .progress-track {
            position: absolute;
            top: 0;
            width: 100%;
            height: 5px;
            background-color: rgba(var(--foreground-color-rgb), 0.21);
            border-radius: 10px;
            z-index: -1;
        }

    }
}

.progress-bigframe:hover .progress-pointer {
    opacity: 1;
}
</style>