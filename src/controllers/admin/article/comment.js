const createError = require('http-errors');
const { body, validationResult, query, param } = require('express-validator');
const ArticleService = require('../../../services/article');
const CommentService = require('../../../services/comment');
const {
  wrapTransaction,
  wrapAsync,
  combineMiddleware,
} = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');
const { uuid } = require('../../../utils');

/** 목록 */
exports.list = combineMiddleware([
  query('limit').customSanitizer(() => {
    return undefined;
  }),
  query('offset').customSanitizer(() => {
    return undefined;
  }),
  query('sort')
    .optional()
    .isIn(['createDesc', 'createAsc', 'likeDesc', 'likeAsc', '']),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { articleId } = req.params;
    const { sort = 'createDesc' } = req.query;

    const result = await CommentService.list({
      data: {
        postId: articleId,
        sort,
      },
      boardSetting: req.BOARD_SETTING,
      user: req.user,
    });

    res.json(result.list.map(item => CommentService.getCommentObject(item)));
  }),
]);

/** 등록 */
exports.create = combineMiddleware([
  body('content').isString().trim().notEmpty(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { articleId } = req.params;
    const { content } = req.body;
    const commentId = uuid();

    const item = await ArticleService.getArticleInfo({
      data: { id: articleId, boardType: req.BOARD_SETTING.TYPE },
      transaction,
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    const result = await CommentService.create({
      data: {
        id: commentId,
        content,
        postId: articleId,
      },
      boardSetting: req.BOARD_SETTING,
      user: req.user,
      transaction,
    });

    ArticleService.updateCommentCount({
      id: item.id,
      commentIds: commentId,
      addComment: true,
    });

    res.json(CommentService.getCommentObject(result));
  }),
]);

/** 삭제 */
exports.delete = combineMiddleware([
  param('commentId').isString(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { commentId } = req.params;

    const item = await CommentService.getCommentInfo({
      data: { id: commentId, boardType: req.BOARD_SETTING.TYPE },
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    await CommentService.delete({
      data: { ids: [commentId] },
      transaction,
    });

    ArticleService.updateCommentCount({
      id: item.postId,
      commentIds: commentId,
    });

    res.json(CommentService.getCommentObject(item));
  }),
]);
