<template>
    <YSongsTable :resortable="false" stickyTop="50px" :canSendPlaylist="false" :showTrackCover="true"
        v-model="listWithLyrics" :showLyrics="true" ref="songs_table" :id="'YSearchLyrics.vue'" />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import YSongsTable from './YSongsTable.vue';
import { ITrack } from '@/utils/tracks';

export default defineComponent({
    name: 'YSearchLyrics',
    props: {
        modelValue: {
            type: Array as () => ITrack[],
            default: () => [],
        },
    },
    setup(props) { 
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
})

</script>

<style lang="scss" scoped>
.list-container {
    display: flex;
}
</style>