const _ = require('lodash');
const { db } = require('../../database/models');

exports.getBoardSettingInfo = async ({ data, transaction }) => {
  const { idx, id, type } = data;

  const where = {
    ...(idx && { idx }),
    ...(id && { id }),
    ...(type && { type }),
  };

  const findOne = Array.isArray(id) === false;

  const items = await db.BoardSetting.findAll({
    where,
    ...(findOne && { limit: 1 }),
    ...(transaction && { transaction }),
  });

  return findOne ? items[0] : items;
};

exports.getBoardSettingObject = (data, { set, remove } = {}) => {
  data = typeof data.get === 'function' ? data.get({ plain: true }) : data;

  let object = _.omit({ ...data }, ['idx', 'deletedAt'].filter(Boolean));

  if (set) {
    object = { ...object, ...set };
  }

  if (Array.isArray(remove) && remove.length > 0) {
    object = _.omit(object, remove);
  }

  return object;
};
