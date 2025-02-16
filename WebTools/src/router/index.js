import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MainPage from '@/views/MainPage.vue'
import LoginPage from '@/views/login/index.vue'

// 创建路由实例
const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/main',
    name: 'MainPage',
    component: MainPage
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/main'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.path === '/') {
    next()
  } else {
    if (userStore.Token) {
      next()
    } else {
      next('/')
    }
  }
})

export default router
