/*---------------------------------------------------------------*
 * YiktLLW .. 2025-03-21 .. Johannes Brahms
 * main.ts 为项目的前端入口文件
 * 用于创建Vue实例并挂载到页面上
 * 已引入的模块有:
 * 1. router: 路由模块
 * 2. store: 状态管理模块
 * 3. global.scss: 全局样式
 * 4. i18n: 多语言配置
 *---------------------------------------------------------------*/

import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";
import "./assets/css/global.scss";
import i18n from "@/i18n";

const app = createApp(App);
app.use(router);
app.use(store);
app.use(i18n);
app.mount("#app");
