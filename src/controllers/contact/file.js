const FileService = require('../../services/file');
const { FILE_UPLOAD_PATH } = require('../../config');
const fileUpload = require('../../middlewares/fileUpload');
const { wrapAsync, combineMiddleware } = require('../../utils');

/** 문의하기 등록 전 파일 업로드 */
exports.upload = combineMiddleware([
  fileUpload({
    uploadPath: FILE_UPLOAD_PATH,
    fileSizeLimit: 1024 * 1024 * 10,
  }),

  wrapAsync(async (req, res) => {
    const result = await FileService.create({
      data: {
        file: req.file,
        uploadedTime: req.uploadedTime,
        userId: '',
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
