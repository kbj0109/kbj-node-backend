const createError = require('http-errors');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const { ids, deleter, deletedAt } = data;

  const [deleteCount] = await db.Banner.update(
    { deleter, deletedAt },
    { where: { id: ids }, transaction, silent: true },
  );
  if (deleteCount !== ids.length) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }
};
