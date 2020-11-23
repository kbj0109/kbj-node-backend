const createError = require('http-errors');
const { param, validationResult } = require('express-validator');
const ArticleService = require('../../../services/article');
const { combineMiddleware } = require('../../../utils');
const { wrapTransaction } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  param('articleId')
    .isString()
    .customSanitizer(ids => {
      return ids.split(',').filter(Boolean);
    }),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { TYPE: boardType, USE_COMMENT } = req.BOARD_SETTING;
    const { articleId } = req.params;

    const items = await ArticleService.getArticleInfo({
      data: { id: articleId, boardType },
      transaction,
    });
    if (items.length !== articleId.length) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    const deleter = req.user ? req.user.userId : items.name;
    const deletedAt = new Date();

    await ArticleService.delete({
      data: {
        ids: articleId,
        deleter,
        deletedAt,
      },
      transaction,
    });

    res.json(
      items.map(item =>
        ArticleService.getArticleObject(item, {
          set: { useComment: USE_COMMENT, deleter, deletedAt },
          isAdmin: true,
        }),
      ),
    );
  }),
]);
