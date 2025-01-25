/**
 * 成功响应
 * @param {object} res Express 的响应对象
 * @param {string} message 成功消息
 * @param {object} data 返回的数据
 * @param {number} statusCode HTTP 状态码，默认为 200
 */
const success = (res, message, data = {}, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

/**
 * 失败响应
 * @param {object} res Express 的响应对象
 * @param {Error|string} error 错误对象或错误消息
 * @param {number} statusCode HTTP 状态码，默认为 500
 */
const failure = (res, error, statusCode = 500) => {
  // 如果是 Error 对象，提取消息
  const message = error instanceof Error ? error.message : error

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = {
  success,
  failure,
}
