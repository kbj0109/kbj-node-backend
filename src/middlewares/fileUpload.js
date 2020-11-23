const createError = require('http-errors');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { getDate } = require('../utils');
const { ERROR_TYPE, IMAGE_UPLOAD_PATH } = require('../config');

module.exports = ({
  uploadPath,
  fileSizeLimit = 1024 * 1024 * 100,
  fileFilter,
}) => (req, res, next) => {
  // 게시판 첨부파일 허용 크기 정의
  const { ATTACH_FILE_SIZE, ATTACH_IMAGE_SIZE } = req.BOARD_SETTING || {};
  const boardFileLimit =
    uploadPath === IMAGE_UPLOAD_PATH ? ATTACH_IMAGE_SIZE : ATTACH_FILE_SIZE;

  const upload = multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        const currentTime = Date.now();
        const folderPath = path.join(uploadPath, getDate(currentTime));
        fs.mkdirs(folderPath).finally(() => cb(null, folderPath)); // 파일 첨부를 위한 경로 유무 확인
        req.uploadedTime = currentTime;
      },
    }),
    limits: {
      fileSize: boardFileLimit || fileSizeLimit,
    },
    fileFilter,
  }).single('file');

  upload(req, res, async uploadErr => {
    if (uploadErr) {
      if (uploadErr.code === ERROR_TYPE.FILE.LIMIT_FILE_SIZE) {
        next(
          createError(400, {
            type: ERROR_TYPE.FILE.LIMIT_FILE_SIZE,
            message: `최대 파일 크기 : ${fileSizeLimit}byte`,
          }),
        );
        return;
      }
      next(createError(400, uploadErr.message));
      return;
    }

    next();
  });
};
