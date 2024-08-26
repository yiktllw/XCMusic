<script setup lang="js">
import { defineModel } from 'vue';
const progress = defineModel();    
</script>

<template>
    <div class="progress-bigframe">
        <div class="progress-bar" @click="updateProgressEvent" ref="progress_bar">
            <div class="progress-fill" />
            <div class="progress-pointer" :style="{ left: 'calc(' + progress * 100 + '%' + ' - 5px )' }"
                @mousedown="startSetProgress" @mouseup="endSetProgress" />
            <div class="overflow-hidden">
                <div class="progress-fill-corner" :style="{ left: 'calc(' + progress * 100 + '%' + ' - 5px )' }" />
                <div class="progress-track" :style="{ left: 'calc(' + progress * 100 + '%' + ' - 5px )' }" />
            </div>
        </div>
    </div>
</template>

<script lang="js">

export default {
    name: 'YProgressBar',
    emits: [
        'update:modelValue'
    ],
    methods: {
        updateProgress(x){
            const rect = this.$refs.progress_bar.getBoundingClientRect();
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
        startSetProgress() {
            window.addEventListener('mousemove', this.updateProgressEvent);
            window.addEventListener('mouseup', this.endSetProgress);
        },
        endSetProgress() {
            window.removeEventListener('mousemove', this.updateProgressEvent);
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
    position: relative;
}

.progress-bar {
    width: 100%;
    height: 5px;
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
    top: 0;
    z-index: 2;
}

.progress-pointer {
    width: 10px;
    height: 10px;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: -3.0px;
    z-index: 3;
    opacity: 0;
}

.progress-bigframe:hover .progress-pointer {
    opacity: 1;
}

.overflow-hidden {
    position: relative;
    width: 100%;
    top: -5px;
    height: 5px;
    border-radius: 5px;
    overflow: hidden;
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
</style>