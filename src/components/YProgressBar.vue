<template>
    <div>
        <a-row>
            <a-col :span="12">
                <a-slider v-model:value="inputValue1" :min="1" :max="20" />
            </a-col>
            <a-col :span="4">
                <a-input-number v-model:value="inputValue1" :min="1" :max="20" style="margin-left: 16px" />
            </a-col>
        </a-row>
        <a-row>
            <a-col :span="12">
                <a-slider v-model:value="inputValue" :min="0" :max="1" :step="0.01" />
            </a-col>
            <a-col :span="4">
                <a-input-number v-model:value="inputValue" :min="0" :max="1" :step="0.01" style="margin-left: 16px" />
            </a-col>
        </a-row>
    </div>
</template>
<script lang="js">
import { defineComponent, ref } from 'vue';
export default defineComponent({
    setup() {
        const inputValue = ref < Number > (0);
        const inputValue1 = ref < Number > (1);
        return {
            inputValue,
            inputValue1,
        };
    },
    name: 'YProgressBar',
});
</script>
<style scoped>
.code-box-demo .ant-slider {
    margin-bottom: 16px;
}
</style>