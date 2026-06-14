import indexDB from "@/utils/indexDB";
import { type ITrack } from "@/utils/tracks";

/**
 * 单次播放事件记录
 * 存储在独立数据库 ncm_play_events.events
 */
export interface PlayEvent {
  id: string; // 唯一 ID，格式: "hostname-timestamp"
  trackId: number | string; // 歌曲 ID（本地歌曲为字符串，在线歌曲为数字）
  startedAt: number; // 本次播放开始时间戳
  endedAt: number; // 本次播放结束时间戳
  durationMs: number; // 本次实际听歌时长（毫秒）
}

/**
 * 用于缓存歌曲信息的结构
 * 在迁移时从旧记录中提取，供排行显示使用
 */
export interface TrackCache {
  id: number;
  name: string;
  ar: Array<{ id: number; name: string }>;
  al: { id: number; name: string; picUrl: string };
  dt: number;
}

const PLAY_EVENTS_DB = "ncm_play_events";
const DB_VERSION = 2;
const PLAY_EVENTS_STORE = "events";
const TRACK_CACHE_STORE = "track_cache";

// ──────────────── 共享数据库连接 ────────────────

let _db: IDBDatabase | null = null;
let _dbReady: Promise<void> | null = null;

/** 打开数据库，version 2 确保 events 和 track_cache 两个 store 都被创建 */
function ensureDB(): Promise<void> {
  if (!_dbReady) {
    _dbReady = new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(PLAY_EVENTS_DB, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(PLAY_EVENTS_STORE)) {
          db.createObjectStore(PLAY_EVENTS_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(TRACK_CACHE_STORE)) {
          db.createObjectStore(TRACK_CACHE_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = (event) => {
        _db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }
  return _dbReady;
}

/**
 * 写入一条播放事件（跳过无效数据）
 */
export async function writePlayEvent(event: PlayEvent): Promise<void> {
  await ensureDB();
  if (event.trackId == null) {
    console.warn(
      "writePlayEvent: skip invalid event (missing trackId)",
      event.id,
    );
    return;
  }
  if (!event.id) {
    console.warn("writePlayEvent: skip invalid event (missing id)");
    return;
  }
  await putInStore(PLAY_EVENTS_STORE, event);
}

/** 从指定 store 执行 put */
function putInStore<T>(storeName: string, item: T): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!_db) return reject(new Error("Database not open"));
    const tx = _db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    // 深拷贝确保 IndexedDB 可克隆（数据可能来自 IPC 传输）
    const safe = JSON.parse(JSON.stringify(item));
    const request = store.put(safe);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}

/** 从指定 store 删除记录 */
function deleteFromStore(
  storeName: string,
  key: string | number,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!_db) return reject(new Error("Database not open"));
    const tx = _db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}

/** 从指定 store 获取所有记录 */
function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    if (!_db) return reject(new Error("Database not open"));
    const tx = _db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = (event) =>
      resolve(((event.target as IDBRequest).result ?? []) as T[]);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}

