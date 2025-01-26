import request from '../utils/request'
export const getTemplateDownload = () =>
  request.get('/template/xlsx', {
    responseType: 'blob' // 重要：指定响应类型为 blob
  })
