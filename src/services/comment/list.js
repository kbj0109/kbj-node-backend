const _ = require('lodash');
const { db } = require('../../database/models');
const { getSortQuery, getSearchQuery } = require('../../utils');

module.exports = async ({ data, boardSetting, user }) => {
  const { postId, limit, offset, sort, search, searchKeyword } = data;
  const { TYPE: boardType = '' } = boardSetting || {};

  const sortQuery = getSortQuery({
    sortOptions: { create: 'createdAt', like: 'likeCount' },
    sort,
  });

  const searchQuery = getSearchQuery({
    search,
    searchKeyword,
    searchColumns: ['content', 'userId', 'name'],
  });

  const { count, rows } = await db.Comment.findAndCountAll({
    where: {
      ...searchQuery,
      ...(postId ? { postId, boardType } : null),
    },
    offset: offset || undefined,
    limit: limit || undefined,
    order: sortQuery,
  });

  const commentList = rows.map(item => item.get({ plain: true }));

  // 댓글 목록의 사용자 추천 여부 확인
  if (user) {
    const likeList = await db.Like.findAll({
      where: {
        postId: commentList.map(one => one.id),
        userId: user.userId,
      },
    });

    const likeIdList = likeList.map(one => one.postId);

    commentList.forEach(comment => {
      if (likeIdList.includes(comment.id)) {
        comment.liked = true;
      }
    });
  }

  // 연결된 Article 정보 가져오기
  if (postId === undefined) {
    const articleIdList = _.uniq(commentList.map(item => item.postId));
    const articleList = await db.Article.findAll({
      attributes: ['id', 'subject', 'commentCount'],
      where: { id: articleIdList },
    });

    commentList.forEach(item => {
      const article = articleList.find(one => item.postId === one.id);

      item.postSubject = article.subject ? article.subject : '';
      item.postCommentCount = article.commentCount ? article.commentCount : 0;
    });
  }

  return { count, list: commentList };
};
