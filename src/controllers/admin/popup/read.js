const createError = require('http-errors');
const PopupService = require('../../../services/popup');
const { wrapAsync } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = wrapAsync(async (req, res) => {
  const item = await PopupService.getPopupInfo({
    data: { id: req.params.popupId },
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  res.json(PopupService.getPopupObject(item));
});
