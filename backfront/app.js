const express = require('express')

//创建服务器实例
const server = express()

//配置实例解析项
server.use(express.urlencoded({ extends: false }))
server.use(express.json())

//解决跨域
const cors = require('cors')
server.use(cors())

// 创建登录路由
const loginRouter = require('./router/verifyLogin')
// 注册登录路由
server.use('/api/login', loginRouter)

//创建邮箱路由
const sendEmail = require('./router/emailServer')
//注册邮箱路由
server.use('/api/email', sendEmail)

// 创建上传路由
const uploadsRouter = require('./router/uploads')
// 注册上传路由
server.use('/api/uploads', uploadsRouter)

// 创建下载模板路由
const templateDownload = require('./router/templateDownload')
// 注册下载模板路由
server.use('/api/template', templateDownload)

//启动服务
server.listen(4443, function () {
  const port = this.address().port // 获取被分配的端口号
  console.log(`Express server listening on port ${port}`)
})
