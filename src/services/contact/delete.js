const createError = require('http-errors');
const path = require('path');
const fs = require('fs-extra');
const { db } = require('../../database/models');
const { getDate } = require('../../utils');
const { FILE_UPLOAD_PATH, ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const { ids, deleter, deletedAt } = data;

  // 연결된 파일 + 댓글 리스트 찾기
  const findFile = db.File.findAll({
    attributes: ['id', 'createdAt'],
    where: { postId: ids },
    transaction,
  });
  const findComment = db.Reply.findAll({
    where: { postId: ids },
    transaction,
  });
  const [fileList, commentList] = await Promise.all([findFile, findComment]);

  const deleteContact = db.Contact.update(
    { deleter, deletedAt },
    { where: { id: ids }, transaction, silent: true },
  );
  const deleteComment = db.Reply.destroy({
    where: { postId: ids },
    transaction,
  });
  const deleteFile = db.File.destroy({
    where: { postId: ids },
    transaction,
  });

  const [
    [deleteContactCount],
    deleteFileCount,
    deleteCommentCount,
  ] = await Promise.all([deleteContact, deleteFile, deleteComment]);

  if (
    deleteContactCount !== ids.length ||
    deleteFileCount !== fileList.length ||
    deleteCommentCount !== commentList.length
  ) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  // 실제 파일 삭제
  fileList.forEach(file => {
    const date = getDate(file.createdAt.getTime()); // 파일이 저장된 폴더
    const filePath = path.join(FILE_UPLOAD_PATH, date, file.id); // 파일 전체 경로
    fs.remove(filePath, err => {
      if (err) {
        console.log(err);
      }
    });
  });
};
