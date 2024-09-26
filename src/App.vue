<template>
    <router-view />
</template>

<script lang="js">

export default {
    name: 'App',
    mounted() {
        this.$router.push({ path: '/greeting'});
        console.log('App component mounted.');
    }
}

</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
}
</style>
