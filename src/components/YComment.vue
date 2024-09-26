
<template>
    <div class="comment-main" :key="key">
        <div class="header">
            <div class="header-left">
                <div class="comment-title" v-if="showHeader">
                    {{ cmt.title }}
                </div>
                <div class="comment-count" v-if="showHeader && cmt.count > 0">
                    {{ cmt.count }}
                </div>
                <div></div>
            </div>
            <div class="header-right">
                <div class="sort-recommend sort-item" :class="cmt.sortType === 'recommend' ? 'sort-now' : ''"
                    @click="cmt.sortType = 'recommend'">
                    推荐排序
                </div>
                <div class="sort-hot sort-item" :class="cmt.sortType === 'hot' ? 'sort-now' : ''"
                    @click="cmt.sortType = 'hot'">
                    热度排序
                </div>
                <div class="sort-time sort-item" :class="cmt.sortType === 'time' ? 'sort-now' : ''"
                    @click="cmt.sortType = 'time'">
                    时间排序
                </div>
            </div>
        </div>
        <div class="comment-content">
            <div class="comment-item" v-for="(comment, index) in cmt.comments" :key="comment.commentId">
                <div class="content">
                    <div class="comment-avatar" @click="openUserPage(comment.user.userId)">
                        <img :src="comment.user.avatarUrl + '?param=50y50'" class="avatar-img">
                    </div>
                    <div class="after-avatar">
                        <div class="comment-user" @click="openUserPage(comment.user.userId)">
                            {{ comment.user.nickname }}
                        </div>
                        <div class="comment-text font-color-main">
                            {{ comment.content }}
                        </div>
                        <div class="bottom">
                            <div class="comment-time font-color-low">
                                {{ _formatDate_yyyymmdd(comment.time) }}
                            </div>
                            <div class="comment-like font-color-standard">
                                {{ comment.likedCount }}
                                <img src="@/assets/thumb.svg" class="like-img" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="comment-line" v-if="index !== cmt.comments.length - 1"></div>
            </div>
        </div>
        <YPage v-model="cmt.page" class="ypage" />
    </div>
</template>

<script lang="js">
import YPage from './YPage.vue';
import { YCommentC } from '@/tools/YCommentC';
import { formatDate_yyyymmdd } from '@/ncm/time';

export default {
    name: 'YComment',
    props: {
        type: {
            type: String,
            required: true,
        },
        id: {
            type: Number,
            required: true,
        },
        showHeader: {
            type: Boolean,
            default: true,
        },
    },
    components: {
        YPage,
    },
    data() {
        return {
            cmt: new YCommentC(this.type, this.id),
            key: 0,
        };
    },
    methods: {
        _formatDate_yyyymmdd(time) {
            return formatDate_yyyymmdd(time);
        },
        openUserPage(id) {
            this.$router.push({ path: `/user/${id}` });
        },
        update() {
            this.key++;
        },
    },
    mounted() {
        this.cmt.onCommentUpdate = () => {
            this.key++;
        };
    },
};

</script>

<style scoped>
.comment-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
}

.header {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}

.header-left {
    display: flex;
    flex-direction: row;
}

.comment-count {
    font-size: .8rem;
    font-weight: bold;
}

.comment-title {
    font-size: 1.2rem;
    font-weight: bold;
}

.header-right {
    display: flex;
    flex-direction: row;
}

.sort-now {
    color: rgb(106, 110, 213);
}

.sort-item {
    cursor: pointer;
    padding: 5px;
    margin: 5px;
    font-size: .9rem;
}

.comment-content {
    margin: 20px 0px;
    width: 100%;
}

.comment-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
}

.content {
    display: flex;
    flex-direction: row;
    width: calc(100% - 20px);
    text-align: left;
}

.comment-line {
    width: calc(100% - 80px);
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 15px 30px 15px 50px;
}

.after-avatar {
    width: calc(100% - 80px);
    display: flex;
    flex-direction: column;
}

.comment-avatar {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    cursor: pointer;
}

.avatar-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
}

.comment-user {
    font-size: 1rem;
    color: rgb(106, 110, 213);
    cursor: pointer;
    width: 100%;
}

.comment-text {
    font-size: 1rem;
    margin: 5px 0px;
    width: 100%;
}

.bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}

.comment-time {
    margin-top: 5px;
    font-size: 0.9rem;
    font-weight: bold;
}

.comment-like {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 1.1rem;
    font-weight: bold;
}

.like-img {
    width: 20px;
    height: 20px;
    margin-left: 5px;
    margin-bottom: 3px;
    opacity: .8;
}

.ypage {
    margin-bottom: 20px;
}
</style>
