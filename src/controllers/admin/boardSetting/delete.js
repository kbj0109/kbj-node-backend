const createError = require('http-errors');
const BoardSettingService = require('../../../services/boardSetting');
const { ERROR_TYPE } = require('../../../config');
const { wrapTransaction } = require('../../../utils');

module.exports = wrapTransaction(async (req, res, next, transaction) => {
  const { boardId } = req.params;

  const item = await BoardSettingService.getBoardSettingInfo({
    data: { id: boardId },
    transaction,
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  const deleter = req.user.userId;
  const deletedAt = new Date();

  await BoardSettingService.delete({
    data: { id: item.id, boardType: item.type, deleter, deletedAt },
    transaction,
  });

  res.json(
    BoardSettingService.getBoardSettingObject(item, {
      set: { deleter: req.user.userId, deletedAt },
    }),
  );
});
