<template>
    <div class="display">
        <YPlayUI />
    </div>
</template>

<script lang="js">
import YPlayUI from '@/components/YPlayUI.vue';
import { mapState } from 'vuex';

export default {
    name: 'YTestView',
    components: {
        YPlayUI,
    },
    computed: {
        ...mapState({
            player: state => state.player,
        }),
    },
    data() {
        return {
            tracks: [],
        };
    },
    methods: {

    },
    mounted() {
        this.tracks = this.player.playlist
        this.player.Subscribe({
            id: 'YTestView',
            func: () => {
                this.tracks = this.player.playlist;
            },
            type: 'playlist',
        })
    },
    beforeUnmount() {
        this.player.UnSubscribe({
            id: 'YTestView',
            type: 'playlist',
        });
    },
}

</script>

<style lang="scss" scoped>
.display {
    display: flex;
    justify-content: center;
    align-items: center;
}

.item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
}
</style>