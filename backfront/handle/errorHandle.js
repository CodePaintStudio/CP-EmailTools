/**
 * 返回前端信息
 * res 是repress回调 code 是状态码 data是返回信息
 */
const sendRes = (res, code, data) => {
  if (res) {
    res.send({
      code,
      data,
    })
  }
}

const RES_CODE = {
  // 成功
  SUCCESS: 0,
  // 存在空字段
  FIELD_IS_EMPTY: 90001,
  // 账号或密码错误
  ACCOUNT_OR_PASSWORD_ERROR: 90002,
}

module.exports = {
  sendRes,
  RES_CODE,
}