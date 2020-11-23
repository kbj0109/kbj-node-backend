const createError = require('http-errors');
const _ = require('lodash');
const { db } = require('../../database/models');
const { ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const { tags: newTags, postId, boardType } = data;

  // 추가/삭제 예정의 태그 리스트 정리
  const orgTagItems = await db.Tag.findAll({
    where: { postId },
    transaction,
  });
  const orgTags = orgTagItems.map(one => one.content);

  const addedTagList = _.difference(newTags, orgTags); // 추가된 태그 리스트
  const deletedTagList = _.difference(orgTags, newTags); // 삭제된 태그 리스트

  const newTagObjects = addedTagList.map(item => {
    return { postId, boardType, content: item };
  });

  const addTag = db.Tag.bulkCreate(newTagObjects, { transaction });
  const deleteTag = db.Tag.destroy({
    where: { idx: orgTagItems.map(one => one.idx), content: deletedTagList },
    transaction,
  });

  const [deletedTagCount, addedTags] = await Promise.all([deleteTag, addTag]);

  if (
    deletedTagCount !== deletedTagList.length ||
    addedTags.length !== addedTagList.length
  ) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  // 새로운 태그 리스트
  const newTagList = orgTags
    .filter(v => !deletedTagList.includes(v))
    .concat(addedTags.map(v => v.content));

  return newTagList;
};
