<template>
    <YSongsTable :resortable="false" stickyTop="50px" :canSendPlaylist="false" :showTrackCover="true"
        v-model="listWithLyrics" :showLyrics="true" ref="songs_table" :id="'YSearchLyrics.vue'" />
</template>

<script lang="js">
import YSongsTable from './YSongsTable.vue';
import { ref, watch } from 'vue';

export default {
    name: 'YSearchLyrics',
    setup(props) { // eslint-disable-line
        // progress 的本地状态
        const listWithLyrics = ref(props.modelValue);

        // 监听 modelValue 的变化
        watch(() => props.modelValue, (newValue) => {
            listWithLyrics.value = newValue;
        });
        return {
            listWithLyrics
        };
    },
    components: {
        YSongsTable,
    },
}

</script>

<style lang="scss" scoped>
.list-container {
    display: flex;
}
</style>