import request from '@/utils/request'
export const sendEmailServeice = (data) => request.post('/sendemail', data)
