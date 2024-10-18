<template>
    <div>

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    name: 'YSheetView',
    setup() {
        const store = useStore();
        return {
            login: store.state.login,
        };
    },
});

</script>