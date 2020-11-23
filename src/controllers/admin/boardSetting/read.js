const createError = require('http-errors');
const BoardSettingService = require('../../../services/boardSetting');
const { wrapAsync } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = wrapAsync(async (req, res) => {
  const { boardId } = req.params;

  const item = await BoardSettingService.getBoardSettingInfo({
    data: { id: boardId },
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  res.json(BoardSettingService.getBoardSettingObject(item));
});
