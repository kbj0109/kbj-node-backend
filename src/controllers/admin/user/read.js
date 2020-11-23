const createError = require('http-errors');
const { ERROR_TYPE } = require('../../../config');
const UserService = require('../../../services/user');
const { wrapAsync } = require('../../../utils');

module.exports = wrapAsync(async (req, res) => {
  const item = await UserService.getUserInfo({
    data: { userId: req.params.userId },
    withoutDelete: false,
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  res.json(UserService.getUserObject(item, { isAdmin: true }));
});
