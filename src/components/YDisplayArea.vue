<template>
    <div>
        <div class="display-area">
            <RouterView />
        </div>
    </div>
</template>

<script>

export default {
    name: 'YDisplayarea',
};
</script>

<style scoped>
.display-area {
    border: none;
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    overflow: hidden;
}
</style>