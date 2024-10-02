<template>
    <transition name="playui-slide">
        <div class="container" v-if="show">
            <div class="ui">

            </div>
        </div>
    </transition>
</template>

<script lang="js">

export default {
    name: 'YPlayUI',
    props: {
        show: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
    },
    methods: {
    },
    mounted() {
    },
};
</script>

<style lang="scss" scoped>
.container{
    display: flex;
    width: 100%;
    height: 100%;
}
</style>