const { db } = require('../../database/models');
const { getSortQuery, getSearchQuery } = require('../../utils');

module.exports = async ({ data }) => {
  const { limit, offset, sort, search, searchKeyword } = data;

  const searchQuery = getSearchQuery({
    search,
    searchKeyword,
    searchColumns: ['subject', 'type', 'description', 'link'],
  });

  const sortQuery = getSortQuery({
    sortOptions: {
      create: 'createdAt',
      update: 'updatedAt',
    },
    sort,
  });

  // create 혹은 idx 정렬시 order 정렬 포함
  const [[column, direction]] = sortQuery;

  if (column === 'createdAt' || column === 'idx') {
    sortQuery.unshift(['order', direction]);
  }

  // 글 목록 구하기
  const { count, rows } = await db.Banner.findAndCountAll({
    where: searchQuery,
    offset,
    limit,
    order: sortQuery,
  });

  return { count, list: rows };
};
