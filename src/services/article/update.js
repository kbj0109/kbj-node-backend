const createError = require('http-errors');
const _ = require('lodash');
const { db } = require('../../database/models');
const TagService = require('../tag');
const FileService = require('../file');
const { ERROR_TYPE } = require('../../config');
const { getArticleInfo } = require('./common');

module.exports = async ({ data, boardSetting, user, isAdmin, transaction }) => {
  const {
    id,
    subject,
    content,
    attachFiles,
    category,
    description,
    email,
    link,
    secret,
    field1,
    field2,
    field3,
    tags,
    notice,
    order,
    visible,
    visibleStart,
    visibleEnd,
    ip,
    device,
    orgAttachFiles,
    updater,
  } = data;

  const { TYPE: boardType, ATTACH_FILE_SIZE } = boardSetting;

  const [updateFileResult, newTags] = await Promise.all([
    FileService.updateFilesToPost({
      data: {
        beforeFiles: orgAttachFiles,
        newFiles: attachFiles,
        postId: id,
        userId: user ? user.userId : '',
      },
      totalSizeLimit: ATTACH_FILE_SIZE,
      transaction,
    }),
    TagService.update({
      data: { postId: id, tags, boardType },
      transaction,
    }),
  ]);

  const [result] = await db.Article.update(
    _.omitBy(
      {
        boardType,
        subject,
        content,
        attachFiles,
        category,
        description,
        email,
        link,
        secret,
        ...(isAdmin && {
          visible,
          visibleStart,
          visibleEnd,
          notice,
          order,
        }),
        ip,
        device,
        field1,
        field2,
        field3,
        updater,
      },
      _.isUndefined,
    ),
    {
      where: { id },
      transaction,
    },
  );
  if (result !== 1) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  updateFileResult.removeRealFile();

  const uItem = await getArticleInfo({ data: { id }, transaction });

  return { ...uItem.get({ plain: true }), tags: newTags };
};
