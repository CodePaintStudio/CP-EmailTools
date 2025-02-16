const express = require('express')
const nodemailer = require('nodemailer')
const { selectSmtpConfig } = require('../handle/nodemailerHandle') // 引入创建服务器的配置
const { sendRes, RES_CODE } = require('../handle/errorHandle') // 引入你自己封装的响应处理函数

const router = express.Router()

/**
 * 验证账号和密码
 */
router.post('/verify', async (req, res) => {
  const { email, password } = req.body

  // 判断邮箱和密码是否存在
  if (!email || !password) {
    return sendRes(res, RES_CODE.PARAM_ERROR, '邮箱和密码不能为空！')
  }

  const smtpConfig = selectSmtpConfig(email)
  if (!smtpConfig) {
    return sendRes(res, RES_CODE.PARAM_ERROR, '暂不支持此类邮箱！')
  }

  // 创建SMTP服务器实例
  const smtpServer = await nodemailer.createTransport({
    ...smtpConfig,
    auth: {
      user: email,
      pass: password,
    },
  })

  // 验证是否能连接到SMTP服务器
  smtpServer.verify(function (error, success) {
    if (error) {
      return sendRes(res, RES_CODE.PARAM_ERROR, '请检查账号密码是否正确！')
    } else {
      return sendRes(res, RES_CODE.SUCCESS, '账号密码验证成功')
    }
  })
})

module.exports = router
