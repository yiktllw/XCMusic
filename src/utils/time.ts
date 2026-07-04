/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * time.ts 为时间处理工具
 *---------------------------------------------------------------*/

import i18n from "@/i18n";

/**
 * 格式化时间戳为 yyyy-mm-dd
 * @param {number} timestamp 时间戳
 * @returns {string} 格式化后的时间字符串
 */
export function formatDate_yyyymmdd(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 格式化时间戳为 mm:ss
 * @param {number} duration 时间戳, 毫秒
 */
export function formatDuration_mmss(duration: number) {
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(0);
  return `${minutes < 10 ? "0" : ""}${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
}

function dec2Time(number_ms: number) {
  const _1year_sec = 86400 * 365;
  const _1month_sec = 86400 * 30;
  const _1day_sec = 86400;
  const _1hour_sec = 3600;
  const _1min_sec = 60;

  const totalSec = Math.floor(number_ms / 1000);
  let remainingSec = totalSec;
  const years = Math.floor(remainingSec / _1year_sec);
  remainingSec -= years * _1year_sec;
  const months = Math.floor(remainingSec / _1month_sec);
  remainingSec -= months * _1month_sec;
  const days = Math.floor(remainingSec / _1day_sec);
  remainingSec -= days * _1day_sec;
  const hours = Math.floor(remainingSec / _1hour_sec);
  remainingSec -= hours * _1hour_sec;
  const minutes = Math.floor(remainingSec / _1min_sec);
  remainingSec -= minutes * _1min_sec;
  const secs = remainingSec;

  const totalHours = Math.floor(totalSec / _1hour_sec);
  const totalDays = Math.floor(totalSec / _1day_sec);
  const totalMonths = Math.floor(totalSec / _1month_sec);
  const totalYears = Math.floor(totalSec / _1year_sec);

  return {
    totalSec,
    years,
    months,
    days,
    hours,
    minutes,
    secs,
    totalHours,
    totalDays,
    totalMonths,
    totalYears,
  };
}

/**
 * 格式化大时长（听歌排行用），支持小时和天
 *  < 1 小时: mm:ss
 *  1h ~ 24h: h:mm:ss
 *  ≥ 24h: Xd h:mm:ss
 */
export function formatDurationLong(ms: number): string {
  const t = i18n.global.t;

  if (ms <= 0) return `0 ${t("time.sec")}`;

  const {
    totalSec,
    months,
    days,
    hours,
    minutes,
    secs,
    totalHours,
    totalDays,
    totalMonths,
    totalYears,
  } = dec2Time(ms);

  if (totalSec < 3600) {
    // (0   , 1h]     ->  mm 分 ss 秒
    return `${minutes} ${t("time.min")} ${secs} ${t("time.sec")}`;
  } else if (totalHours < 100) {
    // (1h  , 100h]   ->  hh 时 mm 分
    return `${totalHours} ${t("time.hour")} ${minutes} ${t("time.min")}`;
  } else if (totalDays < 100) {
    // (100h, 100d]   ->  dd 天 hh 时
    return `${totalDays} ${t("time.day")} ${hours} ${t("time.hour")}`;
  } else if (totalMonths < 100) {
    // (100d, 100m]   ->  momo 月 dd 天
    return `${totalMonths} ${t("time.month")} ${days} ${t("time.day")}`;
  } else {
    // (100m, inf)    ->  yy 年 momo 月
    return `${totalYears} ${t("time.year")} ${months} ${t("time.month")}`;
  }
}
