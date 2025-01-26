const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { sendRes, RES_CODE } = require('../handle/errorHandle')

// 提供文件下载接口
router.get('/xlsx', (req, res) => {
  // 文件路径
  const filePath = path.join(__dirname, 'template', 'todaytemplate.xlsx')

  // 打印文件路径和当前工作目录，用于调试
  console.log('文件路径:', filePath)
  console.log('当前工作目录:', process.cwd())

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.error('文件不存在:', filePath)
    return res.status(404).send('文件不存在，请检查路径或文件是否已上传')
  }

  // 设置响应头
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename="template.xlsx"')

  // 返回文件
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送失败:', err)
    } else {
      console.log('文件发送成功')
    }
  })
})

module.exports = router
