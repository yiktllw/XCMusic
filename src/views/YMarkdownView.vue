<template>
    <div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { marked } from 'marked';

export default defineComponent({
    name: 'YMarkdownView',
    props: {
        filePath: {
            type: String,
            required: true,
        },
    },
    computed: {
        markdownContent() {
            return marked.parse(this.filePath);
        },
    },
    setup(props) {
        
    },
});
</script>