const createError = require('http-errors');
const { ERROR_TYPE } = require('../../config');
const UserService = require('../../services/user');
const { wrapAsync } = require('../../utils');

/** 가입된 User ID 존재하는지 확인 */
module.exports = wrapAsync(async (req, res) => {
  const { userId } = req.params;

  const item = await UserService.getUserInfo({
    data: { userId },
    withoutDelete: false,
  });
  if (item) {
    throw createError(400, {
      type: ERROR_TYPE.COM.DUPLICATE,
      message: '이미 가입된 회원',
    });
  }

  res.status(200).end();
});
