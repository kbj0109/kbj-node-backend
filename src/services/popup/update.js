const createError = require('http-errors');
const _ = require('lodash');
const { getPopupInfo } = require('./common');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');

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
    updater,
  } = data;

  const [result] = await db.Popup.update(
    _.omitBy(
      {
        subject,
        content,
        type,
        width,
        height,
        visible,
        visibleStart,
        visibleEnd,
        updater,
      },
      _.isUndefined,
    ),
    { where: { id }, transaction },
  );

  if (result !== 1) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  const uItem = await getPopupInfo({
    data: { id },
    transaction,
  });

  return uItem;
};
