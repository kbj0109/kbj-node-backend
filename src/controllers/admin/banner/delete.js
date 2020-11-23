const createError = require('http-errors');
const { param, validationResult } = require('express-validator');
const BannerService = require('../../../services/banner');
const { combineMiddleware } = require('../../../utils');
const { wrapTransaction } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  param('bannerId')
    .isString()
    .customSanitizer(ids => {
      return ids.split(',').filter(Boolean);
    }),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { bannerId } = req.params;
    const deleter = req.user.userId;
    const deletedAt = new Date();

    const items = await BannerService.getBannerInfo({
      data: { id: bannerId },
      transaction,
    });
    if (items.length !== bannerId.length) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    await BannerService.delete({
      data: {
        ids: bannerId,
        deleter,
        deletedAt,
      },
      transaction,
    });

    res.json(
      items.map(item =>
        BannerService.getBannerObject(item, { set: { deleter, deletedAt } }),
      ),
    );
  }),
]);
