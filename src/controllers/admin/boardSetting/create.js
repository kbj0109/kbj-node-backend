const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const BoardSettingService = require('../../../services/boardSetting');
const { ERROR_TYPE } = require('../../../config');
const { wrapTransaction, combineMiddleware, uuid } = require('../../../utils');

module.exports = combineMiddleware([
  body('type').isString().trim().notEmpty(),
  body('subject').isString().trim().notEmpty(),
  body('createAuth').optional().isString(),
  body('createLevel').optional().isInt({ min: 0 }).not().isString(),
  body(['createRole']).optional().isString(),
  body('readListAuth').optional().isString(),
  body('readListLevel').optional().isInt({ min: 0 }).not().isString(),
  body('readListRole').optional().isString(),
  body('readAuth').optional().isString(),
  body('readLevel').optional().isInt({ min: 0 }).not().isString(),
  body('readRole').optional().isString(),
  body('updateAuth').optional().isString(),
  body('updateLevel').optional().isInt({ min: 0 }).not().isString(),
  body('updateRole').optional().isString(),
  body('deleteAuth').optional().isString(),
  body('deleteLevel').optional().isInt({ min: 0 }).not().isString(),
  body('deleteRole').optional().isString(),
  body('likeAuth').optional().isString(),
  body('likeLevel').optional().isInt({ min: 0 }).not().isString(),
  body('likeRole').optional().isString(),
  body('useComment').optional().toBoolean(),
  body('commentCreateAuth').optional().isString(),
  body('commentCreateLevel').optional().isInt({ min: 0 }).not().isString(),
  body('commentCreateRole').optional().isString(),
  body('commentReadListAuth').optional().isString(),
  body('commentReadListLevel').optional().isInt({ min: 0 }).not().isString(),
  body('commentReadListRole').optional().isString(),
  body('commentDeleteAuth').optional().isString(),
  body('commentDeleteLevel').optional().isInt({ min: 0 }).not().isString(),
  body('commentDeleteRole').optional().isString(),
  body('commentLikeAuth').optional().isString(),
  body('commentLikeLevel').optional().isInt({ min: 0 }).not().isString(),
  body('commentLikeRole').optional().isString(),
  body('fileCreateAuth').optional().isString(),
  body('fileCreateLevel').optional().isInt({ min: 0 }).not().isString(),
  body('fileCreateRole').optional().isString(),
  body('fileReadAuth').optional().isString(),
  body('fileReadLevel').optional().isInt({ min: 0 }).not().isString(),
  body('fileReadRole').optional().isString(),
  body('attachImageSize').optional().isInt({ min: 0 }).not().isString(),
  body('attachFileSize').optional().isInt({ min: 0 }).not().isString(),
  body('attachFileSizeTotal').optional().isInt({ min: 0 }).not().isString(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { item, isCreated } = await BoardSettingService.create({
      data: { ...req.body, id: uuid() },
      user: req.user,
      transaction,
    });

    if (isCreated === false) {
      throw createError(400, {
        type: ERROR_TYPE.COM.DUPLICATE,
        message: '이미 등록된 게시판',
      });
    }

    res.json(BoardSettingService.getBoardSettingObject(item));
  }),
]);
