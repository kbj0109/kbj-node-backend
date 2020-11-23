const createError = require('http-errors');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');
const { getRandomToken } = require('../../utils');

/** 비밀번호 찾기 - 인증번호 요청 (인증번호 이메일 전송) */
module.exports = async ({ data }) => {
  const { userId, token } = data;

  const item = await db.Token.findOne({
    where: { userId, type: 'FIND_PW' },
  });

  if (!item || item.token !== token) {
    throw createError(400, {
      type: ERROR_TYPE.AUTH.INVAILD_TOKEN,
      message: '유효하지 않은 Token',
    });
  }

  // 토큰 만료
  if (item.expired < new Date()) {
    db.Token.destroy({ where: { userId, type: 'FIND_PW' } });

    throw createError(401, {
      type: ERROR_TYPE.AUTH.EXPIRED_TOKEN,
      message: 'Token 만료',
    });
  }

  const pwToken = getRandomToken();
  const pwTokenExpired = new Date();
  pwTokenExpired.setMinutes(pwTokenExpired.getMinutes() + 60);

  const newItem = await db.Token.create({
    token: pwToken,
    userId,
    expired: pwTokenExpired,
    type: 'CHANGE_PW',
  });

  db.Token.destroy({ where: { userId, type: 'FIND_PW' } });

  return { token: newItem.token, tokenExpired: newItem.expired };
};
