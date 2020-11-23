const createError = require('http-errors');
const _ = require('lodash');
const parser = require('ua-parser-js');
const { body, validationResult } = require('express-validator');
const ArticleService = require('../../services/article');
const { wrapTransaction, combineMiddleware } = require('../../utils');
const { ERROR_TYPE } = require('../../config');

module.exports = combineMiddleware([
  body('subject').isString().trim().notEmpty(),
  body('content').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('category').optional().isString().trim(),
  body('name')
    .if((v, { req }) => !req.user)
    .isString()
    .trim()
    .notEmpty(),
  body('password')
    .if((v, { req }) => !req.user)
    .isString()
    .notEmpty(),
  body('email').optional().trim().isEmail(),
  body('link').optional().isString().trim(),
  body('secret').optional().toBoolean(),
  body('field1').optional().isString().trim(),
  body('field2').optional().isString().trim(),
  body('field3').optional().isString().trim(),
  body('notice').customSanitizer(() => undefined),
  body('order').customSanitizer(() => undefined),
  body('visible').customSanitizer(() => undefined),
  body('visibleStart').customSanitizer(() => undefined),
  body('visibleEnd').customSanitizer(() => undefined),
  body('tags')
    .customSanitizer(v => v || '')
    .isString()
    .customSanitizer(v => {
      const array = v
        .split(',')
        .map(one => one.trim())
        .filter(one => one);
      return _.uniq(array);
    }),
  body('attachFiles').optional().isArray(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { verifyAuth, TYPE: boardType, USE_COMMENT } = req.BOARD_SETTING;

    const item = await ArticleService.getArticleInfo({
      data: { id: req.params.articleId, boardType },
      transaction,
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    if (
      verifyAuth({
        writer: {
          ownerId: item.userId,
          ownerPassword: item.password,
          password: req.body.password,
        },
      }).isError
    ) {
      throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
    }

    const result = await ArticleService.update({
      data: {
        ...req.body,
        id: item.id,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        device: parser(req.headers['user-agent']).device.type,
        orgAttachFiles: item.attachFiles,
        updater: req.user ? req.user.userId : item.name,
      },
      boardSetting: req.BOARD_SETTING,
      user: req.user,
      isAdmin: false,
      transaction,
    });

    res.json(
      ArticleService.getArticleObject(result, {
        set: { useComment: USE_COMMENT },
        isAdmin: false,
      }),
    );
  }),
]);
