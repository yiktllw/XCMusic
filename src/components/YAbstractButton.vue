<template>
    <button :class="['custom-button', buttonType]" :style="{ color: textColor }" >
        <img v-if="img" :src="img" alt="button icon" class="button-icon" />
        {{ label }}
    </button>
</template>

<script lang="js">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'YAbstractButton',
    props: {
        label: {
            type: String,
            required: true
        },
        buttonType: {
            type: String,
            default: 'default'
        },
        textColor: {
            type: String,
            default: '#000'
        },
        img: {
            type: String,
            default: ''
        }
    },
});
</script>

<style scoped>
.custom-button {
    display:inline-flex;
    align-items: center;
    background-color: transparent;
    border: 2px solid transparent;
    border-radius: 13px;
    cursor: pointer;
    padding-left:5px;
    padding-top: 5px;
    padding-bottom: 5px;
    transition: all 0.3s ease;
    -webkit-app-region: no-drag;
    user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    overflow: hidden;
    min-height: 40px;
}

.custom-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.button-icon {
    margin-right: 8px; /* 调整图标和文字之间的间距 */
    width: 30px; /* 调整图标的宽度 */
    height: 30px; /* 调整图标的高度 */
}
</style>