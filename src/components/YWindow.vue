<template>
    <div class="window" v-if="showWindow">
        <div class="window-header">
            <slot name="header">标题</slot>
            <img src="@/assets/close.svg" class="close-icon" @click="this.showWindow = false" />
        </div>
        <slot></slot>
    </div>
</template>

<script lang="js">
export default {
    name: 'YWindow',
    data() {
        return {
            showWindow: true,
        };
    },
    emits: [
        'new-window-state'
    ],
    watch: {
        showWindow(val) {
            this.$emit('new-window-state', val);
        },
    },
    methods: {
        toogleWindow() {
            this.showWindow = !this.showWindow;
        },
        displayWindow() {
            this.showWindow = true;
        },
        closeWindow() {
            this.showWindow = false;
        },
    },
    mounted() {
    },
}
</script>

<style scoped>
.window {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgb(45, 45, 55);
    color: #fff;
    /* border: 1px solid #000; */
    width: 100%;
    border-radius: 5px;
    padding: 10px 0px;
    margin: 10px;
}

.window-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: calc(100% - 30px);
    padding: 0px 15px 10px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, .1);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.close-icon {
    width: 14px;
    height: 14px;
    cursor: pointer;
    opacity: .7;
}

.close-icon:hover {
    opacity: 1;
}
</style>