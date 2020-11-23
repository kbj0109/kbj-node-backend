const createError = require('http-errors');
const path = require('path');
const FileService = require('../../../services/file');
const { getDate } = require('../../../utils');
const { wrapAsync } = require('../../../utils');
const { FILE_UPLOAD_PATH, ERROR_TYPE } = require('../../../config');

exports.download = wrapAsync(async (req, res, next) => {
  const item = await FileService.getFileInfo({
    data: { id: req.params.fileId },
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
