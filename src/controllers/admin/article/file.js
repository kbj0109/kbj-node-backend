const createError = require('http-errors');
const path = require('path');
const {
  FILE_UPLOAD_PATH,
  IMAGE_UPLOAD_PATH,
  ERROR_TYPE,
} = require('../../../config');
const fileUpload = require('../../../middlewares/fileUpload');
const FileService = require('../../../services/file');
const { getDate } = require('../../../utils');
const { wrapAsync, combineMiddleware } = require('../../../utils');

/** 게시물 등록 전 파일 업로드 */
exports.upload = combineMiddleware([
  fileUpload({ uploadPath: FILE_UPLOAD_PATH }),

  wrapAsync(async (req, res) => {
    const result = await FileService.create({
      data: {
        file: req.file,
        uploadedTime: req.uploadedTime,
        userId: req.user.userId,
        boardType: req.params.boardType,
      },
    });

    res.json({
      id: result.id,
      fileName: result.fileName,
      fileSize: result.fileSize,
    });
  }),
]);

/** 파일 다운로드 */
exports.download = wrapAsync(async (req, res, next) => {
  const item = await FileService.getFileInfo({
    data: { id: req.params.fileId },
    boardSetting: req.BOARD_SETTING,
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

/** 게시물 등록 전 이미지 업로드 */
exports.imageUpload = combineMiddleware([
  fileUpload({
    uploadPath: IMAGE_UPLOAD_PATH,
    fileFilter: (req, file, callback) => {
      if (file.mimetype.includes('image') === false) {
        callback(new Error('이미지 외 첨부 불가'));
      } else {
        callback(null, true);
      }
    },
  }),

  wrapAsync(async (req, res) => {
    const result = await FileService.createImage({
      data: {
        file: req.file,
        uploadedTime: req.uploadedTime,
        userId: req.user.userId,
        boardType: req.params.boardType,
      },
    });

    res.json({
      id: result.id,
      fileName: result.fileName,
      fileSize: result.fileSize,
    });
  }),
]);

/** 이미지 다운로드 */
exports.imageDownload = wrapAsync(async (req, res, next) => {
  const item = await FileService.getImageInfo({
    data: { id: req.params.imgId },
    boardSetting: req.BOARD_SETTING,
  });
  if (!item) {
    throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
  }

  // 파일 경로 구하기
  const date = getDate(item.createdAt.getTime());
  const filePath = path.join(IMAGE_UPLOAD_PATH, date, item.id);

  res.type(item.mimeType);

  res.sendFile(filePath, downloadErr => {
    if (downloadErr) {
      next(createError(400, downloadErr));
    }
  });
});
