const { db } = require('../../database/models');
const { getSortQuery, getSearchQuery } = require('../../utils');
const { getVisibleFilter } = require('./common');

module.exports = async ({ data, boardSetting, user, isAdmin }) => {
  const {
    limit,
    offset,
    sort,
    search,
    searchKeyword,
    tagKeyword,
    categoryKeyword,
  } = data;

  const { TYPE: boardType } = boardSetting;

  const searchQuery = getSearchQuery({
    search,
    searchKeyword,
    searchColumns: ['subject', 'content', 'userId'],
  });

  // 태그 조건 구하기
  const matchTagArticles = tagKeyword
    ? await db.Tag.findAll({
        attributes: [
          [db.Sequelize.fn('DISTINCT', db.Sequelize.col('post_id')), 'postId'],
        ],
        where: { content: tagKeyword },
      })
    : [];

  const searchOptions = {
    ...(matchTagArticles.length && {
      id: matchTagArticles.map(one => one.postId),
    }),
    ...(categoryKeyword && {
      category: categoryKeyword,
    }),
    ...searchQuery,
  };

  const seqrchQuery = {
    boardType,
    ...getVisibleFilter({ isAdmin }),
    ...searchOptions,
  };

  const sortQuery = getSortQuery({
    sortOptions: {
      create: 'createdAt',
      update: 'updatedAt',
      like: 'likeCount',
      view: 'viewCount',
      comment: 'commentCount',
    },
    sort,
  });

  // create 혹은 idx 정렬시 order 정렬
  const [[column, direction]] = sortQuery;
  if (column === 'createdAt' || column === 'idx') {
    sortQuery.unshift(['order', direction]);
  }

  // 글 목록 구하기
  const [{ count, rows }, notices] = await Promise.all([
    db.Article.findAndCountAll({
      attributes: { exclude: ['content'] },
      where: { ...seqrchQuery, notice: false },
      offset,
      limit,
      order: sortQuery,
    }),
    offset === 0 // 첫 페이지의 경우 공지 글 포함
      ? db.Article.findAll({
          attributes: { exclude: ['content'] },
          where: { ...seqrchQuery, notice: true },
          order: sortQuery,
        })
      : [],
  ]);

  const list = notices.concat(rows);

  const [tags, likes] = await Promise.all([
    // 글 목록의 태그 리스트 호출
    db.Tag.findAll({ where: { postId: list.map(one => one.id) } }),

    // 글 목록의 사용자 추천 여부 확인
    user
      ? db.Like.findAll({
          where: { boardType, postId: list.map(one => one.id) },
        })
      : [],
  ]);

  return { count, list, tags, likes: likes.map(like => like.postId) };
};
