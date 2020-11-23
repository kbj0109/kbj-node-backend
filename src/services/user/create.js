const bcryptjs = require('bcryptjs');
const _ = require('lodash');
const { db } = require('../../database/models');

module.exports = async ({ data }) => {
  const {
    userId,
    password,
    name,
    email,
    phoneNumber,
    address,
    address2,
    zipCode,
    level = 0,
    role = '',
  } = data;

  // 비밀번호 암호화 및 회원가입
  const salt = await bcryptjs.genSalt(10);
  const hash = await bcryptjs.hash(password, salt);

  const result = await db.User.create(
    _.omitBy(
      {
        userId,
        // salt 컬럼에 비밀번호 salt 부분 보관
        password: hash.substr(salt.length),
        salt,
        name,
        email,
        phoneNumber,
        address,
        address2,
        zipCode,
        level,
        role,
      },
      _.isUndefined,
    ),
  );

  return result;
};
