import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/global.scss';
import i18n from './i18n'

createApp(App).use(router).use(store).use(i18n).mount('#app')
