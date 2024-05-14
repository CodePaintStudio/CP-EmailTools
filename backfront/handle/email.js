const nodemailer = require('nodemailer');

/**
 * SMTP服务请求队列： 先来先服务
*/
const smtpServerQueue = [];

/**
 * 执行队列
*/
const executeServerQueue = async (fun) => {
  // 如果传入参数 则把fun压入服务队列中
  if (fun) {
    smtpServerQueue.push(fun);
  }
  console.log(`调用执行队列，当前请求服务队列有${smtpServerQueue.length}个服务`, smtpServerQueue);
  // 检查服务队列中是否有值，有值就执行剩余函数
  if (smtpServerQueue.length) {
    await smtpServerQueue[0]();
    //等待函数执行完进行出队
    smtpServerQueue.shift();
    executeServerQueue();
  }
}

/**
 * 预校验
*/
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

/**
 * 根据域名匹配对应smtp服务器设置
*/
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

/**
 * 开启smtp服务
*/
const createSmtpServer = (email, password) => {
  const smtpConfig = selectSmtpConfig(email);
  // if (!smtpConfig) {  
  //   //这里应该直接抛出错误返回了
  //   return ;
  // }
  return nodemailer.createTransport({
    ...smtpConfig,
    // host: 'smtp.163.com',
    // port: 465,
    auth: {
      user: email,
      pass: password,
    },
  }); 
}

/** 
 * 批量发送邮件
*/
const sendEmails = async (req, res) => {
  // console.log('req', req.body);
  if (preError(req.body)) {
    return;
  }
  const {
    email,
    password,
    subject,
    receiverItemsArray,
    content,
  } = req.body;
  let smtpServer;
  try {
    smtpServer = await createSmtpServer(email, password);
  } catch (error) {
    return;
  }
  console.log('222');
  //验证我的smtp服务 TODO: 下方的验证应该放在create函数里面
  // try {
  //   smtpServer.verify(function (error, success) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log("Server is ready to take our messages");
  //     }
  //   });

  // } catch {
  //   console.log('出错啦');
  // }
  const emailList = receiverItemsArray.map(item => {
    const message = {
      from: `<${email}>`, // sender address
      to: item[0], // list of receivers
      subject: subject, // Subject line
      text: content, // plain text body
      html: content, // html body
    };
    console.log(message);
    //return 一个promise对象
    return smtpServer.sendMail(message);
  });
  // console.log(emailList,'emailList');
  const messages = await Promise.all(emailList);
  console.log('messages', messages);
  //关闭smtp服务
  console.log('服务关闭');
  smtpServer.close();
}

module.exports = {
  executeServerQueue,
  sendEmails,
}