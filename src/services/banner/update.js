const createError = require('http-errors');
const _ = require('lodash');
const { getBannerInfo } = require('./common');
const { db } = require('../../database/models');
const FileService = require('../file');
const { ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const {
    id,
    subject,
    type,
    attachFiles,
    description,
    link,
    target,
    visible,
    visibleStart,
    visibleEnd,
    order,
    orgAttachFiles,
    updater,
  } = data;

  const [, [result]] = await Promise.all([
    FileService.updateFilesToPost({
      data: {
        beforeFiles: orgAttachFiles,
        newFiles: attachFiles,
        postId: id,
        userId: updater,
      },
      totalSizeLimit: 1024 * 1024 * 10,
      transaction,
    }),

    db.Banner.update(
      _.omitBy(
        {
          subject,
          type,
          attachFiles,
          description,
          link,
          target,
          visible,
          visibleStart,
          visibleEnd,
          order,
          updater,
        },
        _.isUndefined,
      ),
      {
        where: { id },
        transaction,
      },
    ),
  ]);

  if (result !== 1) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  const uItem = await getBannerInfo({
    data: { id },
    transaction,
  });

  return uItem;
};
