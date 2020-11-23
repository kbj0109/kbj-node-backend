const createError = require('http-errors');
const { param, validationResult, header } = require('express-validator');
const ArticleService = require('../../services/article');
const { combineMiddleware } = require('../../utils');
const { wrapTransaction } = require('../../utils');
const { ERROR_TYPE } = require('../../config');

module.exports = combineMiddleware([
  param('articleId').isString(),
  header('password')
    .if((v, { req }) => !req.user)
    .isString()
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

    const { password } = req.headers;
    const { articleId } = req.params;

    const item = await ArticleService.getArticleInfo({
      data: { id: articleId, boardType },
      transaction,
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

    const deleter = req.user ? req.user.userId : item.name;
    const deletedAt = new Date();

    await ArticleService.delete({
      data: {
        ids: [articleId],
        deleter,
        deletedAt,
      },
      transaction,
    });

    res.json([
      ArticleService.getArticleObject(item, {
        set: { useComment: USE_COMMENT, deleter, deletedAt },
      }),
    ]);
  }),
]);
