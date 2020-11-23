const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const UserService = require('../../services/user');
const { wrapTransaction, combineMiddleware } = require('../../utils');
const { ERROR_TYPE } = require('../../config');

/** 비밀번호 찾기 - 비밀번호 변경 토큰 확인 후 비밀번호 변경 */
module.exports = combineMiddleware([
  body('userId').isString().trim().notEmpty(),
  body('newPassword').isString().notEmpty(),
  body('newPasswordConfirm')
    .isString()
    .notEmpty()
    .custom((v, { req }) => v === req.body.newPassword),
  body('token').isString().notEmpty(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    await UserService.findPwChange({ data: req.body, transaction });

    res.status(200).end();
  }),
]);
