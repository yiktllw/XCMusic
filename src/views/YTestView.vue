<template>
    <div class="display">
        <YMultiSelect v-model="tracks">
            <template #item="{ item, index }"><!--eslint-disable-line-->
                <div class="item font-color-main">
                    <div class="align-up">
                        <div class="align-left">
                            <div class="track-count">
                                {{ index + 1 }}
                            </div>
                        </div>
                        {{ item.name }}
                    </div>
                </div>
            </template>
        </YMultiSelect>
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

<style scoped>
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