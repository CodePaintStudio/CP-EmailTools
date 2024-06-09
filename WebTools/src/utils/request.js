// 本模块存放数据请求基地址等相关配置,文档相关配置要根据后端接口文档来写
import axios from 'axios'

const baseURL = 'http://127.0.0.1:4443/api/email'

const instance = axios.create({
  baseURL
})

export default instance
export { baseURL }
