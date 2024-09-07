<template>
    <div class="display">
        <YComment :type="type" :id="id" />
    </div>
</template>

<script lang="js">
import YComment from '@/components/YComment.vue';

export default {
    name: 'YTestView',
    components: {
        YComment,
    },
    data() {
        return {
            type: 'album',
            id: 166936,
        };
    },
    methods: {

    },
    mounted() {
    },
}

</script>