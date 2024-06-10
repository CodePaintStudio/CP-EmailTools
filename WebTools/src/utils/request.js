/*
 * @Author: FlowerHeap flowerheap@qq.com
 * @Date: 2024-06-10 15:07:11
 * @LastEditors: FlowerHeap flowerheap@qq.com
 * @LastEditTime: 2024-06-10 15:09:52
 * @FilePath: \CP-EmailTools\WebTools\src\utils\request.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

const baseURL = 'http://127.0.0.1:4443/api/email'

const instance = axios.create({
  baseURL
})

// 这是我写的代码
instance.interceptors.response.use((res) => {
  if (res.data.code === 0) {
    return res
  }
  ElMessage.error(res.data.data.msg || '服务异常')
  return Promise.reject(res.data)
})

export default instance
export { baseURL }
