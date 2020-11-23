const _ = require('lodash');
const { Op } = require('sequelize');
const { db } = require('../../database/models');
const { getSortQuery, getSearchQuery } = require('../../utils');

exports.getArticleInfo = async ({ data, transaction }) => {
  const { idx, id, boardType, visibleFilter } = data;

  const where = {
    ...(idx && { idx }),
    ...(id && { id }),
    ...(boardType && { boardType }),
    ...(visibleFilter || null),
  };

  const findOne = Array.isArray(id) === false;

  const items = await db.Article.findAll({
    where,
    ...(findOne && { limit: 1 }),
    ...(transaction && { transaction }),
  });

  return findOne ? items[0] : items;
};

exports.getArticleObject = (data, { set, remove, isAdmin = false } = {}) => {
  data = typeof data.get === 'function' ? data.get({ plain: true }) : data;

  let object = _.omit(
    {
      liked: false,
      useComment: true,
      tags: [],
      ...data,
    },
    [
      'password',
      'ip',
      'device',
      ...(isAdmin === false
        ? [
            'deleter',
            'deletedAt',
            'order',
            'visible',
            'visibleStart',
            'visibleEnd',
          ]
        : []),
    ].filter(Boolean),
  );

  if (set) {
    object = { ...object, ...set };
  }

  if (Array.isArray(remove) && remove.length > 0) {
    object = _.omit(object, remove);
  }

  return object;
};

/** 권한에 따른 Visible 조건 정의 */
exports.getVisibleFilter = ({ visible = true, isAdmin = false }) => {
  const now = Date.now();
  if (isAdmin) {
    return {};
  }
  return {
    visible,
    visibleStart: { [Op.or]: { [Op.lte]: now, [Op.eq]: null } },
    visibleEnd: { [Op.or]: { [Op.gte]: now, [Op.eq]: null } },
  };
};

/** 이전 다음 글 */
exports.getSideArticles = async ({
  article,
  isAdmin,
  sort,
  search,
  searchKeyword,
  tag = '',
  category = '',
}) => {
  try {
    // 검색으로 들어온 글의 경우 조건 설정
    const tagKeyword = tag.trim();
    const categoryKeyword = category.trim();

    const searchQuery = getSearchQuery({
      search,
      searchKeyword,
      searchColumns: ['subject', 'content', 'userId'],
    });

    const attributes = ['idx', 'id', 'subject', 'order'];

    // 태그 조건 구하기
    const matchTagArticles = tagKeyword
      ? await db.Tag.findAll({
          attributes: [
            [
              db.Sequelize.fn('DISTINCT', db.Sequelize.col('post_id')),
              'postId',
            ],
          ],
          where: { content: tagKeyword },
        })
      : [];

    const filter = {
      notice: article.notice,
      ...(matchTagArticles.length && {
        id: matchTagArticles.map(one => one.postId),
      }),
      ...(categoryKeyword && {
        category: categoryKeyword,
      }),
      ...this.getVisibleFilter({ isAdmin }),
      [Op.and]: searchQuery,
    };

    const getWhere = (column, dir) => {
      const key = column === 'createdAt' ? 'order' : column;

      return {
        id: { [Op.not]: article.id },
        boardType: article.boardType,
        ...filter,
        [Op.or]: {
          [key]: { [Op[dir]]: article[key] },
          [Op.and]: {
            [key]: { [Op.eq]: article[key] },
            idx: { [Op[dir]]: article.idx },
          },
        },
      };
    };

    const getSort = ({ sort, forceDirection }) => {
      const sortOptions = {
        create: 'createdAt',
        update: 'updatedAt',
        like: 'likeCount',
        view: 'viewCount',
        comment: 'commentCount',
      };

      const sortQuery = getSortQuery({ sortOptions, sort, forceDirection });
      const [[column, direction]] = sortQuery;

      // create 혹은 idx 정렬시 order 정렬 포함
      if (column === 'createdAt' || column === 'idx') {
        sortQuery.unshift(['order', forceDirection || direction]);
      }

      return sortQuery;
    };

    const sortQuery = getSort({ sort });
    const [[column, direction]] = sortQuery;

    const [[first = null], [second = null]] = await Promise.all([
      db.Article.findAll({
        attributes,
        where: getWhere(column, 'gt'),
        limit: 1,
        order: getSort({ sort, forceDirection: 'ASC' }),
      }),
      db.Article.findAll({
        attributes,
        where: getWhere(column, 'lt'),
        limit: 1,
        order: getSort({ sort, forceDirection: 'DESC' }),
      }),
    ]);

    // prev: 윗글, next: 아래글
    return {
      prevArticle: direction === 'ASC' ? second : first,
      nextArticle: direction === 'ASC' ? first : second,
    };
  } catch (err) {
    console.log(err);
  }
  return {
    prevArticle: null,
    nextArticle: null,
  };
};

/** 조회 기록 확인 후, 조회 기록 쿠키 갱신 */
exports.updateViewCount = ({ article, viewList }) => {
  const idxList = viewList.split(',');
  const isFirstView = idxList.includes(article.idx.toString()) === false;

  if (isFirstView) {
    idxList.push(article.idx.toString());

    db.Article.update(
      { viewCount: db.sequelize.literal('view_count + 1') },
      { where: { idx: article.idx }, silent: true },
    );
  }

  if (idxList.length > 50) {
    idxList.shift();
  }

  return { isFirstView, idxList: idxList.filter(v => v).join(',') };
};

/** 댓글 갯수 확인 후, 댓글 갯수 갱신 */
exports.updateCommentCount = async ({ id, commentIds, addComment = false }) => {
  const comments = Array.isArray(commentIds)
    ? commentIds.join("','")
    : commentIds;
  const countCommentQuery = `(SELECT COUNT(*) FROM comments WHERE post_id='${id}' AND id NOT IN ('${comments}') AND deleted_at IS NULL)`;

  await db.Article.update(
    {
      commentCount: db.sequelize.literal(
        `${countCommentQuery} ${addComment ? '+ 1' : ''}`,
      ),
    },
    { where: { id }, silent: true },
  );
};

exports.updateLikeCount = async ({ id }) => {
  await db.Article.update(
    {
      likeCount: db.sequelize.literal(
        `(SELECT COUNT(*) FROM likes WHERE post_id='${id}')`,
      ),
    },
    { where: { id }, silent: true },
  );
};

exports.like = async ({ data, boardSetting, user, transaction }) => {
  const { postId } = data;
  const { TYPE: boardType } = boardSetting;

  const deleteCount = await db.Like.destroy({
    where: { postId, userId: user.userId },
    limit: 1,
    transaction,
  });

  const likeOnNow = deleteCount === 0;

  if (likeOnNow) {
    await db.Like.create(
      { postId, boardType, userId: user.userId },
      { transaction },
    );
  }

  return { likeOnNow };
};
