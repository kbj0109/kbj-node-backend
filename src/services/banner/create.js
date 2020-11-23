const _ = require('lodash');
const { db } = require('../../database/models');
const FileService = require('../file');

module.exports = async ({ data, user, transaction }) => {
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
  } = data;

  const create = db.Banner.create(
    _.omitBy(
      {
        id,
        userId: user.userId,
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
      },
      _.isUndefined,
    ),
    {
      transaction,
    },
  );

  const [item] = await Promise.all([
    create,

    FileService.mappingFilesToPost({
      data: {
        attachFiles,
        userId: user.userId,
        postId: id,
      },
      totalSizeLimit: 1024 * 1024 * 30,
      transaction,
    }),
  ]);

  return item;
};
