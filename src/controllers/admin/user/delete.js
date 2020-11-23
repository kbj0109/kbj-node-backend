const createError = require('http-errors');
const { param, validationResult } = require('express-validator');
const UserService = require('../../../services/user');
const { wrapTransaction, combineMiddleware } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  param('userId').custom((v, { req }) => req.user.userId !== v),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const item = await UserService.getUserInfo({
      data: { userId: req.params.userId },
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    await UserService.delete({ data: { userId: item.userId }, transaction });

    res.json(UserService.getUserObject(item, { isAdmin: true }));
  }),
]);
