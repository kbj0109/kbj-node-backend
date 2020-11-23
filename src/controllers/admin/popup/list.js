const createError = require('http-errors');
const { query, validationResult } = require('express-validator');
const PopupService = require('../../../services/popup');
const { wrapAsync, combineMiddleware } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  query('limit')
    .customSanitizer(v => {
      if (Number(v) > 0 === false) {
        return 10;
      }
      return v;
    })
    .toInt(),
  query('offset')
    .customSanitizer(v => {
      if (Number(v) >= 0 === false) {
        return 0;
      }
      return v;
    })
    .toInt(),
  query('sort')
    .optional()
    .isIn(['createDesc', 'createAsc', 'updateDesc', 'updateAsc', '']),
  query('search')
    .optional()
    .isIn(['subject', 'content', 'subjectContent', 'type', 'userId', '']),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const result = await PopupService.list({
      data: req.query,
    });

    res.json({
      total: result.count,
      list: result.list.map(item => PopupService.getPopupObject(item)),
    });
  }),
]);
