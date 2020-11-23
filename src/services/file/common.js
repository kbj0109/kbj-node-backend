const createError = require('http-errors');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const { getDate } = require('../../utils');
const { db } = require('../../database/models');
const { FILE_UPLOAD_PATH, ERROR_TYPE } = require('../../config');

exports.create = async ({ data }) => {
  const { file, uploadedTime, userId, boardType } = data;

  const item = await db.File.create(
    _.omitBy(
      {
        id: file.filename,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId,
        boardType,
        createdAt: uploadedTime,
      },
      _.isUndefined,
    ),
  );

  return item;
};

exports.getFileInfo = async ({ data, boardSetting }) => {
  const { id, postId } = data;
  const { TYPE: boardType = '' } = boardSetting || {};

  const item = await db.File.findOne({
    where: {
      id,
      ...(boardType && { boardType }),
      ...(postId && { postId }),
    },
  });

  return item;
};

exports.createImage = async ({ data }) => {
  const { file, uploadedTime, userId, boardType } = data;

  const item = await db.Image.create(
    _.omitBy(
      {
        id: file.filename,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId,
        boardType,
        createdAt: uploadedTime,
      },
      _.isUndefined,
    ),
  );

  return item;
};

exports.getImageInfo = async ({ data, boardSetting }) => {
  const { id } = data;
  const { TYPE: boardType = '' } = boardSetting || {};

  const item = await db.Image.findOne({
    where: { id, ...(boardType && { boardType }) },
  });

  return item;
};

const checkTotalFileSize = async ({
  attachFiles,
  totalSizeLimit,
  transaction,
}) => {
  if (attachFiles.length === 0) {
    return false;
  }
  // 1. 첨부될 파일의 크기 확인
  const files = await db.File.findAll({
    attributes: ['fileSize'],
    where: { id: attachFiles.map(one => one.id) },
    transaction,
  });

  const totalSize = files.reduce(
    (totalSize, file) => totalSize + file.fileSize,
    0,
  );

  return totalSize > totalSizeLimit;
};

exports.mappingFilesToPost = async ({ data, totalSizeLimit, transaction }) => {
  const { attachFiles, userId, postId } = data;

  if (Array.isArray(attachFiles) && attachFiles.length === 0) {
    return 0;
  }

  const checkFileSize = await checkTotalFileSize({
    attachFiles,
    totalSizeLimit,
    transaction,
  });

  if (checkFileSize) {
    throw createError(400, { type: ERROR_TYPE.FILE.LIMIT_FILE_SIZE });
  }

  // 2. 첨부파일 정보에 등록될 postId 추가
  const [updateLength] = await db.File.update(
    { userId, postId },
    {
      where: { id: attachFiles.map(one => one.id), postId: '' },
      transaction,
    },
  );

  // 첨부파일 PostId 매핑이 실패한 경우
  if (attachFiles.length !== updateLength) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  return updateLength;
};

exports.updateFilesToPost = async ({ data, totalSizeLimit, transaction }) => {
  const { beforeFiles, newFiles, userId, postId } = data;

  const checkFileSize = await checkTotalFileSize({
    attachFiles: newFiles,
    totalSizeLimit,
    transaction,
  });

  if (checkFileSize) {
    throw createError(400, { type: ERROR_TYPE.FILE.LIMIT_FILE_SIZE });
  }

  // 추가/삭제 예정의 파일 리스트 정리
  const orgAttachFilesId = beforeFiles.map(one => one.id);
  const newAttachFilesId = newFiles.map(one => one.id);
  const addedFileList = _.difference(newAttachFilesId, orgAttachFilesId); // 추가된 파일의 id 리스트
  const deleteFileList = _.difference(orgAttachFilesId, newAttachFilesId); // 삭제된 파일 id 리스트

  const deleteFile = db.File.destroy({
    where: { id: deleteFileList },
    transaction,
  });
  const addFile = db.File.update(
    { postId, userId },
    { where: { id: addedFileList }, transaction },
  );

  const [deleteedFileCount, [addedFileCount]] = await Promise.all([
    deleteFile,
    addFile,
  ]);

  if (
    deleteedFileCount !== deleteFileList.length ||
    addedFileCount !== addedFileList.length
  ) {
    throw createError(500, { type: ERROR_TYPE.COM.DB_NOT_UPDATE });
  }

  // 4. 삭제될 파일들 정보를 DB에서 호출
  const deletefiles = await db.File.findAll({
    attributes: ['id', 'createdAt'],
    where: { id: deleteFileList },
    transaction,
    paranoid: false,
  });

  return {
    removeRealFile: () => {
      deletefiles.forEach(file => {
        const date = getDate(file.createdAt.getTime()); // 파일이 저장된 폴더
        const filePath = path.join(FILE_UPLOAD_PATH, date, file.id); // 파일 전체 경로
        fs.remove(filePath, err => {
          if (err) {
            console.log(err);
          }
        });
      });
    },
  };
};
