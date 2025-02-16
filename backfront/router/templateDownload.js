const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { sendRes, RES_CODE } = require('../handle/errorHandle')

router.get('/xlsx', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'template', 'todaytemplate.xlsx');

  // console.log('文件路径:', filePath);
  // console.log('当前工作目录:', process.cwd());

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.error('文件不存在:', filePath);
    return sendRes(res, RES_CODE.FIELD_IS_EMPTY, '文件不存在，请检查路径或文件是否已上传');
  }

  // 设置响应头
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="template.xlsx"');

  // 发送文件
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('文件发送失败:', err);
      sendRes(res, RES_CODE.ACCOUNT_OR_PASSWORD_ERROR, '文件发送失败');
    } else {
      console.log('文件发送成功');
    }
  });
});


module.exports = router
