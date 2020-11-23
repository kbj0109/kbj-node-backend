const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const BannerService = require('../../../services/banner');
const { wrapTransaction, combineMiddleware, uuid } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  body('subject').isString(),
  body('type').optional().isString(),
  body('attachFiles').optional().isArray(),
  body('description').optional().isString().trim(),
  body('link').optional().isString(),
  body('target').optional().isString(),
  body('order').isInt({ min: 0 }),
  body('visible').toBoolean(),
  body(['visibleStart', 'visibleEnd'])
    .optional()
    .isString()
    .custom((value, { req }) => {
      if (value === '') {
        return true;
      }
      if (Number.isNaN(Date.parse(value))) {
        return false;
      }
      if (Date.parse(req.body.visibleStart) > Date.parse(req.body.visibleEnd)) {
        return false;
      }
      return true;
    })
    .customSanitizer(value => {
      if (value === '') {
        return null;
      }
      return value;
    }),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const result = await BannerService.create({
      data: { ...req.body, id: uuid() },
      user: req.user,
      transaction,
    });

    res.json(BannerService.getBannerObject(result));
  }),
]);
