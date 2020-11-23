const createError = require('http-errors');
const { query, validationResult } = require('express-validator');
const ArticleService = require('../../services/article');
const { wrapAsync, combineMiddleware } = require('../../utils');
const { ERROR_TYPE } = require('../../config');

module.exports = combineMiddleware([
  query('limit')
    .customSanitizer(v => {
      if (Number(v) > 0 === false) {
        return 10;
      }
      return v;
    })
    .toInt(),
  query('offset')
    .customSanitizer(v => {
      if (Number(v) >= 0 === false) {
        return 0;
      }
      return v;
    })
    .toInt(),
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

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { verifyAuth, USE_COMMENT } = req.BOARD_SETTING;

    if (verifyAuth().isError) {
      throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
    }

    const {
      limit,
      offset,
      sort,
      search,
      searchKeyword,
      tag,
      category,
    } = req.query;

    const result = await ArticleService.list({
      data: {
        limit,
        offset,
        sort,
        search,
        searchKeyword,
        tagKeyword: tag,
        categoryKeyword: category,
      },
      boardSetting: req.BOARD_SETTING,
      user: req.user,
      isAdmin: false,
    });

    res.json({
      total: result.count,
      list: result.list.map(item => {
        return ArticleService.getArticleObject(item, {
          set: {
            useComment: USE_COMMENT,
            liked: result.likes.includes(item.id),
            tags: result.tags
              .filter(tag => tag.postId === item.id)
              .map(v => v.content),
          },
          isAdmin: false,
        });
      }),
    });
  }),
]);
