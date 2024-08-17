<template>
    <div class="table-container">
        <!-- 3 表头 -->
        <div class="table-header">
            <!-- 4 歌曲序号-表头 -->
            <div class="songsCounter">
                <!-- 5 歌曲序号-表头按钮 -->
                <button class="header-button header-counter">
                    <span>#</span>
                </button>
            </div>
            <!-- 4 歌曲标题-表头 -->
            <div class="songsName" ref="songs_name_ref">
                <!-- 5 标题排序按钮 -->
                <button class="header-button" @click="handleSort">
                    <span>标题</span>
                    <!-- 6 排序内容 -->
                    <div class="sort-content">
                        <img :src="sortingStates[currentSortingIndex].icon" class="sort-icon" />
                        <span style="font-size:13px; color: #aaa;">{{ sortingStates[currentSortingIndex].text
                            }}</span>
                    </div>
                </button>
            </div>
            <!-- 4 resize控件 -->
            <div class="resizer" @mousedown="startResize($event)"></div>
            <!-- 4 专辑-表头 -->
            <div class="songsAlbum" ref="songs_album_ref">
                <!-- 5 专辑排序按钮 -->
                <button class="header-button" @click="handleSort_Album">
                    <span>专辑</span>
                    <!-- 6 排序内容 -->
                    <div class="sort-content">
                        <img :src="sortingStates_Album[currentSortingIndex_Album].icon" class="sort-icon" />
                        <span style="font-size:13px; color: #aaa;">{{
                            sortingStates_Album[currentSortingIndex_Album].text
                            }}</span>
                    </div>
                </button>
            </div>
            <!-- 4 喜欢-表头 -->
            <div class="likes">
                <button class="header-button">
                    <span>喜欢</span>
                </button>
            </div>
            <!-- 4 时长-表头 -->
            <div class="songsDuration">
                <!-- 5 时长排序按钮 -->
                <button class="header-button" @click="handleSort_Duration">
                    <span>时长</span>
                    <!-- 6 排序内容 -->
                    <div class="sort-content">
                        <img :src="sortingStates_Duration[currentSortingIndex_Duration].icon" class="sort-icon" />
                        <span style="font-size:13px; color: #aaa;">{{
                            sortingStates_Duration[currentSortingIndex_Duration].text
                            }}</span>
                    </div>
                </button>
            </div>
        </div>
        <!-- 3 歌曲列表内容 -->
        <ul v-if="!isLoading">
            <li v-for="(track, index) in filteredTracks" :key="track.id" class="track-item" ref="track_item_ref">
                <!-- 4 左侧对齐 -->
                <div class="align-left">
                    <!-- 5 歌曲序号 -->
                    <div class="track-count">{{ (currentPage - 1) * 1000 + index + 1 }}</div>
                    <!-- 5 封面图片 -->
                    <img class="track-cover" :src="track.al.picUrl" alt="Cover Image" />
                    <!-- 5 歌曲信息 -->
                    <div class="track-info" ref="trackInfo">
                        <!-- 6 歌曲名称 -->
                        <div class="track-name" ref="track_name_ref"
                            :title="track.name + (track.tns ? ('\n' + track.tns) : '')">{{ track.name }}</div>
                        <!-- 6 歌手名称 -->
                        <div class="track-artist">
                            <span v-for="(artist, index) in track.ar" :key="artist.id">
                                <!-- 7 歌手按钮 -->
                                <span @click="handleArtistClick(artist.id)" class="artist-button"
                                    :title="artist.name + (artist.tns ? ('\n' + artist.tns) : '')">
                                    {{ artist.name }}
                                </span>
                                <span v-if="index < track.ar.length - 1"> / </span>
                            </span>
                        </div>
                    </div>
                </div>
                <!-- 4 右侧对齐 -->
                <div class="align-right">
                    <!-- 5 专辑名称 -->
                    <div class="track-album" ref="track_album_ref">
                        <!-- 6 专辑按钮 -->
                        <button @click="handleAlbumClick(track.al.id)" class="album-button"
                            :title="track.al.name + (track.al.tns ? ('\n' + track.al.tns) : '')">
                            {{ track.al.name }}
                        </button>
                    </div>
                    <!-- 5 喜欢 -->
                    <div class="likes" style="text-align: left;">
                        <img v-if="likelist.includes(track.id)" src="../assets/likes.svg"
                            style="width: 16.8px; height: 16.8px; padding-left:10px;" />
                        <img v-else src="../assets/unlikes.svg"
                            style="width: 16.8px; height: 16.8px; padding-left:10px;" />
                    </div>
                    <!-- 5 时长 -->
                    <div class="track-duration">{{ formatDuration(track.dt) }}</div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script lang="js">
import { useApi } from '@/ncm/api';

export default{
    name: 'YSongsTable',
    data(){
        return {
            currentPage: 1, // 当前页码
            totalPages: 1,  // 总页数
            initialMouseX: 0,   // 鼠标初始位置
            initialAlbumWidth: 0,   // 初始专辑宽度
            deltaX: 0,
            
        }
    }
}


