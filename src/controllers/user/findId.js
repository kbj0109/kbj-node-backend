const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const UserService = require('../../services/user');
const { wrapAsync, combineMiddleware } = require('../../utils');
const { ERROR_TYPE } = require('../../config');

/** 아이디 찾기 */
module.exports = combineMiddleware([
  body('name').isString().notEmpty(),
  body('email').isEmail(),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const item = await UserService.getUserInfo({ data: req.body });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    res.json({ userId: item.userId });
  }),
]);
