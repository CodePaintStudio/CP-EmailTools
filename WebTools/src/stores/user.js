import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const Token = ref('')
    const email = ref('')
    const password = ref('')

    function generateToken() {
      Token.value =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    }

    function setToken(e) {
      Token.value = e
    }

    function setEmail(e) {
      email.value = e
    }

    function setPassword(e) {
      password.value = e
    }

    function clearToken() {
      Token.value = ''
      email.value = ''
      password.value = ''
    }

    const hasToken = () => !!Token.value

    return {
      Token,
      generateToken,
      setToken,
      clearToken,
      hasToken,
      email,
      password,
      setEmail,
      setPassword
    }
  },
  {
    persist: {
      enabled: true
    }
  }
)
