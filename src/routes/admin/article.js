const express = require('express');
const { limitAuth } = require('../../middlewares/auth');
const withBoardSetting = require('../../middlewares/withBoardSetting');
const admin = require('../../controllers/admin');

const router = express.Router();

// 목록 - 태그
router.get(
  '/:boardType/tags',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'READ_LIST' }),
  admin.article.tag.list,
);

// 목록
router.get(
  '/:boardType',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'READ_LIST' }),
  admin.article.list,
);

// 등록
router.post(
  '/:boardType',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'CREATE' }),
  admin.article.create,
);

// 상세
router.get(
  '/:boardType/:articleId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'READ' }),
  admin.article.read,
);

// 수정
router.put(
  '/:boardType/:articleId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'UPDATE' }),
  admin.article.update,
);

// 삭제 - 관리자 한정의 다중삭제 포함
router.delete(
  '/:boardType/:articleId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'DELETE' }),
  admin.article.delete,
);

// 첨부파일 업로드
router.post(
  '/:boardType/file',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'FILE_CREATE' }),
  admin.article.file.upload,
);

// 첨부파일 다운로드
router.get(
  '/:boardType/file/:fileId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'FILE_READ' }),
  admin.article.file.download,
);

// 이미지 업로드
router.post(
  '/:boardType/img',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'FILE_CREATE' }),
  admin.article.file.imageUpload,
);

// 이미지 다운로드
router.get(
  '/:boardType/img/:imgId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'FILE_READ' }),
  admin.article.file.imageDownload,
);

// 댓글 목록
router.get(
  '/:boardType/:articleId/comments',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'COMMENT_READ_LIST' }),
  admin.article.comment.list,
);

// 댓글 등록
router.post(
  '/:boardType/:articleId/comments',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'COMMENT_CREATE' }),
  admin.article.comment.create,
);

// 댓글 삭제
router.delete(
  '/:boardType/comments/:commentId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'COMMENT_DELETE' }),
  admin.article.comment.delete,
);

// 게시물 추천
router.post(
  '/:boardType/:articleId/like',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'LIKE' }),
  admin.article.like.article,
);

// 댓글 추천
router.post(
  '/:boardType/comments/:commentId/like',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  withBoardSetting({ boardAction: 'COMMENT_LIKE' }),
  admin.article.like.comment,
);

module.exports = router;
