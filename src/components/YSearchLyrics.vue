<template>
    <YSongsTable :resortable="false" stickyTop="50px" :canSendPlaylist="false" :showTrackCover="true"
        :tracks="this.listWithLyrics" :showLyrics="true" ref="songs_table" />
</template>

<script lang="js">
import YSongsTable from './YSongsTable.vue';
export default {
    name: 'YSearchLyrics',
    props: {
        listWithLyrics: {
            type: Array,
            default: () => [],
        }
    },
    components: {
        YSongsTable,
    },
}

</script>

<style scoped>
.list-container {
    display: flex;
}
</style>