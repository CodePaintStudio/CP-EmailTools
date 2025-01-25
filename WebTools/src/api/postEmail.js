import request from '../utils/request'
export const sendEmailService = (data) => request.post('/email/sendemail', data)
