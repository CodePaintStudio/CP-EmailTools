import { createApp } from 'vue'

import App from './App.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
// import '@/styles/mainpage.scss'
import '@/styles/newmainpage.scss'
import '@/styles/mobile.scss'

import 'element-plus/dist/index.css'
import 'virtual:svg-icons-register'
import SvgIcon from './components/Svglcon.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const pinia = createPinia()
pinia.use(piniaPersist)
const app = createApp(App)
app.component('QuillEditor', QuillEditor)
app.use(pinia)
app.use(router)
app.mount('#app')
app.component('svg-icon', SvgIcon)

// 注册element-plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
