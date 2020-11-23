const { query } = require('express-validator');
const TagService = require('../../../services/tag');
const { wrapAsync, combineMiddleware } = require('../../../utils');

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

    const result = await TagService.listPopular({
      data: { limit },
      boardSetting: req.BOARD_SETTING,
    });

    res.json(result.map(item => item.content));
  }),
]);
