<template>
    <div class="display">
        <YTextBanner :text="'Violin Concerto in D minor, op.47, I: Allegro'" style="width: 300px;" />
    </div>
</template>

<script lang="js">
import YTextBanner from '@/components/YTextBanner.vue';

export default {
    name: 'YTestView',
    components: {
        YTextBanner,
    },
    data() {
        return {
        };
    },
    methods: {

    },
    mounted() {
    },
}

</script>

<style scoped>
.display {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>