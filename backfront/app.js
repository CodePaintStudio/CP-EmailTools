const express = require('express');

//创建服务器实例
const server = express();

//配置实例解析项
server.use(express.urlencoded({ extends: false }));
server.use(express.json())

//解决跨域
const cors = require('cors');
server.use(cors());

//创建邮箱路由
const sendEmail = require('./router/emailServer');
//注册邮箱路由
server.use('/api/email', sendEmail);

//启动服务
server.listen(4443, function() {
  const port = this.address().port; // 获取被分配的端口号
  console.log(`Express server listening on port ${port}`);
});