</script>

<style scoped>
/* 2 歌曲列表 */
.table-container {
    display: flex;
    max-width: 100vw;
    overflow: hidden;
    flex-direction: column;
}

/* 3 表头 */
.table-header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 1;
    justify-content: space-between;
    margin-bottom: 10px;
    /* background-color: rgba(255, 255, 255, 0.8); */
    /* 设置一个半透明的背景 */
    backdrop-filter: blur(8px);
    /* 给背景增加模糊效果 */
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    /* 增加边框以视觉分离 */
}

/* 4 歌曲序号-表头 */
.songsCounter {
    width: 50px;
    color: #aaa;
}

/* 4 歌曲序号-表头悬停样式 */
.songsCounter .header-button:hover {
    cursor: initial;
    background-color: transparent;
}

/* 4 歌曲标题-表头 */
.songsName {
    flex: 1;
    text-align: left;
    color: #fff;
}

/* 4 resize 控件 */
.resizer {
    width: 5px;
    /* 调整宽度，增加点击区域 */
    cursor: ew-resize;
    /* 鼠标悬停时显示列调整光标 */
    background-color: transparent;
    /* 默认情况下透明 */
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    /* 确保它位于其他内容之上 */
}

/* 4 专辑-表头 */
.songsAlbum {
    /* padding-left: 10px; */
    padding-right: 10px;
    text-align: left;
    width: 230px;
    color: #ccc;
}

/* 4 喜欢-表头 */
/* 4 喜欢 */
.likes {
    width: 60px;
}

/* 4 喜欢-表头悬停样式 */
.likes .header-button:hover {
    cursor: initial;
    background-color: transparent;
}

/* 4 时长-表头 */
.songsDuration {
    width: 80px;
    text-align: left;
    color: #aaa;
}

/* 5 排序按钮 */
.header-button {
    padding-top: 5px;
    padding-bottom: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: #ccc;
    text-align: left;
    width: 100%;
    border-radius: 5px;
    transition: all 0.3s;
}

/* 5 排序按钮悬停样式 */
.header-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

/* 5 歌曲序号-表头按钮 */
.header-counter {
    text-align: center;
}

/* 6 排序内容 */
.sort-content {
    position: relative;
    display: inline-block;
    padding: 0;
    background-color: transparent;
    border: none;
    opacity: 0;
    transition: all 0.3s;
}

/* 6 排序内容悬停样式 */
.header-button:hover .sort-content {
    opacity: 1;
}

/* 7 排序图标 */
.sort-icon {
    opacity: 0.6;
    width: 10px;
    height: 10px;
    margin-left: 5px;
}

/* 3 歌曲列表内容 */
ul {
    list-style-type: none;
    padding: 0;
}

/* 3 歌曲列表内容 */
li {
    margin-bottom: 5px;
}

/* 3 歌曲列表内容 */
.track-item {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin: 0px;
    padding: 7px 0px 7px 0px;
    border-radius: 10px;
    transition: all 0.3s;
}

/* 3 歌曲列表内容悬停样式 */
.track-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* 4 左侧对齐 */
.align-left {
    display: flex;
    margin-right: 10px;
    flex: 1;
    align-items: center;
    /* 使歌曲信息不会溢出 */
    overflow: hidden;
}

/* 5 歌曲序号 */
.track-count {
    flex: 0 0 auto;
    width: 50px;
    color: #aaa;
}

/* 5 封面图片 */
.track-cover {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    margin-right: 10px;
    user-select: none;
    -webkit-user-drag: none;
}

/* 5 歌曲信息 */
.track-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    text-align: left;
}

/* 6 歌曲名称 */
.track-name {
    text-align: left;
    color: #fff;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 15px;
}

/* 6 歌手名称 */
.track-artist {
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    /* max-width: 90%; */
    text-overflow: ellipsis;
    text-align: left;
}

/* 7 歌手按钮 */
.artist-button {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    padding: 0%;
    margin: 0%;
    color: #aaa;
    cursor: pointer;
    background-color: transparent;
    border: none;
    transition: all 0.3s;
}

/* 7 歌手按钮悬停样式 */
.artist-button:hover {
    color: #ccc;
}

/* 4 右侧对齐 */
.align-right {
    display: flex;
    align-items: center;
}

/* 5 专辑名称 */
.track-album {
    /* padding-left: 10px; */
    padding-right: 10px;
    text-align: left;
    width: 230px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 6 专辑按钮 */
.album-button {
    max-width: 80%;
    padding: 0%;
    margin: 0%;
    color: #ccc;
    font-size: 14px;
    cursor: pointer;
    background-color: transparent;
    border: none;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 5 时长 */
.track-duration {
    width: 80px;
    text-align: left;
    color: #aaa;
    font-size: 14px;
}
</style>