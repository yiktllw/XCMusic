<script setup lang="js">
import { defineModel } from 'vue';
const progress = defineModel();    
</script>

<template>
    <div class="progress-bigframe">
        <div class="progress-bar" @click="onClick" ref="progress_bar">
            <div class="progress-fill" />
            <div class="progress-pointer" :style="{ top: 'calc(100% - ' + progress * 100 + '%' + ' - 5px )' }"
                @mousedown="startSetProgress" @mouseup="endSetProgress" />
            <div class="overflow-hidden">
                <div class="progress-fill-corner" :style="{ bottom: 'calc(' + progress * 100 + '%' + ' - 5px )' }" />
                <div class="progress-track" :style="{ bottom: 'calc(' + progress * 100 + '%' + ' - 5px )' }" />
            </div>
        </div>
    </div>
</template>

<script lang="js">

export default {
    name: 'YProgressBar',
    emits: [
        'update:modelValue',
        'set-progress-end',
    ],
    methods: {
        updateProgress(y) {
            const rect = this.$refs.progress_bar.getBoundingClientRect();
            const dy = y - rect.top;
            let progress = 1 - dy / rect.height;
            if (progress < 0) {
                progress = 0;
            } else if (progress > 1) {
                progress = 1;
            }
            this.$emit('update:modelValue', progress);
        },
        updateProgressEvent(e) {
            this.updateProgress(e.clientY);
        },
        onClick(e){
            this.updateProgress(e.clientY);
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

<style scoped>
.progress-bigframe {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    position: relative;
}

.progress-bar {
    width: 5px;
    height: 100%;
    position: relative;
    cursor: pointer;
}

.progress-fill {
    width: 100%;
    height: 100%;
    background-color: rgb(254, 60, 90);
    border-radius: 10px;
}

.progress-fill-corner {
    width: 5px;
    height: 5px;
    background-color: rgb(254, 60, 90);
    border-radius: 50%;
    position: absolute;
    z-index: 2;
}

.progress-pointer {
    width: 13px;
    height: 13px;
    left: -4px;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    z-index: 3;
}

.overflow-hidden {
    position: relative;
    width: 5px;
    bottom:100%;
    height: 100%;
    border-radius: 5px;
    overflow: hidden;
    /* transform: translateY(-200%); */
}

.progress-track {
    position: absolute;
    width: 5px;
    height: 120%;
    background-color: #555;
    border-radius: 10px;
    z-index: 1;
}
</style>