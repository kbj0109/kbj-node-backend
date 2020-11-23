const _ = require('lodash');
const { db } = require('../../database/models');

module.exports = async ({ data, user, transaction }) => {
  const { id, postId, content } = data;

  const item = await db.Reply.create(
    _.omitBy(
      {
        id,
        userId: user.userId,
        postId,
        content,
      },
      _.isUndefined,
    ),
    { transaction },
  );

  return item;
};
