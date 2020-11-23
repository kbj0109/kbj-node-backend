const createError = require('http-errors');
const { query } = require('express-validator');
const { ERROR_TYPE } = require('../../config');
const TagService = require('../../services/tag');
const { wrapAsync, combineMiddleware } = require('../../utils');

/** 목록 */
exports.list = combineMiddleware([
  query('limit')
    .customSanitizer(v => {
      if (Number(v) > 0 === false) {
        return 30;
      }
      return v;
    })
    .toInt(),

  wrapAsync(async (req, res) => {
    const { limit } = req.query;
    const { verifyAuth } = req.BOARD_SETTING;

    if (verifyAuth().isError) {
      throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
    }

    const result = await TagService.listPopular({
      data: { limit },
      boardSetting: req.BOARD_SETTING,
    });

    res.json(result.map(item => item.content));
  }),
]);
