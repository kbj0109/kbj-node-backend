const createError = require('http-errors');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const { userId } = data;

  const result = await db.User.destroy({ where: { userId }, transaction });
  if (result !== 1) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }
};
