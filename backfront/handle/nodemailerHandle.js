// 此文件封装了nodemailer方法，业务逻辑不应该在此文件实现
const nodemailer = require('nodemailer');
//妙计： 采用工厂方法封装成class

const createSmtpServer = async (email, password) => {
  const smtpConfig = selectSmtpConfig(email);
  if (!smtpConfig) {
    return {
      success: false,
      smtpServer: null,
      info: '暂不支持此类邮箱！',
    };
  }
  // 第一步： 创建stmp服务器实例
  const smtpServer = await nodemailer.createTransport({
    ...smtpConfig,
    auth: {
      user: email,
      pass: password,
    },
  });
  //第二步： 验证实例是否正常
  const verifyRes = await verifyStmpServer(smtpServer);
  const success = !verifyRes;
  if (!success) {
    smtpServer.close();
  }
  return {
    success,
    smtpServer: success ? smtpServer : null,
    info: verifyRes,
  };
}

/**
 * @param {*} serveExample 服务实例
 * @returns {*string} 可以正常发送则返回空，不能则返回错误信息
 */
const verifyStmpServer = async (serverExample) => {
  const req = await new Promise((req, res) => {
    serverExample.verify(function (error, success) {
      if (error) {
        // 🎅🏻🎅🏻🎅🏻TODO: 这里错误信息只返回了账号密码是否正确，也许二期可以增加一个错误对照map
        // console.log('请检查账号密码是否正确！');
        req('请检查账号密码是否正确！')
      } else {
        console.log("Server is ready to take our messages");
        req('');
      }
    });
  })
  return req;
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

const sendMail = (emailConfig, serverExample) => {
  return new Promise((res, req) => {
    serverExample.sendMail(emailConfig, (error, info) => {
      if (error) {
        res('');
      } else {
        console.log('info', info);
        //注意： to数组返回了这次发送发的收信方，不是群发所以直接取第一项
        res(info?.envelope?.to?.[0] || '');
      }
    });
  })
}

module.exports = {
  createSmtpServer,
  sendMail,
}