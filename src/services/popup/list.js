const { db } = require('../../database/models');
const { getSortQuery, getSearchQuery } = require('../../utils');

module.exports = async ({ data }) => {
  const { limit, offset, sort, search, searchKeyword } = data;

  const searchQuery = getSearchQuery({
    search,
    searchKeyword,
    searchColumns: ['subject', 'content', 'subjectcontent', 'type'],
  });

  const sortQuery = getSortQuery({
    sortOptions: {
      create: 'createdAt',
      update: 'updatedAt',
    },
    sort,
  });

  // 글 목록 구하기
  const { count, rows } = await db.Popup.findAndCountAll({
    where: searchQuery,
    offset,
    limit,
    order: sortQuery,
  });

  return { count, list: rows };
};
