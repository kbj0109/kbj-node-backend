const _ = require('lodash');
const bcryptjs = require('bcryptjs');
const { db } = require('../../database/models');

module.exports = async ({ data, boardSetting, user, transaction }) => {
  const { TYPE: boardType } = boardSetting;
  const { id, postId, name, password, content } = data;

  // 회원/비회원 여부에 따라 name, password, userId 정의
  const [{ name: userName }, userPassword, userId] = await Promise.all([
    user ? db.User.findByPk(user.userIdx, { transaction }) : { name },
    user ? undefined : bcryptjs.hash(password, 8),
    user ? user.userId : '',
  ]);

  const comment = await db.Comment.create(
    _.omitBy(
      {
        id,
        postId,
        userId,
        name: userName,
        password: userPassword,
        boardType,
        content,
      },
      _.isUndefined,
    ),
    { transaction },
  );

  return comment;
};
