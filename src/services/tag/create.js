const createError = require('http-errors');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const { tags, postId, boardType } = data;

  if (tags.length === 0) {
    return [];
  }

  const tagObjects = tags.map(item => {
    return { postId, boardType, content: item };
  });

  const items = await db.Tag.bulkCreate(tagObjects, {
    transaction,
  });

  if (items.length !== tags.length) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  return items.map(item => item.content);
};
