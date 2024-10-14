<template>
    <div>
        <YPanel ref="panel">

        </YPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import YPanel from '@/components/YPanel.vue';

export default defineComponent({
    setup() {
        const store = useStore();
        const player = store.state.player;

        function increment() {
            store.commit('increment');
        }

        return {
            player,
            increment,
        };
    },
    methods: {
        test(val: string) {
            console.log('test', val);
            console.log('panel', this.$refs.panel)
        },
    },
    components: {
        YPanel,
    },
    mounted() {
        console.log('TSTest mounted');
    },
});

</script>