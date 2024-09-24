<template>
    <div class="display">
        <YMessage message="This is an info message" />
    </div>
</template>

<script lang="js">
import YMessage from '@/components/YMessage.vue';

export default {
    name: 'YTestView',
    components: {
        YMessage,
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