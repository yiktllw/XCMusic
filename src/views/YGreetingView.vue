<template>
    <div class="container">
        <img src="../assets/xc.svg" alt="XC Logo" class="full-width-image" />
    </div>
</template>

<script>
export default {
    name: 'YGreetingView'
};
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.full-width-image {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
}
</style>