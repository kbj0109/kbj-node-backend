const createError = require('http-errors');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');
const update = require('./update');

module.exports = async ({ data, transaction }) => {
  const { userId, newPassword, token } = data;

  const exItem = await db.Token.findOne({
    where: { userId, token, type: 'CHANGE_PW' },
  });
  if (!exItem) {
    throw createError(400, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  if (exItem.expired < new Date()) {
    db.Token.destroy({ where: { idx: exItem.idx, userId } });

    throw createError(401, {
      type: ERROR_TYPE.AUTH.EXPIRED_TOKEN,
      message: 'Token 만료',
    });
  }

  await update({ data: { userId, newPassword }, transaction });

  db.Token.destroy({ where: { userId, type: ['FIND_PW', 'CHANGE_PW'] } });
};
