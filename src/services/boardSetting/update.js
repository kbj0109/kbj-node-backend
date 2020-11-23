const createError = require('http-errors');
const _ = require('lodash');
const { getBoardSettingInfo } = require('./common');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const {
    id,
    orgType,
    type,
    subject,
    createAuth,
    createLevel,
    createRole,
    readListAuth,
    readListLevel,
    readListRole,
    readAuth,
    readLevel,
    readRole,
    updateAuth,
    updateLevel,
    updateRole,
    deleteAuth,
    deleteLevel,
    deleteRole,
    likeAuth,
    likeLevel,
    likeRole,
    useComment,
    commentCreateAuth,
    commentCreateLevel,
    commentCreateRole,
    commentReadListAuth,
    commentReadListLevel,
    commentReadListRole,
    commentDeleteAuth,
    commentDeleteLevel,
    commentDeleteRole,
    commentLikeAuth,
    commentLikeLevel,
    commentLikeRole,
    fileCreateAuth,
    fileCreateLevel,
    fileCreateRole,
    fileReadAuth,
    fileReadLevel,
    fileReadRole,
    attachImageSize,
    attachFileSize,
    attachFileSizeTotal,
    updater,
  } = data;

  const [result] = await db.BoardSetting.update(
    _.omitBy(
      {
        type,
        subject,
        createAuth,
        createLevel,
        createRole,
        readListAuth,
        readListLevel,
        readListRole,
        readAuth,
        readLevel,
        readRole,
        updateAuth,
        updateLevel,
        updateRole,
        deleteAuth,
        deleteLevel,
        deleteRole,
        likeAuth,
        likeLevel,
        likeRole,
        useComment,
        commentCreateAuth,
        commentCreateLevel,
        commentCreateRole,
        commentReadListAuth,
        commentReadListLevel,
        commentReadListRole,
        commentDeleteAuth,
        commentDeleteLevel,
        commentDeleteRole,
        commentLikeAuth,
        commentLikeLevel,
        commentLikeRole,
        fileCreateAuth,
        fileCreateLevel,
        fileCreateRole,
        fileReadAuth,
        fileReadLevel,
        fileReadRole,
        attachImageSize,
        attachFileSize,
        attachFileSizeTotal,
        updater,
      },
      _.isUndefined,
    ),
    { where: { id }, transaction },
  );
  if (result !== 1) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  // type 변경 여부 확인 & 수정될 테이블 정보 확인
  if (orgType !== type) {
    const updateInfo = [
      { boardType: type },
      { where: { boardType: orgType }, transaction, silent: true },
    ];

    await Promise.all([
      db.Article.update(...updateInfo),
      db.Comment.update(...updateInfo),
      db.File.update(...updateInfo),
      db.Image.update(...updateInfo),
      db.Like.update(...updateInfo),
      db.Tag.update(...updateInfo),
    ]);
  }

  const uItem = await getBoardSettingInfo({ data: { id }, transaction });

  return uItem;
};
