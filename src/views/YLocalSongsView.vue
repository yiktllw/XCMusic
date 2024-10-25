<template>
    <div class="main">

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';
import YSongsTable from '@/components/YSongsTable.vue';

export default defineComponent({
    name: 'YLocalSongsView',
    components: {
        YSongsTable,
    },
    setup(){
        const store = useStore();
        return {
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
</style>