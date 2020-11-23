const createError = require('http-errors');
const { validationResult, query, param } = require('express-validator');
const _ = require('lodash');
const ArticleService = require('../../../services/article');
const CommentService = require('../../../services/comment');
const {
  wrapTransaction,
  wrapAsync,
  combineMiddleware,
} = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

/** 목록 */
exports.list = combineMiddleware([
  query('limit')
    .customSanitizer(v => {
      if (Number(v) > 0 === false) {
        return 30;
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
    .isIn(['createDesc', 'createAsc', 'likeDesc', 'likeAsc', '']),
  query('search').optional().isIn(['content', 'userId', 'name', '']),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { limit, offset, sort, search, searchKeyword } = req.query;

    const result = await CommentService.list({
      data: { limit, offset, sort, search, searchKeyword },
      user: req.user,
      isAdmin: true,
    });

    res.json({
      total: result.count,
      list: result.list.map(one =>
        CommentService.getCommentObject(one, {
          set: { liked: !!one.liked },
        }),
      ),
    });
  }),
]);

/** 삭제 */
exports.delete = combineMiddleware([
  param('commentId')
    .isString()
    .customSanitizer(ids => {
      return ids.split(',').filter(Boolean);
    }),

  wrapTransaction(async (req, res, next, transaction) => {
    const { commentId } = req.params;

    const items = await CommentService.getCommentInfo({
      data: { id: commentId },
      transaction,
    });
    if (items.length !== commentId.length) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    await CommentService.delete({
      data: { ids: commentId },
      transaction,
    });

    const postIds = _.uniq(items.map(item => item.postId));
    postIds.forEach(postId => {
      ArticleService.updateCommentCount({
        id: postId,
        commentIds: items.filter(item => item.postId === postId).map(v => v.id),
      });
    });

    res.json(items.map(item => CommentService.getCommentObject(item)));
  }),
]);
