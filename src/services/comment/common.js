const _ = require('lodash');
const { db } = require('../../database/models');

exports.getCommentInfo = async ({ data, transaction }) => {
  const { id, boardType } = data;

  const where = {
    ...(id && { id }),
    ...(boardType && { boardType }),
  };

  const findOne = Array.isArray(id) === false;

  const items = await db.Comment.findAll({
    where,
    ...(findOne && { limit: 1 }),
    ...(transaction && { transaction }),
  });

  return findOne ? items[0] : items;
};

exports.getCommentObject = (data, { set, remove } = {}) => {
  data = typeof data.get === 'function' ? data.get({ plain: true }) : data;

  let object = _.omit({ liked: false, ...data }, ['deletedAt', 'password']);

  if (set) {
    object = { ...object, ...set };
  }

  if (Array.isArray(remove) && remove.length > 0) {
    object = _.omit(object, remove);
  }

  return object;
};

exports.like = async ({ data, boardSetting, user, transaction }) => {
  const { postId } = data;
  const { TYPE: boardType } = boardSetting;

  const deleteCount = await db.Like.destroy({
    where: { postId, userId: user.userId },
    limit: 1,
    transaction,
  });

  const likeOnNow = deleteCount === 0;

  if (likeOnNow) {
    await db.Like.create(
      { postId, boardType, userId: user.userId },
      { transaction },
    );
  }

  return { likeOnNow };
};

exports.updateLikeCount = async ({ id }) => {
  await db.Comment.update(
    {
      likeCount: db.sequelize.literal(
        `(SELECT COUNT(*) FROM likes WHERE post_id='${id}')`,
      ),
    },
    { where: { id }, silent: true },
  );
};
