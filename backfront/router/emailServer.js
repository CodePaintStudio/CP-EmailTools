const express = require('express');
const nodemailer = require('nodemailer');
const {
  executeServerQueue,
  sendEmails,
} = require('../handle/email')
 
const router = express.Router();

const sendEmail = (req, res) => {
  //使用队列维护邮件函数
  executeServerQueue(() => sendEmails(req, res));
}

//发送邮件接口
router.post('/sendemail', sendEmail);

module.exports = router;