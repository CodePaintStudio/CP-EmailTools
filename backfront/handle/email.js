const nodemailer = require('nodemailer');
const { sendRes, RES_CODE } = require('./errorHandle')
/**
 * SMTP服务请求队列： 先来先服务
*/
const smtpServerQueue = [];

//TODO: 因为是请求队列，这个函数其实不需要
const frozen = async (time) => {
  await setTimeout(() => {}, time)
}

/** 拼接两个数组后转为字符串 */
const joinArrays = (arr1, arr2) => {
  if (arr2.length) {
    const newArr = [];
    arr1.forEach((item, index) => {
      newArr.push(arr1[index], arr2[index]);
    });
    return newArr.join('');
  } else {
    return arr1.join('');
  }
}

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
    console.log('执行！');
    await smtpServerQueue[0]();
    await frozen(1000);
    console.log('执行结束！');
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
const createSmtpServer = async (email, password, res) => {
  const smtpConfig = selectSmtpConfig(email);
  try {
    const smtpServer = await nodemailer.createTransport({
      ...smtpConfig,
      // host: 'smtp.163.com',
      // port: 465,
      auth: {
        user: email,
        pass: password,
      },
    }); 
    console.log('VERIFY前');
    const verifyRes = await new Promise((req, res) => {
      smtpServer.verify(function (error, success) {
        if (error) {
          // console.log(error);
          console.log('请检查账号密码是否正确！');
          smtpServer.close();
          req('请检查账号密码是否正确！')
        } else {
          console.log("Server is ready to take our messages");
          req('');
        }
      });
    })
    console.log('VERIFY后', verifyRes);  
    if (verifyRes) {
      sendRes(
        res,
        RES_CODE.ACCOUNT_OR_PASSWORD_ERROR,
        {
          msg: verifyRes,
        }
      )
      return false;
    } else {
      return smtpServer;
    }
  } catch (error) {
    console.log('verify过程出错了', error);
  }
}

/** 
 * 批量发送邮件
*/
const sendEmails = async (req, res) => {
  // console.log('req', req.body);
  if (preError(req.body)) {
    sendRes(
      res,
      RES_CODE.FIELD_IS_EMPTY,
      {
        msg: preError(req.body),
      }
    )
    return;
  }
  const {
    email,
    password,
    subject,
    receiverItemsArray,
    content,
  } = req.body;
  let smtpServer, emailList;
  try {
    smtpServer = await createSmtpServer(email, password, res);
    if (!smtpServer) {
      return;
    }
    const contentArray = content.split('${text}');
    emailList = receiverItemsArray.map(items => {
      const newContent = joinArrays(contentArray, items.slice(1));
      const message = {
        from: `<${email}>`, // sender address
        to: items[0], // list of receivers
        subject: subject, // Subject line
        text: newContent, // plain text body
        html: newContent, // html body
      };
      console.log(message);
      //return 一个promise对象
      return smtpServer.sendMail(message);
    });
    const messages = await Promise.all(emailList);
    // console.log('messages', messages);
    sendRes(
      res,
      RES_CODE.SUCCESS,
      messages
    );
    //关闭smtp服务 TODO: check
    await new Promise(async (res) => {
      await smtpServer.close();
      res('');
    })
    console.log('服务关闭');
  } catch (error) {
    console.log('出错啦', error);
    return;
  }
}

module.exports = {
  executeServerQueue,
  sendEmails,
}