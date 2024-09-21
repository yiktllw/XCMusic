<template>
    <div class="display">
        <YAddToPlaylist :ids="[1458660]" />
    </div>
</template>

<script lang="js">
import YAddToPlaylist from '@/components/YAddToPlaylist.vue';

export default {
    name: 'YTestView',
    components: {
        YAddToPlaylist,
    },
    data() {
        return {
        };
    },
    methods: {

    },
    mounted() {
    },
}

</script>

<style scoped>
.display {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>