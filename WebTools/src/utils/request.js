import axios from 'axios'
import { ElMessage } from 'element-plus'

const baseURL = 'http://127.0.0.1:4443/api/email'

const instance = axios.create({
  baseURL
})

// 设置一个响应拦截器，错误统一处理。
instance.interceptors.response.use((res) => {
  if (res.data.code === 0) {
    return res
  }
  ElMessage.error(res.data.data.msg || '服务异常')
  return Promise.reject(res.data)
})

export default instance
export { baseURL }
