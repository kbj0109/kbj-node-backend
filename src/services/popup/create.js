const _ = require('lodash');
const { db } = require('../../database/models');

module.exports = async ({ data, transaction }) => {
  const {
    id,
    subject,
    content,
    type,
    width,
    height,
    visible,
    visibleStart,
    visibleEnd,
    order,
    userId,
  } = data;

  const item = await db.Popup.create(
    _.omitBy(
      {
        id,
        userId,
        subject,
        content,
        type,
        width,
        height,
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

  return item;
};
