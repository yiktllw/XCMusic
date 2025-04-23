<template>
  <!-- 评论组件 -->
  <div v-if="loading" class="skeleton">
    <ContentLoader
      :speed="1.5"
      :width="1000"
      :height="800"
      primaryColor="rgba(var(--foreground-color-rgb), 0.2)"
      secondaryColor="rgba(var(--foreground-color-rgb), 0.1)"
    >
      <!-- 标题 -->
      <rect x="0" y="0" rx="8" ry="8" width="120" height="16" />
      <!-- 评论 -->
      <template v-for="i in 7">
        <!-- 头像 -->
        <rect
          x="0"
          :y="(i - 1) * 110 + 50"
          rx="25"
          ry="25"
          width="50"
          height="50"
        />
        <!-- 用户名 -->
        <rect x="60" :y="(i - 1) * 110 + 50" rx="6" width="180" height="12" />
        <!-- 评论内容 -->
        <rect x="60" :y="(i - 1) * 110 + 80" rx="6" width="800" height="12" />
        <rect x="60" :y="(i - 1) * 110 + 110" rx="5" width="100" height="10" />
        <!-- 评论时间 -->
      </template>
    </ContentLoader>
  </div>
  <div v-else class="comment-main">
    <div class="header">
      <div class="header-left">
        <div class="font-size-larger" v-if="showHeader">
          {{ $t("comment.all_comment") }}
        </div>
        <div class="font-size-small" v-if="showHeader && cmt.count > 0">
          {{ cmt.count }}
        </div>
        <div></div>
      </div>
      <div class="header-right">
        <div
          class="sort-recommend sort-item"
          :class="cmt.sortType === 'recommend' ? 'sort-now' : ''"
          @click="cmt.sortType = 'recommend'"
        >
          {{ $t("comment.recommend_order") }}
        </div>
        <div
          class="sort-hot sort-item"
          :class="cmt.sortType === 'hot' ? 'sort-now' : ''"
          @click="cmt.sortType = 'hot'"
        >
          {{ $t("comment.hot_order") }}
        </div>
        <div
          class="sort-time sort-item"
          :class="cmt.sortType === 'time' ? 'sort-now' : ''"
          @click="cmt.sortType = 'time'"
        >
          {{ $t("comment.time_order") }}
        </div>
      </div>
    </div>
    <div class="comment-content">
      <div class="comment-item" v-for="(comment, index) in cmt.comments">
        <div class="content">
          <div
            class="comment-avatar"
            @click="openUserPage(comment.user.userId)"
          >
            <img
              :src="comment.user.avatarUrl + '?param=100y100'"
              class="avatar-img"
            />
          </div>
          <div class="after-avatar">
            <div
              class="comment-user"
              @click="openUserPage(comment.user.userId)"
            >
              {{ comment.user.nickname }}
            </div>
            <div class="comment-text font-color-main">
              {{ comment.content }}
            </div>
            <blockquote class="replied" v-if="comment.beReplied?.length > 0">
              <div
                class="replied-user"
                @click="openUserPage(comment.beReplied[0].user.userId)"
              >
                <img
                  class="avatar"
                  :src="comment.beReplied[0].user.avatarUrl + `?param=20y20`"
                />
                <span class="nickname">
                  {{ comment.beReplied[0].user.nickname }}
                </span>
              </div>
              <div>
                {{ comment.beReplied[0].content }}
              </div>
            </blockquote>
            <div class="bottom">
              <div class="comment-time font-size-small font-color-low">
                {{ _formatDate_yyyymmdd(comment.time) }}
              </div>
              <div class="comment-like font-size-large font-color-standard">
                {{ comment.likedCount }}
                <img src="@/assets/thumb.svg" class="like-img g-icon" />
              </div>
            </div>
          </div>
        </div>
        <div
          class="comment-line"
          v-if="index !== cmt.comments.length - 1"
        ></div>
      </div>
    </div>
    <YPage v-model="cmt.page" class="ypage" />
  </div>
</template>

<script src="./YComment.ts" lang="ts"></script>

<style lang="scss" scoped>
.skeleton {
  align-items: start;
  justify-content: start;
  justify-self: start;
  overflow: hidden;
  height: 100%;
}
.comment-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;

  .header {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;

    .header-left {
      display: flex;
      font-weight: bold;
    }

    .header-right {
      display: flex;

      .sort-now {
        color: rgb(106, 110, 213);
      }

      .sort-item {
        font-size: var(--font-size-small);
        cursor: pointer;
        padding: 5px;
        margin: 5px;
      }
    }
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

    .content {
      display: flex;
      flex-direction: row;
      width: calc(100% - 20px);
      text-align: left;

      .comment-avatar {
        width: 50px;
        height: 50px;
        margin-right: 10px;
        cursor: pointer;

        .avatar-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
      }

      .after-avatar {
        width: calc(100% - 80px);
        display: flex;
        flex-direction: column;
        blockquote.replied {
          display: flex;
          flex-direction: column;
          color: var(--font-color-standard);
          border-left: 4px solid rgba(var(--foreground-color-rgb), 0.3);
          margin: 5px 0 5px 0;
          padding: 3px 1rem;
          line-height: 1.5rem;
          font-size: 15px;

          .replied-user {
            display: flex;
            align-items: center;
            color: rgb(106, 110, 213);
            margin-bottom: 5px;
            cursor: pointer;
            .avatar {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              margin-right: 5px;
            }
          }
        }

        .comment-user {
          color: rgb(106, 110, 213);
          cursor: pointer;
          width: fit-content;
        }

        .comment-text {
          margin: 5px 0px;
          width: 100%;
        }

        .bottom {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          width: 100%;

          .comment-time {
            margin-top: 5px;
            font-weight: bold;
          }

          .comment-like {
            display: flex;
            flex-direction: row;
            align-items: center;
            font-weight: bold;

            .like-img {
              width: 20px;
              height: 20px;
              margin-left: 5px;
              margin-bottom: 3px;
              opacity: 0.8;
            }
          }
        }
      }
    }

    .comment-line {
      width: calc(100% - 80px);
      height: 1px;
      background-color: rgba(var(--foreground-color-rgb), 0.1);
      margin: 15px 30px 15px 50px;
    }
  }

  .ypage {
    margin-bottom: 20px;
  }
}
</style>
