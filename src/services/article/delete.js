const createError = require('http-errors');
const path = require('path');
const fs = require('fs-extra');
const { getDate } = require('../../utils');
const { db } = require('../../database/models');
const { FILE_UPLOAD_PATH, ERROR_TYPE } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const { ids, deleter, deletedAt } = data;

  // 연결된 파일 + 댓글 리스트 찾기
  const [fileList, commentList] = await Promise.all([
    db.File.findAll({
      attributes: ['id', 'createdAt'],
      where: { postId: ids },
      transaction,
    }),
    db.Comment.findAll({
      where: { postId: ids },
      transaction,
    }),
  ]);

  // Article 삭제 + 연결된 태그, 추천(Article + 댓글), 댓글, 파일 삭제
  const [
    [deleteArticleCount],
    deleteFileCount,
    deleteCommentCount,
  ] = await Promise.all([
    db.Article.update(
      { deleter, deletedAt },
      { where: { id: ids }, transaction, silent: true },
    ),
    db.File.destroy({
      where: { id: fileList.map(item => item.id) },
      transaction,
    }),
    db.Comment.destroy({
      where: { id: commentList.map(item => item.id) },
      transaction,
    }),
    db.Tag.destroy({
      where: { postId: ids },
      transaction,
    }),
    db.Like.destroy({
      where: { postId: [ids, ...commentList.map(item => item.id)] },
      transaction,
    }),
  ]);

  if (
    deleteArticleCount !== ids.length ||
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
