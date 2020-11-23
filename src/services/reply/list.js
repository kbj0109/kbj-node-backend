const { db } = require('../../database/models');
const { getSortQuery } = require('../../utils');

module.exports = async ({ data }) => {
  const { postId, sort } = data;

  const sortQuery = getSortQuery({
    sortOptions: { create: 'createdAt' },
    sort,
  });

  const { count, rows } = await db.Reply.findAndCountAll({
    where: { postId },
    order: sortQuery,
  });

  return { count, list: rows };
};
