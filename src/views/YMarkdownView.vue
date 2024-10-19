<template>
    <div class="font-color-main md" v-html="markdownContent">
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { marked } from 'marked';
import README from '../../README.md';
import CHANGELOG from '../../CHANGELOG.md';
let path: null | any = null;
if (window.electron?.isElectron) {
    path = window.api.path;
}

const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }: { href: string, title?: string | null | undefined, text: string }) => {
    return text;
};
renderer.image = ({ href, title, text }: { href: string, title?: string | null | undefined, text: string }) => {
    return `<img src="${href}" alt="${text}" style="width: 100%;"/>`;
};

marked.setOptions({
    renderer: renderer,
});

export default defineComponent({
    name: 'YMarkdownView',
    props: {
        file: {
            type: String,
            required: true,
        },
    },
    computed: {
        markdownContent() {
            if (!this.file) {
                return '';
            }
            if (this.file === 'README') {
                return marked.parse(README);
            } else if (this.file === 'CHANGELOG') {
                return marked.parse(CHANGELOG);
            }
        },
    },
});
</script>

<style lang="scss" scoped>
.md {
    padding: 20px;
    font-size: 18px;
    line-height: 1.6;
    text-align: left;
}
</style>