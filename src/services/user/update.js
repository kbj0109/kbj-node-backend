const createError = require('http-errors');
const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const { db } = require('../../database/models');
const { getUserInfo } = require('./common');
const { ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const {
    userId,
    newPassword,
    name,
    email,
    phoneNumber,
    address,
    address2,
    zipCode,
    level,
    role,
  } = data;

  // 비밀번호 수정시 비밀번호 암호화
  const pw = await (async () => {
    if (newPassword) {
      const salt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(newPassword, salt);
      const password = hash.substr(salt.length);
      return { password, salt };
    }
    return null;
  })();

  // 실제 수정
  const [result] = await db.User.update(
    _.omitBy(
      {
        level,
        role,
        name,
        ...(pw || null),
        email,
        phoneNumber,
        address,
        address2,
        zipCode,
      },
      _.isUndefined,
    ),
    { where: { userId }, transaction },
  );

  if (result !== 1) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  const uItem = await getUserInfo({
    data: { userId },
    transaction,
  });

  return uItem;
};
