const createError = require('http-errors');
const { query, validationResult } = require('express-validator');
const ArticleService = require('../../services/article');
const { combineMiddleware, wrapAsync } = require('../../utils');
const { ERROR_TYPE } = require('../../config');
const { db } = require('../../database/models');

module.exports = combineMiddleware([
  query('password').optional().isString(),
  query('sort')
    .optional()
    .isIn([
      'createDesc',
      'createAsc',
      'updateDesc',
      'updateAsc',
      'viewDesc',
      'viewAsc',
      'likeDesc',
      'likeAsc',
      'commentDesc',
      'commentAsc',
      '',
    ]),
  query('search')
    .optional()
    .isIn(['subject', 'content', 'subjectContent', 'userId', '']),
  query('tag').trim(),
  query('category').trim(),
  query('useSideArticles').customSanitizer(v => v !== 'false'),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { verifyAuth, TYPE: boardType, USE_COMMENT } = req.BOARD_SETTING;

    const { password } = req.headers;

    const {
      sort,
      search,
      searchKeyword,
      tag,
      category,
      useSideArticles,
    } = req.query;

    const item = await ArticleService.getArticleInfo({
      data: {
        id: req.params.articleId,
        boardType,
        visibleFilter: ArticleService.getVisibleFilter({ isAdmin: false }),
      },
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    if (
      verifyAuth({
        writer: {
          ownerId: item.userId,
          ownerPassword: item.password,
          password,
        },
      }).isError
    ) {
      throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
    }

    const [
      { prevArticle = null, nextArticle = null },
      tags,
      liked,
    ] = await Promise.all([
      useSideArticles
        ? ArticleService.getSideArticles({
            article: item,
            isAdmin: false,
            sort,
            search,
            searchKeyword,
            tag,
            category,
          })
        : {},
      db.Tag.findAll({ where: { postId: item.id } }),
      db.Like.findOne({
        where: { boardType: item.boardType, postId: item.id },
      }),
    ]);

    // 이전 조회 여부 확인 후 조회 기록 갱신
    const { isFirstView, idxList } = ArticleService.updateViewCount({
      article: item,
      viewList: req.cookies.articleView || '',
    });
    res.cookie('articleView', idxList);

    res.json(
      ArticleService.getArticleObject(item, {
        set: {
          viewCount: isFirstView ? item.viewCount + 1 : item.viewCount,
          useComment: USE_COMMENT,
          liked: !!liked,
          tags: tags.map(v => v.content),
          ...(useSideArticles && { prevArticle, nextArticle }),
        },
        isAdmin: false,
      }),
    );
  }),
]);
