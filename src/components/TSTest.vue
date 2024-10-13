<template>
    <div>

    </div>
</template>

<script lang="ts">
// import { mapState } from 'vuex';
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

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
    mounted() {
        console.log('TSTest mounted');
    },
});

</script>