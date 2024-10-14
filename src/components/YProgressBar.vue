<template>
    <div class="progress-bigframe" ref="big_frame" @mousemove="handleMousemove" @mouseleave="HideInfo" @click="onClick">
        <div class="progress-bar" ref="progress_bar" v-if="true">
            <div :class="showTrack ? 'progress-fill' : 'progress-no-track'"
                :style="{ clipPath: `inset( 0 ${100 - progress * 100}% 0 0 round 20px)` }"
                :ref="showTrack ? 'noSelect' : 'progressDOM'"></div>
            <div class="progress-pointer" v-if="showTrack"
                :style="{ left: 'calc(' + progress * 100 + '%' + ' - 7px )' }" @mousedown="startSetProgress"
                @mouseup="endSetProgress">
            </div>
            <div class="play-info" v-else-if="showInfo" :style="{
                left: 'calc(' + mouseProgress * 100 + '%' + ' - 30px )',
            }">
                {{ formatDuration(mouseProgress) }}
            </div>
            <div class="progress-track" v-if="showTrack"></div>
        </div>
    </div>
</template>

<script lang="js">
import { formatDuration_mmss } from '@/ncm/time';
import { ref, watch } from 'vue';

export default {
    name: 'YProgressBar',
    data() {
        return {
            mouseProgress: 0,
            showInfo: false,
        };
    },
    emits: [
        'update:modelValue',
        'set-progress-end'
    ],
    setup(props) { 
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
        totalTime: {
            type: Number,
            default: 100,
        }
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
        },
        formatDuration(progress) {
            let duration = Math.floor(progress * this.totalTime * 1000);
            return formatDuration_mmss(duration);
        },
        handleMousemove(event) {
            this.mouseProgress = event.clientX / this.$refs.big_frame.getBoundingClientRect().width;
            this.showInfo = true;
        },
        HideInfo() {
            this.showInfo = false;
        },
    }
};

</script>

<style lang="scss" scoped>
.progress-bigframe {
    display: flex;
    width: 100%;
    height: 30px;
    align-items: center;
    position: relative;
    cursor: pointer;

    &:hover {
        .progress-bar {
            .progress-no-track {
                height: 115%;
                transform: translateY(-40%);
            }
        }
    }

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
            transition: clip-path 1s linear, height 0.3s ease, transform 0.3s ease;
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

        .play-info {
            position: absolute;
            top: -38px;
            background-color: var(--panel-background-color);
            color: var(--font-color-main);
            font-size: 14px;
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 5px;
            z-index: 2;
            box-shadow: rgba($color: #000, $alpha: 0.4) 0 0 3px 0;

            &::after {
                content: "";
                position: absolute;
                bottom: -10px;
                /* 控制尖角距离矩形的距离 */
                left: 50%;
                /* 尖角居中对齐 */
                transform: translateX(-50%);
                border-width: 10px 10px 0 10px;
                border-style: solid;
                border-color: var(--panel-background-color) transparent transparent transparent;
            }
        }
    }
}

.progress-bigframe:hover .progress-pointer {
    opacity: 1;
}
</style>