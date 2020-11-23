const createError = require('http-errors');
const { param, validationResult } = require('express-validator');
const PopupService = require('../../../services/popup');
const { combineMiddleware } = require('../../../utils');
const { wrapTransaction } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  param('popupId')
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

    const { popupId } = req.params;
    const deleter = req.user.userId;
    const deletedAt = new Date();

    const items = await PopupService.getPopupInfo({
      data: { id: popupId },
      transaction,
    });
    if (items.length !== popupId.length) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    await PopupService.delete({
      data: { ids: popupId, deleter, deletedAt },
      transaction,
    });

    res.json(
      items.map(item =>
        PopupService.getPopupObject(item, { set: { deleter, deletedAt } }),
      ),
    );
  }),
]);
