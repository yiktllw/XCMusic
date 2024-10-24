<template>
    <div class="display">
        <YSubscribedAlbumView />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import { ipcRenderer } from 'electron';
import YSubscribedAlbumView from './YSubscribedAlbumView.vue';

export default defineComponent({
    name: 'YTestView',
    components: {
        YSubscribedAlbumView,
    },
    setup(){
        const store = useStore();
        
        return {
            player: store.state.player,
            setting: store.state.setting,
            download: store.state.download,
        }
    },
    computed: {
    },
    data() {
        return {
        };
    },
    methods: {
    },
    mounted() {
    },
    beforeUnmount() {
    },
})

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