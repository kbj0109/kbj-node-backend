const createError = require('http-errors');
const BannerService = require('../../../services/banner');
const { wrapAsync } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = wrapAsync(async (req, res) => {
  const item = await BannerService.getBannerInfo({
    data: { id: req.params.bannerId },
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  res.json(BannerService.getBannerObject(item));
});
