const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const UserService = require('../../services/user');
const { combineMiddleware, wrapTransaction } = require('../../utils');
const { ERROR_TYPE } = require('../../config');

module.exports = combineMiddleware([
  body('password').isString().notEmpty(),
  body(['newPassword', 'newPasswordConfirm'])
    .customSanitizer(v => {
      if (v) {
        return v;
      }
      return undefined;
    })
    .optional()
    .isString(),
  body('newPasswordConfirm')
    .optional()
    .custom((v, { req }) => v === req.body.newPassword),
  body('name').optional().isString().trim().notEmpty(),
  body('email').trim().isEmail(),
  body('phoneNumber').optional().isString().trim(),
  body('address').optional().isString(),
  body('address2').optional().isString(),
  body('zipCode').optional().isString().trim(),
  body('level').customSanitizer(() => undefined),
  body('role').customSanitizer(() => undefined),

  wrapTransaction(async (req, res, nex, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { userId } = req.user;

    const item = await UserService.getUserInfo({ data: { userId } });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    const passwordMatch = await bcryptjs.compare(
      req.body.password,
      `${item.salt}${item.password}`,
    );
    if (passwordMatch === false) {
      throw createError(400, {
        type: ERROR_TYPE.AUTH.WRONG_PASSWORD,
        message: '잘못된 비밀번호',
      });
    }

    const result = await UserService.update({
      data: { ...req.body, userId },
      transaction,
    });

    res.json(UserService.getUserObject(result, { isAdmin: false }));
  }),
]);
