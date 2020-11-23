const _ = require('lodash');
const { db } = require('../../database/models');

exports.getContactInfo = async ({ data, transaction }) => {
  const { id } = data;

  const where = {
    ...(id && { id }),
  };

  const findOne = Array.isArray(id) === false;

  const items = await db.Contact.findAll({
    where,
    ...(findOne && { limit: 1 }),
    ...(transaction && { transaction }),
  });

  return findOne ? items[0] : items;
};

exports.getContactObject = (data, { set, remove } = {}) => {
  data = typeof data.get === 'function' ? data.get({ plain: true }) : data;

  let object = _.omit(
    data,
    ['deletedAt', 'deleter', 'ip', 'device'].filter(Boolean),
  );

  if (set) {
    object = { ...object, ...set };
  }

  if (Array.isArray(remove) && remove.length > 0) {
    object = _.omit(object, remove);
  }

  return object;
};

exports.updateCommentCount = async ({ id, commentIds, addComment = false }) => {
  const comments = Array.isArray(commentIds)
    ? commentIds.join("','")
    : commentIds;
  const countCommentQuery = `(SELECT COUNT(*) FROM replies WHERE post_id='${id}' AND id NOT IN ('${comments}') )`;

  await db.Contact.update(
    {
      commentCount: db.sequelize.literal(
        `${countCommentQuery} ${addComment ? '+ 1' : ''}`,
      ),
    },
    { where: { id }, silent: true },
  );
};
