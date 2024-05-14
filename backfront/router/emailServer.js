const express = require('express');
const nodemailer = require('nodemailer');
const {
  executeServerQueue,
  sendEmails,
} = require('../handle/email')
 
const router = express.Router();

const preError = (req) => {
  const {
    email = null,
    password = null,
    subject = null,
    receiverItemsArray = null,
    content = null,
  } = req;
  if (!email) {
    console.log('邮箱不能为空！');
    return '邮箱不能为空！';
  }
  if (!password) {
    console.log('密码不能为空！');
    return '密码不能为空！';
  }
  if (!subject) {
    console.log('邮件主题不能为空！');
    return '邮件主题不能为空！';
  }
  if (!receiverItemsArray) {
    console.log('联系人列表不能为空！');
    return '联系人列表不能为空！';
  }
  if (!content) {
    console.log('正文内容不能为空！');
    return '正文内容不能为空';
  }
  return '';
}

const selectSmtpConfig = (email) => {
  // 取出域名
  const realmName = email.split('@')[1];
  // console.log('realmName', realmName)
  switch (realmName) {
    case '163.com': {
      return {
        host: 'smtp.163.com',
        port: 465,
      };
    }
    case 'qq.com': {
      return {
        host: 'smtp.qq.com',
        port: 465,
      };
    }
    // case '163.com': {
    //   return {
    //     host: '',
    //     port: 465,
    //   };
    // }
    default: {
      return false;
    }
  }
}

const createSmtpServer = (email, password) => {
  const smtpConfig = selectSmtpConfig(email);
  // if (!smtpConfig) {  
  //   //这里应该直接抛出错误返回了
  //   return ;
  // }
  return nodemailer.createTransport({
    // ...smtpConfig,
    host: 'smtp.163.com',
    port: 465,
    auth: {
      user: email,
      pass: password,
    },
  }); 
}

const sendEmail = (req, res) => {
  //使用队列维护邮件函数
  executeServerQueue(() => sendEmails(req, res));
}

//发送邮件接口
router.post('/sendemail', sendEmail);

module.exports = router;