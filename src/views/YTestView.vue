<template>
    <div class="display">
        <YPage v-model="page" />
    </div>
</template>

<script lang="js">
import YPage from '@/components/YPage.vue';
import { YPageC } from '@/tools/YPageC';

export default {
    name: 'YTestView',
    components: {
        YPage,
    },
    data() {
        return {
            page: new YPageC(2),
        };
    },
    methods: {

    },
    mounted() {
        this.page.onPageChange = () => {
            console.log('page change', this.page.current);
        };
    },
}

</script>