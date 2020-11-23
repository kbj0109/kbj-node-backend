const _ = require('lodash');
const { db } = require('../../database/models');

exports.getUserInfo = async ({ data, withoutDelete = true, transaction }) => {
  const { idx, userId, name, email } = data;

  const where = {
    ...(idx && { idx }),
    ...(userId && { userId }),
    ...(name && { name }),
    ...(email && { email }),
  };

  const findOne = Array.isArray(userId) === false;

  const items = await db.User.findAll({
    where,
    paranoid: withoutDelete,
    ...(findOne && { limit: 1 }),
    ...(transaction && { transaction }),
  });

  return findOne ? items[0] : items;
};

exports.getUserObject = (data, { set, remove, isAdmin = false } = {}) => {
  data = typeof data.get === 'function' ? data.get({ plain: true }) : data;

  let object = _.omit(
    data,
    [
      'password',
      'salt',
      ...(isAdmin === false
        ? ['idx', 'createdAt', 'updatedAt', 'deletedAt']
        : []),
    ].filter(Boolean),
  );

  if (set) {
    object = { ...object, ...set };
  }

  if (Array.isArray(remove) && remove.length > 0) {
    object = _.omit(object, remove);
  }

  return object;
};
