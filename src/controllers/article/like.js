const createError = require('http-errors');
const ArticleService = require('../../services/article');
const CommentService = require('../../services/comment');
const { wrapTransaction } = require('../../utils');
const { ERROR_TYPE } = require('../../config');

/** 게시글 추천 */
exports.article = wrapTransaction(async (req, res, next, transaction) => {
  const { verifyAuth, TYPE: boardType } = req.BOARD_SETTING;
  const { articleId } = req.params;

  if (verifyAuth().isError) {
    throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
  }

  const item = await ArticleService.getArticleInfo({
    data: { id: articleId, boardType },
    transaction,
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  const { likeOnNow } = await ArticleService.like({
    data: { postId: articleId },
    boardSetting: req.BOARD_SETTING,
    user: req.user,
    transaction,
  });

  ArticleService.updateLikeCount({ id: item.id });

  res.json({
    postId: item.id,
    liked: likeOnNow,
    likeCount: likeOnNow ? item.likeCount + 1 : item.likeCount - 1,
  });
});

/** 댓글 추천 */
exports.comment = wrapTransaction(async (req, res, next, transaction) => {
  const { verifyAuth, TYPE: boardType } = req.BOARD_SETTING;
  const { commentId } = req.params;

  if (verifyAuth().isError) {
    throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
  }

  const item = await CommentService.getCommentInfo({
    data: { id: commentId, boardType },
    transaction,
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  const { likeOnNow } = await CommentService.like({
    data: { postId: item.id },
    boardSetting: req.BOARD_SETTING,
    user: req.user,
    transaction,
  });

  CommentService.updateLikeCount({ id: item.id });

  res.json({
    postId: item.id,
    liked: likeOnNow,
    likeCount: likeOnNow ? item.likeCount + 1 : item.likeCount - 1,
  });
});
