import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style/index.scss'

import App from './App.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const app = createApp(App)
app.component('QuillEditor', QuillEditor)
app.use(createPinia())
app.mount('#app')
