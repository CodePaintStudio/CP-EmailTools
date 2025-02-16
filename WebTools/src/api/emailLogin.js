import request from '../utils/request'
// 登录api
export const LoginVerify = (data) => request.post('/login/verify', data)
