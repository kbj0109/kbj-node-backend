const createError = require('http-errors');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const { ids } = data;

  const [deleteCount] = await Promise.all([
    db.Comment.destroy({
      where: { id: ids },
      transaction,
    }),
    db.Like.destroy({
      where: { postId: ids },
      transaction,
    }),
  ]);

  if (deleteCount !== ids.length) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }
};
