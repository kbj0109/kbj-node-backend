const { db } = require('../../database/models');
const { getSearchQuery, getSortQuery } = require('../../utils');

module.exports = async ({ data }) => {
  const { limit, offset, sort, search, searchKeyword } = data;

  const searchQuery = getSearchQuery({
    search,
    searchKeyword,
    searchColumns: ['subject', 'content', 'name', 'email', 'phoneNumber'],
  });

  const sortQuery = getSortQuery({
    sortOptions: { create: 'createdAt', comment: 'commentCount' },
    sort,
  });

  const result = await db.Contact.findAndCountAll({
    where: searchQuery,
    offset,
    limit,
    order: sortQuery,
  });

  return result;
};
