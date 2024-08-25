<template>
    <div class="container">
        <div class="bar bar1"></div>
        <div class="bar bar2"></div>
        <div class="bar bar3"></div>
    </div>
</template>

<script lang="js">
export default {
    name: 'YPlaying',
}

</script>

<style scoped>
.container {
    display: flex;
    width: 15px;
    height: 15px;
    align-items: flex-end;
}

.bar {
    width: 2.0px;
    margin:1.5px;
    border-top-left-radius: 1px;
    border-top-right-radius: 1px;
    /* Width of the bars */
    background-color: rgb(234, 78, 68);
    animation: sineWave 1s infinite;
}

.bar1 {
    animation-delay: 0s;
}

.bar2 {
    animation-delay: -0.25s;
    /* Phase shift of pi/2 */
}

.bar3 {
    animation-delay: -.5s;
    /* Phase shift of pi */
}

@keyframes sineWave {
    0% {
        height: 20%;
    }

    50% {
        height: 100%;
    }

    100% {
        height: 20%;
    }
}
</style>