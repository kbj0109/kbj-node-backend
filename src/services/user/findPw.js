const { Op } = require('sequelize');
const { format } = require('date-fns');
const MailService = require('../mail');
const { db } = require('../../database/models');
const { templateRender, getRandomDigits } = require('../../utils');

/** 비밀번호 찾기 - 인증번호 요청 (인증번호 이메일 전송) */
module.exports = async ({ data, transaction }) => {
  const { userId, email } = data;

  const token = getRandomDigits({ length: 6 });
  const tokenExpired = new Date();
  tokenExpired.setMinutes(tokenExpired.getMinutes() + 10);

  const newItem = await db.Token.create(
    { token, userId, expired: tokenExpired, type: 'FIND_PW' },
    { transaction },
  );

  db.Token.destroy({
    where: {
      userId,
      type: ['FIND_PW', 'CHANGE_PW'],
      idx: { [Op.not]: newItem.idx },
    },
  });

  MailService.sendMail({
    to: email,
    subject: `비밀번호 찾기 인증번호`,
    content: templateRender({
      htmlPath: 'html/mail/token.html',
      data: {
        token,
        tokenExpired: format(tokenExpired, 'yyyy년 MM월 dd일 HH:mm'),
      },
    }),
  });

  return { token, tokenExpired: newItem.expired };
};
