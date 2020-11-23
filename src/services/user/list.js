const { getSortQuery, getSearchQuery } = require('../../utils');
const { db } = require('../../database/models');

module.exports = async ({ data }) => {
  const { limit, offset, sort, search, searchKeyword, withWithdrawal } = data;

  const searchQuery = getSearchQuery({
    search,
    searchKeyword,
    searchColumns: ['userId', 'level', 'name', 'email', 'phoneNumber', 'role'],
  });

  const sortQuery = getSortQuery({
    sortOptions: { create: 'createdAt', update: 'updatedAt', level: 'level' },
    sort,
  });

  // 목록 구하기
  const { count, rows } = await db.User.findAndCountAll({
    where: searchQuery,
    offset,
    limit,
    order: sortQuery,
    paranoid: withWithdrawal, // 탈퇴회원 포함 여부
  });

  return { count, list: rows };
};
