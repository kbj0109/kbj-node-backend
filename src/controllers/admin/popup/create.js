const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const PopupService = require('../../../services/popup');
const { wrapTransaction, combineMiddleware } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');
const { uuid } = require('../../../utils');

module.exports = combineMiddleware([
  body('subject').isString().trim(),
  body('content').isString().trim(),
  body('type').optional().isString().trim(),
  body('width').optional().isString().trim(),
  body('height').optional().isString().trim(),
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

    const result = await PopupService.create({
      data: { ...req.body, id: uuid(), userId: req.user.userId },
      transaction,
    });

    res.json(PopupService.getPopupObject(result));
  }),
]);
