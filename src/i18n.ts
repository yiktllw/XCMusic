/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * i18n.ts 为多语言配置文件
 * 默认语言为中文，支持中文和英文
 *---------------------------------------------------------------*/

// src/i18n.js
import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";

const messages = {
  en,
  zh,
};

const i18n = createI18n({
  locale: "zh",
  messages,
});

export default i18n;
