<template>
    <!--欢迎界面-->
    <div class="container">
        <img src="../assets/xc.svg" alt="XC Logo" class="full-width-image" />
    </div>
</template>

<script lang="ts">
import { YColor } from '@/utils/color';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'YGreetingView',
    mounted() {
        YColor.setBackgroundColorTheme();
    }
});
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    .full-width-image {
        width: 100%;
        max-width: 100%;
        max-height: 100%;
    }
}
</style>