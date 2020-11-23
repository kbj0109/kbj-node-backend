const createError = require('http-errors');
const path = require('path');
const { ERROR_TYPE, FILE_UPLOAD_PATH } = require('../../../config');
const fileUpload = require('../../../middlewares/fileUpload');
const FileService = require('../../../services/file');
const { getDate } = require('../../../utils');
const { wrapAsync, combineMiddleware } = require('../../../utils');

/** 배너 이미지 첨부 (이미지를 파일 형식으로 첨부) */
exports.imageUpload = combineMiddleware([
  fileUpload({
    uploadPath: FILE_UPLOAD_PATH,
    fileSizeLimit: 1024 * 1024 * 10,
    fileFilter: (req, file, callback) => {
      if (file.mimetype.includes('image') === false) {
        callback(new Error('이미지 외 첨부 불가'));
      } else {
        callback(null, true);
      }
    },
  }),

  wrapAsync(async (req, res) => {
    const result = await FileService.create({
      data: {
        file: req.file,
        uploadedTime: req.uploadedTime,
        userId: req.user.userId,
        boardType: '',
      },
    });

    res.json({
      id: result.id,
      fileName: result.fileName,
      fileSize: result.fileSize,
    });
  }),
]);

/** 배너 이미지 다운로드 (이미지를 파일 형식으로 다운로드) */
exports.imageDownload = wrapAsync(async (req, res, next) => {
  const item = await FileService.getFileInfo({
    data: { id: req.params.imgId },
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
