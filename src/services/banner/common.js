const _ = require('lodash');
const { db } = require('../../database/models');

exports.getBannerInfo = async ({ data, transaction }) => {
  const { idx, id } = data;

  const where = {
    ...(idx && { idx }),
    ...(id && { id }),
  };

  const findOne = Array.isArray(id) === false;

  const items = await db.Banner.findAll({
    where,
    ...(findOne && { limit: 1 }),
    ...(transaction && { transaction }),
  });

  return findOne ? items[0] : items;
};

exports.getBannerObject = (data, { set, remove } = {}) => {
  data = typeof data.get === 'function' ? data.get({ plain: true }) : data;

  let object = _.omit(data);

  if (set) {
    object = { ...object, ...set };
  }

  if (Array.isArray(remove) && remove.length > 0) {
    object = _.omit(object, remove);
  }

  return object;
};
