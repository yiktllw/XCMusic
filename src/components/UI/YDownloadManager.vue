<template>
  <div class="download-manager">
    <div class="download-header">
      <div class="download-actions">
        <button @click="pauseAllDownloads" :disabled="!hasActiveDownloads">
          {{ $t("download.manager.pauseAll") }}
        </button>
        <button @click="resumeAllDownloads" :disabled="!hasPausedDownloads">
          {{ $t("download.manager.resumeAll") }}
        </button>
        <button @click="cancelAllDownloads" :disabled="!hasActiveDownloads">
          {{ $t("download.manager.cancelAll") }}
        </button>
      </div>
      <div class="download-stats">
        <span>{{ $t("download.manager.active") }}: {{ activeCount }}</span>
        <span
          >{{ $t("download.manager.completed") }}: {{ completedCount }}</span
        >
        <span>{{ $t("download.manager.total") }}: {{ totalCount }}</span>
      </div>
    </div>

    <div class="download-tasks" v-if="downloadTasks.length > 0">
      <div
        v-for="task in downloadTasks"
        :key="task.id"
        class="download-task"
        :class="`status-${task.status}`"
      >
        <div class="task-main">
          <div class="task-index">{{ downloadTasks.indexOf(task) + 1 }}</div>
          <div class="task-info">
            <div class="song-info">
              <div class="song-name">{{ task.track.name }}</div>
              <div class="song-meta">
                <span class="artist-name">{{
                  getArtistNames(task.track)
                }}</span>
                <span class="status-text">{{
                  getStatusText(task.status)
                }}</span>
              </div>
            </div>
          </div>
          <div
            class="task-progress"
            v-if="['downloading', 'paused', 'done'].includes(task.status)"
          >
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: task.percent + '%' }"
              ></div>
            </div>
            <span
              class="progress-text"
              v-if="['downloading', 'paused'].includes(task.status)"
            >
              {{ formatProgress(task) }}
            </span>
          </div>
          <div class="task-error" v-if="task.error">
            <span class="error-text">{{ task.error }}</span>
          </div>
        </div>

        <div class="task-actions">
          <button
            v-if="task.status === 'downloading'"
            @click="pauseTask(task.id)"
            class="action-btn pause-btn"
            :title="$t('download.manager.pause')"
          >
            ⏸️
          </button>

          <button
            v-if="task.status === 'paused'"
            @click="resumeTask(task.id)"
            class="action-btn resume-btn"
            :title="$t('download.manager.resume')"
          >
            ▶️
          </button>

          <button
            v-if="['downloading', 'paused', 'pending'].includes(task.status)"
            @click="cancelTask(task.id)"
            class="action-btn cancel-btn"
            :title="$t('download.manager.cancel')"
          >
            ❌
          </button>

          <button
            v-if="task.status === 'error'"
            @click="retryTask(task)"
            class="action-btn retry-btn"
            :title="$t('download.manager.retry')"
          >
            🔄
          </button>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>{{ $t("download.manager.empty") }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import type { ITrack } from "@/utils/tracks";
import type { IDownloadTaskRenderer } from "@/utils/download_renderer";
import { Song } from "@/utils/api";
import { getStorage, StorageKey } from "@/utils/render_storage";
import { DownloadEvents } from "@/dual/download_renderer";

export default defineComponent({
  name: "YDownloadManager",
  setup() {
    const store = useStore();
    return {
      download: store.state.download,
    };
  },
  data() {
    return {
      downloadTasks: [] as IDownloadTaskRenderer[],
    };
  },
  computed: {
    activeCount() {
      return this.downloadTasks.filter((task) =>
        ["downloading", "pending", "paused"].includes(task.status),
      ).length;
    },
    completedCount() {
      return this.downloadTasks.filter((task) => task.status === "done").length;
    },
    totalCount() {
      return this.downloadTasks.length;
    },
    hasActiveDownloads() {
      return this.downloadTasks.some((task) =>
        ["downloading", "pending"].includes(task.status),
      );
    },
    hasPausedDownloads() {
      return this.downloadTasks.some((task) => task.status === "paused");
    },
  },
  methods: {
    getArtistNames(track: ITrack): string {
      return track.ar.map((ar) => ar.name).join(", ");
    },

    getStatusText(status: string): string {
      const statusMap: Record<string, string> = {
        pending: this.$t("download.status.pending"),
        downloading: this.$t("download.status.downloading"),
        paused: this.$t("download.status.paused"),
        done: this.$t("download.status.done"),
        error: this.$t("download.status.error"),
        cancelled: this.$t("download.status.cancelled"),
      };
      return statusMap[status] || status;
    },

    formatProgress(task: IDownloadTaskRenderer): string {
      if (!task.downloadedBytes || !task.totalBytes) {
        return `${task.percent}%`;
      }

      const downloaded = this.formatBytes(task.downloadedBytes);
      const total = this.formatBytes(task.totalBytes);
      return `${task.percent}% (${downloaded}/${total})`;
    },

    formatBytes(bytes: number): string {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    pauseTask(taskId: string) {
      this.download.pauseTask(taskId);
    },

    resumeTask(taskId: string) {
      this.download.resumeTask(taskId);
    },

    cancelTask(taskId: string) {
      this.download.cancelTask(taskId);
    },

    async retryTask(task: IDownloadTaskRenderer) {
      try {
        const url = await Song.getUrl(
          task.track.id,
          getStorage(StorageKey.Setting_Download_Quality) ?? "standard",
        );
        const downloadDir = getStorage(StorageKey.Setting_Download_Path);
        if (url && downloadDir) {
          this.download.add(url, task.track, downloadDir);
        }
      } catch (error) {
        console.error("重试下载失败:", error);
      }
    },

    pauseAllDownloads() {
      this.downloadTasks.forEach((task) => {
        if (["downloading", "pending"].includes(task.status)) {
          this.pauseTask(task.id);
        }
      });
    },

    resumeAllDownloads() {
      this.downloadTasks.forEach((task) => {
        if (task.status === "paused") {
          this.resumeTask(task.id);
        }
      });
    },

    cancelAllDownloads() {
      this.downloadTasks.forEach((task) => {
        if (["downloading", "pending", "paused"].includes(task.status)) {
          this.cancelTask(task.id);
        }
      });
    },

    updateTasks() {
      // 过滤掉已取消的任务
      this.downloadTasks = this.download
        .getAllTasks()
        .filter((task) => task.status !== "cancelled");
    },
  },
  mounted() {
    this.updateTasks();

    // 监听任务更新事件
    this.download.subscriber.on(
      "YDownloadManager",
      DownloadEvents.TaskUpdate,
      () => {
        this.updateTasks();
      },
    );

    this.download.subscriber.on(
      "YDownloadManager",
      DownloadEvents.Doing,
      () => {
        this.updateTasks();
      },
    );

    this.download.subscriber.on(
      "YDownloadManager",
      DownloadEvents.Complete,
      () => {
        this.updateTasks();
      },
    );
  },

  beforeUnmount() {
    this.download.subscriber.offAll("YDownloadManager");
  },
});
</script>

<style scoped>
.download-manager {
  width: calc(100% - 20px);
  padding: 0 10px;
  background: transparent;
}

.download-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 15px;
}

.download-actions {
  display: flex;
  gap: 8px;
}

.download-actions button {
  padding: 4px 8px;
  border: 1px solid rgba(var(--foreground-color-rgb), 0.2);
  background: transparent;
  color: var(--font-color-standard);
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.download-actions button:hover:not(:disabled) {
  background: rgba(var(--foreground-color-rgb), 0.1);
  color: var(--font-color-main);
}

.download-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.download-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--font-color-standard);
}

