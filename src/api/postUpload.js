import request from '@/utils/request'
export const uploadPhotoService = (data) =>
  request.post('/uploads/aliyun', data)
