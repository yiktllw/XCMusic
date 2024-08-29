<template>
    <div class="artists-list">
        <div class="artists-item" v-for="(artist) in artists" :key="type === 'artist' ? artist.id : artist.userId">
            <div class="artists-name" @click="openUserPage(type === 'artist' ? artist.id : artist.userId,type)" :title="artist.name">
                <img :src="artist._picUrl" class="artists-avatar">
                <div class="artists-name-text">{{ type === 'artist' ?  artist.name : artist.nickname }}</div>
            </div>
            <div class="artists-track-count" :title=" type === 'artist' ?  artist.albumSize : artist.followeds">
                <span>{{ type === 'artist' ? ( '专辑: '+ artist.albumSize) : ('粉丝: ' + artist.followeds) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="js">
export default {
    name: 'YArtistList',
    props: {
        artists: {
            type: Array,
            default: () => [],
        },
        type : {
            type: String,
            default: 'artist'
        }
    },
    methods: {
        openUserPage(id) {
            console.log('open user page :', id)
        }
    }, 
}

</script>

<style scoped>
.artists-list{
    display: flex;
    flex-wrap: wrap;
    /* justify-content: ; */
    color: #fff;
}
        
.artists-item{
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-bottom: 20px;
    padding: 10px;
    max-width: 210px;
    min-width: 180px;
    border-radius: 10px;
    cursor: pointer;
}

.artists-item:hover{
    background-color: rgba(255, 255, 255, .05);
}
        
.artists-avatar{
    width: 130px;
    height: 130px;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 10px;
}
        
.artists-name-text{
    font-size: 17px;
    color: #eee;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
        
.artists-track-count{
    font-size: 14px;
    color: #bbb;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

</style>