.download-tasks {
  display: flex;
  flex-direction: column;
}

.download-task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  border-radius: 8px;
  transition: background-color 0.2s;
  min-height: 56px;
}

.download-task:hover {
  background-color: rgba(var(--foreground-color-rgb), 0.05);
}

.download-task.status-cancelled {
  opacity: 0.7;
}

.task-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 12px;
}

.task-index {
  width: 24px;
  text-align: center;
  font-size: 12px;
  color: var(--font-color-standard);
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-name {
  font-size: 15px;
  color: var(--font-color-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.song-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.artist-name {
  font-size: 13px;
  color: var(--font-color-standard);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-text {
  font-size: 13px;
  color: var(--font-color-standard);
  padding: 2px 6px;
  background: rgba(var(--foreground-color-rgb), 0.08);
  border-radius: 10px;
  white-space: nowrap;
}

.task-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 200px;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: rgba(var(--foreground-color-rgb), 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--user-select-color);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: var(--font-color-standard);
  text-align: right;
}

.task-error {
  max-width: 200px;
}

.error-text {
  font-size: 11px;
  color: #f44336;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-actions {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 12px;
}

.action-btn:hover {
  background: rgba(var(--foreground-color-rgb), 0.1);
  transform: scale(1.1);
}

.pause-btn:hover {
  background: rgba(255, 152, 0, 0.15);
}

.resume-btn:hover {
  background: rgba(76, 175, 80, 0.15);
}

.cancel-btn:hover {
  background: rgba(244, 67, 54, 0.15);
}

.retry-btn:hover {
  background: rgba(33, 150, 243, 0.15);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--font-color-standard);
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}
</style>
