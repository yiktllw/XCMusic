<template>
    <div class="loading-spinner"></div>
</template>

<script lang="js">
export default {
    name: 'YLoading'
}

</script>

<style scoped>
@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}


.loading-spinner {
    margin: auto;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border-top: 3px solid #90cf5b;
    border-right: 3px solid transparent;
    -webkit-animation: rotation 1s linear infinite;
    animation: rotation 1s linear infinite;
}
</style>