<template>
  <YLoading v-if="loading" />
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
      <div
        class="comment-item"
        v-for="(comment, index) in cmt.comments"
      >
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

<script lang="ts">
import { defineComponent } from "vue";
import YPage from "@/components/base/YPage.vue";
import { YCommentC, Types } from "@/dual/YCommentC";
import { formatDate_yyyymmdd } from "@/utils/time";
import YLoading from "@/components/base/YLoading.vue";

export default defineComponent({
  name: "YComment",
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
    YLoading,
  },
  watch: {
    type() {
      this.refresh();
    },
    id() {
      this.refresh();
    },
  },
  data() {
    return {
      cmt: new YCommentC(this.type as Types, this.id),
      loading: true,
    };
  },
  methods: {
    _formatDate_yyyymmdd(time: number) {
      return formatDate_yyyymmdd(time);
    },
    openUserPage(id: number | string) {
      this.$router.push({ path: `/user/${id}` });
    },
    refresh() {
      this.loading = true;
      this.cmt = new YCommentC(this.type as Types, this.id);
      this.cmt.initData().then(() => {
        this.loading = false;
      });
    },
  },
  mounted() {
    this.cmt.initData().then(() => {
      this.loading = false;
    });
  },
});
</script>

<style lang="scss" scoped>
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
