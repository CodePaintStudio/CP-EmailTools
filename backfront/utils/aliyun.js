const multer = require('multer')
const MAO = require('multer-aliyun-oss')
const OSS = require('ali-oss')
const { BadRequest } = require('http-errors')
require('dotenv').config()

// 阿里云配置信息
const config = {
  region: process.env.ALIYUN_REGION,
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  bucket: process.env.ALIYUN_BUCKET,
}

const client = new OSS(config)

// multer 配置信息
const upload = multer({
  storage: MAO({
    config: config,
    destination: 'uploads', // 自定义上传目录
    // 设置文件的元数据
    headers: {
      'Content-Disposition': 'inline', // 设置为 inline，支持预览
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制上传文件的大小为：5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许上传图片
    const fileType = file.mimetype.split('/')[0]
    const isImage = fileType === 'image'

    if (!isImage) {
      return cb(new BadRequest('只允许上传图片。'))
    }

    cb(null, true)
  },
})

// 单文件上传，指定表单字段名为 file
const singleFileUpload = upload.single('file')

module.exports = {
  config,
  client,
  singleFileUpload,
}
