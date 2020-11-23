const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const UserService = require('../../services/user');
const { wrapAsync, combineMiddleware } = require('../../utils');
const { ERROR_TYPE } = require('../../config');

/** 비밀번호 찾기 - 인증번호 확인 후 비밀번호 변경 토큰 생성 */
module.exports = combineMiddleware([
  body('userId').isString().trim().notEmpty(),
  body('token').isString().isNumeric().notEmpty(),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const result = await UserService.findPwConfirm({ data: req.body });

    res.json({ token: result.token, tokenExpired: result.expired });
  }),
]);
