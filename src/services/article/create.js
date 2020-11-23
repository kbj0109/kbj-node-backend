const _ = require('lodash');
const bcryptjs = require('bcryptjs');
const { db } = require('../../database/models');
const TagService = require('../tag');
const FileService = require('../file');

module.exports = async ({ data, boardSetting, user, isAdmin, transaction }) => {
  const {
    id,
    subject,
    content,
    attachFiles,
    category,
    description,
    name,
    password,
    email,
    link,
    secret,
    field1,
    field2,
    field3,
    tags,
    notice,
    order,
    visible,
    visibleStart,
    visibleEnd,
    ip,
    device,
  } = data;

  const { TYPE: boardType, ATTACH_FILE_SIZE } = boardSetting;

  // 회원/비회원 여부에 따라 name, password, userId 정의
  const [{ name: userName }, passwordHash, userId] = await Promise.all([
    user ? db.User.findByPk(user.userIdx, { transaction }) : { name },
    user ? undefined : bcryptjs.hash(password, 8),
    user ? user.userId : '',
  ]);

  // Article 등록
  const createArticle = db.Article.create(
    _.omitBy(
      {
        id,
        boardType,
        subject,
        content,
        attachFiles,
        name: userName,
        password: passwordHash,
        userId,
        category,
        description,
        email,
        link,
        secret,
        ...(isAdmin && {
          visible,
          visibleStart,
          visibleEnd,
          notice,
          order,
        }),
        ip,
        device,
        field1,
        field2,
        field3,
      },
      _.isUndefined,
    ),
    { transaction },
  );

  const [item, createdTags] = await Promise.all([
    createArticle,
    // Tag 생성
    TagService.create({
      data: { postId: id, boardType, tags },
      transaction,
    }),
    // 임시 첨부된 파일을 Article 파일로 지정
    FileService.mappingFilesToPost({
      data: {
        attachFiles,
        // 비회원 등록의 경우 userId 값에 name 지정
        userId: user ? userId : userName,
        postId: id,
      },
      totalSizeLimit: ATTACH_FILE_SIZE,
      transaction,
    }),
  ]);

  return { ...item.get({ plain: true }), tags: createdTags };
};
