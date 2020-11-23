const createError = require('http-errors');
const { body, validationResult, header, query } = require('express-validator');
const ArticleService = require('../../services/article');
const CommentService = require('../../services/comment');
const {
  wrapTransaction,
  wrapAsync,
  combineMiddleware,
} = require('../../utils');
const { ERROR_TYPE } = require('../../config');
const { uuid } = require('../../utils');

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

    const { verifyAuth, USE_COMMENT } = req.BOARD_SETTING;

    const { articleId } = req.params;
    const { sort = 'createDesc' } = req.query;

    if (verifyAuth().isError || USE_COMMENT === false) {
      throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
    }

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
  body(['name', 'password'])
    .if((v, { req }) => !req.user)
    .isString()
    .trim()
    .notEmpty(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { verifyAuth, TYPE: boardType, USE_COMMENT } = req.BOARD_SETTING;

    const { articleId } = req.params;
    const { content, name, password } = req.body;
    const commentId = uuid();

    if (verifyAuth().isError || USE_COMMENT === false) {
      throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
    }

    const item = await ArticleService.getArticleInfo({
      data: { id: articleId, boardType },
      transaction,
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    const result = await CommentService.create({
      data: {
        id: commentId,
        postId: articleId,
        content,
        name,
        password,
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
  header('password')
    .custom((value, { req }) => {
      if (req.user === undefined && !value) {
        return false;
      }
      return true;
    })
    .optional()
    .isString(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { commentId } = req.params;
    const { password } = req.headers;
    const { verifyAuth, TYPE: boardType, USE_COMMENT } = req.BOARD_SETTING;

    const item = await CommentService.getCommentInfo({
      data: { id: commentId, boardType },
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
      }).isError ||
      USE_COMMENT === false
    ) {
      throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
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
