const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const UserService = require('../../../services/user');
const MailService = require('../../../services/mail');
const {
  wrapAsync,
  combineMiddleware,
  templateRender,
} = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  body('userId').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
  body('passwordConfirm')
    .isString()
    .notEmpty()
    .custom((v, { req }) => v === req.body.password),
  body('name').isString().trim().notEmpty(),
  body('email').trim().isEmail(),
  body('phoneNumber').isString().trim(),
  body('address').isString(),
  body('address2').isString(),
  body('zipCode').isString().trim(),
  body('level').isInt(),
  body('role').isString(),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const item = await UserService.getUserInfo({
      data: { userId: req.body.userId },
    });
    if (item) {
      throw createError(400, {
        type: ERROR_TYPE.COM.DUPLICATE,
        message: '이미 가입된 회원',
      });
    }

    const result = await UserService.create({ data: req.body });

    MailService.sendMail({
      to: result.email,
      subject: `${result.name}님의 회원가입을 환영합니다.`,
      content: templateRender({
        htmlPath: 'html/mail/user.create.html',
        data: { name: result.name },
      }),
    });

    res.json(UserService.getUserObject(result, { isAdmin: true }));
  }),
]);
