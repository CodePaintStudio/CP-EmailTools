const express = require('express')
const router = express.Router()
const { sendRes, RES_CODE } = require('../handle/errorHandle')
const { config, client, singleFileUpload, multipleFilesUpload } = require('../utils/aliyun')
const { BadRequest } = require('http-errors')

/**
 * 阿里云 OSS 客户端上传
 * POST /uploads/aliyun
 */
router.post('/aliyun', function (req, res) {
  try {
    singleFileUpload(req, res, async function (error) {
      if (error) {
        return sendRes(res, error)
      }

      if (!req.file) {
        return sendRes(res, new BadRequest('请选择要上传的文件。'))
      }
      // 记录附件信息
      // await Attachment.create({
      //   ...req.file,
      //   userId: req.userId,
      //   fullpath: req.file.path + '/' + req.file.filename,
      // })

      sendRes(res, RES_CODE.SUCCESS, { file: req.file.url })
    })
  } catch (error) {
    sendRes(res, error)
  }
})

module.exports = router
