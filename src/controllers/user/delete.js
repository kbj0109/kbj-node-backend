const createError = require('http-errors');
const { header, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const UserService = require('../../services/user');
const { wrapTransaction, combineMiddleware } = require('../../utils');
const { globalCookieOptions } = require('../../config/optionConfig');
const { ERROR_TYPE } = require('../../config');

module.exports = combineMiddleware([
  header('password').isString().notEmpty(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const item = await UserService.getUserInfo({
      data: { userId: req.user.userId },
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    const passwordMatch = bcryptjs.compareSync(
      req.header('password'),
      `${item.salt}${item.password}`,
    );
    if (passwordMatch === false) {
      throw createError(400, {
        type: ERROR_TYPE.AUTH.WRONG_PASSWORD,
        message: '잘못된 비밀번호',
      });
    }

    await UserService.delete({ data: { userId: item.userId }, transaction });

    res.clearCookie('access_token', {
      ...globalCookieOptions,
      httpOnly: true,
    });
    res.clearCookie('csrf_token', globalCookieOptions);

    res.json(UserService.getUserObject(item, { isAdmin: false }));
  }),
]);
