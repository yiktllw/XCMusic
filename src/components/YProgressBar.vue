<template>
    <div class="progress-bigframe">
        <div class="progress-bar" @click="onClick" ref="progress_bar" v-if="showTrack" :key="key">
            <div class="progress-fill" />
            <div class="progress-pointer" :style="{ left: 'calc(' + progress * 100 + '%' + ' - 5px )' }"
                @mousedown="startSetProgress" @mouseup="endSetProgress" />
            <div class="overflow-hidden">
                <div class="progress-fill-corner" :style="{ left: 'calc(' + progress * 100 + '%' + ' - 5px )' }" />
                <div class="progress-track" :style="{ left: 'calc(' + progress * 100 + '%' + ' - 7px )' }" />
            </div>
        </div>
        <div v-else class="progress-bar no-track" @click="onClick" ref="progress_bar_no_track">
            <div class="progress-no-track" :style="{ 'width': progress * 100 + '%' }" ref="progressDOM" />
            <div class="progress-pointer" :style="{ left: 'calc(' + progress * 100 + '%' + ' - 7px )' }"
                @mousedown="startSetProgress" @mouseup="endSetProgress" />
        </div>
    </div>
</template>

<script lang="js">
import { ref, watch } from 'vue';

export default {
    name: 'YProgressBar',
    data() {
        return {
            key: 0,
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
    watch: {
        progress(newValue) {
            this.key = newValue > 0.5 ? 1 : 0;
        }
    },
    methods: {
        updateProgress(x) {
            let rect = null;
            if (this.showTrack) {
                rect = this.$refs.progress_bar.getBoundingClientRect();
            } else {
                rect = this.$refs.progress_bar_no_track.getBoundingClientRect();
            }
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

        .progress-pointer {
            width: 14px;
            height: 14px;
            background-color: #fff;
            border-radius: 50%;
            position: absolute;
            top: -5.0px;
            z-index: 3;
            opacity: 0;
        }

        .overflow-hidden {
            position: relative;
            width: 100%;
            top: -5px;
            height: 5px;
            border-radius: 5px;
            overflow: hidden;

            .progress-fill-corner {
                width: 5px;
                height: 5px;
                background-color: rgb(254, 60, 90);
                border-radius: 50%;
                position: absolute;
                top: 0;
                z-index: 2;
            }

            .progress-track {
                position: absolute;
                top: 0;
                width: 120%;
                height: 5px;
                background-color: #555;
                border-radius: 10px;
                z-index: 1;
            }
        }
    }

    .no-track {
        .progress-no-track {
            height: 75%;
            background: linear-gradient(to right, rgba(200, 135, 165, 0.1), #cc88aa);
            border-radius: 10px;
            transition: all 1s linear;
        }
    }
}

.progress-bigframe:hover .progress-pointer {
    opacity: 1;
}
</style>