const createError = require('http-errors');
const path = require('path');
const { wrapAsync } = require('../utils');
const { FILE_UPLOAD_PATH, ERROR_TYPE } = require('../config');
const FileService = require('../services/file');
const { getDate } = require('../utils');

/** 등록 전 첨부 파일 다운로드 */
exports.download = wrapAsync(async (req, res, next) => {
  const { fileId } = req.params;

  const item = await FileService.getFileInfo({
    data: { id: fileId, postId: '' },
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  // 파일 경로 구하기
  const date = getDate(item.createdAt.getTime());
  const filePath = path.join(FILE_UPLOAD_PATH, date, item.id);

  res.download(filePath, item.fileName, downloadErr => {
    if (downloadErr) {
      next(createError(400, downloadErr));
    }
  });
});
