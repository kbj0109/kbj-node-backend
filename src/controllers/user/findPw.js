const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const UserService = require('../../services/user');
const { ERROR_TYPE } = require('../../config');
const { wrapTransaction, combineMiddleware } = require('../../utils');

/** 비밀번호 찾기 - 인증번호 요청 (인증번호 이메일 전송) */
module.exports = combineMiddleware([
  body('userId').isString().trim().notEmpty(),
  body('name').isString().trim().notEmpty(),
  body('email').isEmail(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { userId, name, email } = req.body;

    const item = await UserService.getUserInfo({
      data: { userId, name, email },
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    const result = await UserService.findPw({
      data: req.body,
      transaction,
    });

    res.json({ tokenExpired: result.tokenExpired });
  }),
]);
