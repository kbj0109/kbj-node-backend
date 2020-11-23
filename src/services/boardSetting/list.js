const { db } = require('../../database/models');
const { getSortQuery, getSearchQuery } = require('../../utils');

module.exports = async ({ data }) => {
  const { limit, offset, sort, search, searchKeyword } = data;

  const searchQuery = getSearchQuery({
    search,
    searchKeyword,
    searchColumns: ['subject', 'type', 'userId'],
  });

  const sortQuery = getSortQuery({ sort });

  const { count, rows } = await db.BoardSetting.findAndCountAll({
    where: searchQuery,
    offset,
    limit,
    order: sortQuery,
  });

  return { count, list: rows };
};
