const createError = require('http-errors');
const path = require('path');
const fs = require('fs-extra');
const { db } = require('../../database/models');
const {
  ERROR_TYPE,
  FILE_UPLOAD_PATH,
  IMAGE_UPLOAD_PATH,
} = require('../../config');
const { getDate } = require('../../utils');

module.exports = async ({ data, transaction }) => {
  const { id, boardType, deleter, deletedAt } = data;

  // Board와 기타 테이블 삭제 전 삭제될 파일 리스트 정리
  const [fileList, imageList] = await Promise.all([
    db.File.findAll({
      attributes: ['id', 'createdAt'],
      where: { boardType },
      transaction,
    }),
    db.Image.findAll({
      attributes: ['id', 'createdAt'],
      where: { boardType },
      transaction,
    }),
  ]);

  // Board의 type과 연결된 다른 테이블 내용 삭제
  const [[result]] = await Promise.all([
    db.BoardSetting.update(
      { deleter, deletedAt },
      { where: { id }, transaction, silent: true },
    ),
    db.Article.destroy({ where: { boardType }, transaction }),
    db.File.destroy({ where: { boardType }, transaction }),
    db.Tag.destroy({ where: { boardType }, transaction }),
    db.Comment.destroy({ where: { boardType }, transaction }),
    db.Like.destroy({ where: { boardType }, transaction }),
    db.Image.destroy({ where: { boardType }, transaction }),
  ]);

  if (result !== 1) {
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
  imageList.forEach(file => {
    const date = getDate(file.createdAt.getTime()); // 이미지 파일이 저장된 폴더
    const filePath = path.join(IMAGE_UPLOAD_PATH, date, file.id); // 이미지 파일 전체 경로
    fs.remove(filePath, err => {
      if (err) {
        console.log(err);
      }
    });
  });
};
