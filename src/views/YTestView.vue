<template>
    <div class="display">
        <button @click="$refs.playUI.tooglePanel">
            切换
        </button>
        <YMultiSelect ref="playUI" :tracks="tracks" />
    </div>
</template>

<script lang="js">
import YMultiSelect from '@/components/YMultiSelect.vue';
import { mapState } from 'vuex';

export default {
    name: 'YTestView',
    components: {
        YMultiSelect,
    },
    computed: {
        ...mapState({
            player: state => state.player,
            setting: state => state.setting,
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