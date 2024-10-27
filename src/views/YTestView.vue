<template>
    <div class="display">
        <YCreatePlaylist />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import YCreatePlaylist from '@/components/YCreatePlaylist.vue';
import YLoginWindow from '@/components/YLoginWindow.vue';

export default defineComponent({
    name: 'YTestView',
    components: {
        YCreatePlaylist,
        YLoginWindow,
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