/** 从指定 store 按 key 获取单条 */
function getFromStore<T>(
  storeName: string,
  key: number | string,
): Promise<T | null> {
  return new Promise<T | null>((resolve, reject) => {
    if (!_db) return reject(new Error("Database not open"));
    const tx = _db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = (event) =>
      resolve(((event.target as IDBRequest).result ?? null) as T | null);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}

/**
 * 获取所有播放事件
 */
export async function getAllPlayEvents(): Promise<PlayEvent[]> {
  await ensureDB();
  return getAllFromStore<PlayEvent>(PLAY_EVENTS_STORE);
}

/**
 * 获取机器名称，用于生成唯一 ID
 */
export function getHostname(): string {
  try {
    return window.api?.os?.hostname?.() ?? "unknown";
  } catch {
    return "unknown";
  }
}

// ──────────────── 歌曲信息缓存 ────────────────

/**
 * 写入歌曲信息缓存
 */
export async function cacheTrackInfo(track: TrackCache): Promise<void> {
  await ensureDB();
  await putInStore(TRACK_CACHE_STORE, track);
}

/**
 * 批量写入歌曲信息缓存
 */
export async function cacheTrackInfos(tracks: TrackCache[]): Promise<void> {
  if (tracks.length === 0) return;
  await ensureDB();
  const promises = tracks.map((t) => putInStore(TRACK_CACHE_STORE, t));
  await Promise.all(promises);
}

/**
 * 获取缓存的歌曲信息
 */
export async function getCachedTrackInfo(
  trackId: number,
): Promise<TrackCache | null> {
  await ensureDB();
  return getFromStore<TrackCache>(TRACK_CACHE_STORE, trackId);
}

/**
 * 获取所有缓存的歌曲信息
 */
export async function getAllCachedTrackInfos(): Promise<TrackCache[]> {
  await ensureDB();
  return getAllFromStore<TrackCache>(TRACK_CACHE_STORE);
}

// ──────────────── 迁移 ────────────────

interface OldPlayRecord {
  id: number | string;
  track: ITrack;
  accumulatedPlayMs: number;
  playCount: number;
  playEventTimestamps: number[];
}

/**
 * 将旧版本的听歌记录（ncm_play_history.history）迁移到新格式
 * 每条 playEventTimestamps 生成一条独立的 PlayEvent
 */
export async function migratePlayHistory(): Promise<{
  totalEvents: number;
  totalTracks: number;
  cleanedCount: number;
}> {
  const oldDb = new indexDB("ncm_play_history", "history");
  await oldDb.openDatabase();
  const oldRecords = await oldDb.getAllItems<OldPlayRecord>();

  if (!oldRecords || oldRecords.length === 0) {
    return { totalEvents: 0, totalTracks: 0, cleanedCount: 0 };
  }

  const hostname = getHostname();
  const events: PlayEvent[] = [];
  const trackCacheMap = new Map<number, TrackCache>();
  let totalEvents = 0;

  for (const record of oldRecords) {
    const timestamps: number[] = (record as any).playEventTimestamps ?? [];

    // 如果旧记录没有时间戳数组但有 playCount，退化处理
    if (timestamps.length === 0 && (record.playCount ?? 0) > 0) {
      // 用总时长 / playCount 估算每次时长
      const avgDuration = Math.floor(
        (record.accumulatedPlayMs ?? 0) / (record.playCount ?? 1),
      );
      for (let i = 0; i < (record.playCount ?? 1); i++) {
        const fakeTs = (record as any).updatedAt ?? Date.now();
        const eventId = `${hostname}-${fakeTs}-${i}`;
        events.push({
          id: eventId,
          trackId: record.id as number,
          startedAt: fakeTs,
          endedAt: fakeTs + avgDuration,
          durationMs: avgDuration,
        });
        totalEvents++;
      }
    } else {
      // 正常情况：按时间戳列表生成
      const count = timestamps.length;
      const avgDuration =
        count > 0 ? Math.floor((record.accumulatedPlayMs ?? 0) / count) : 0;

      for (const ts of timestamps) {
        const eventId = `${hostname}-${ts}`;
        events.push({
          id: eventId,
          trackId: record.id as number,
          startedAt: ts,
          endedAt: ts + avgDuration,
          durationMs: avgDuration,
        });
        totalEvents++;
      }
    }

    // 提取歌曲信息缓存
    if (record.track) {
      const track = record.track;
      trackCacheMap.set(track.id, {
        id: track.id,
        name: track.name,
        ar: track.ar?.map((a: any) => ({ id: a.id, name: a.name })) ?? [],
        al: track.al
          ? { id: track.al.id, name: track.al.name, picUrl: track.al.picUrl }
          : { id: 0, name: "", picUrl: "" },
        dt: track.dt ?? 0,
      });
    }
  }

  // 写入新数据库
  await ensureDB();
  for (const ev of events) {
    await putInStore(PLAY_EVENTS_STORE, ev);
  }

  // 写入歌曲缓存
  const trackCaches = Array.from(trackCacheMap.values());
  await cacheTrackInfos(trackCaches);

  // 清理新数据库中 trackId 完全缺失的脏事件（null/undefined）
  let cleanedCount = 0;
  const allBefore = await getAllFromStore<PlayEvent>(PLAY_EVENTS_STORE);
  for (const ev of allBefore) {
    if (ev.trackId == null) {
      await deleteFromStore(PLAY_EVENTS_STORE, ev.id);
      cleanedCount++;
    }
  }
  if (cleanedCount > 0) {
    console.log(`migratePlayHistory: cleaned ${cleanedCount} invalid events`);
  }

  return {
    totalEvents,
    totalTracks: trackCaches.length,
    cleanedCount,
  };
}
