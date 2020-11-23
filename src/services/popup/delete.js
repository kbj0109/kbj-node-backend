const createError = require('http-errors');
const path = require('path');
const fs = require('fs-extra');
const { getDate } = require('../../utils');
const { db } = require('../../database/models');
const { ERROR_TYPE, FILE_UPLOAD_PATH } = require('../../config');

module.exports = async ({ data, transaction }) => {
  const { ids, deleter, deletedAt } = data;

  const [fileList, [deleteCount], deleteFile] = await Promise.all([
    db.File.findAll({
      attributes: ['id', 'createdAt'],
      where: { postId: ids },
    }),
    db.Popup.update(
      { deleter, deletedAt },
      { where: { id: ids }, transaction, silent: true },
    ),
    db.File.destroy({
      where: { postId: ids },
      transaction,
    }),
  ]);

  if (deleteCount !== ids.length || deleteFile !== fileList.length) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

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
