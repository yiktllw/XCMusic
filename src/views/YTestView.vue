<template>
    <div class="display">
        <YWindow>
            <template #header>
                Test View
            </template>
            <p>This is a test view.</p>
        </YWindow>
    </div>
</template>

<script lang="js">
import YWindow from '@/components/YWindow.vue';

export default {
    name: 'YTestView',
    components: {
        YWindow,
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