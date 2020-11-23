const express = require('express');
const { csrfProtection, authCheck } = require('../middlewares/auth');
const withBoardSetting = require('../middlewares/withBoardSetting');
const article = require('../controllers/article');

const router = express.Router();

// 목록 - 태그
router.get(
  '/:boardType/tags',
  withBoardSetting({ boardAction: 'READ_LIST' }),
  csrfProtection,
  authCheck,
  article.tag.list,
);

// 목록
router.get(
  '/:boardType',
  withBoardSetting({ boardAction: 'READ_LIST' }),
  csrfProtection,
  authCheck,
  article.list,
);

// 등록
router.post(
  '/:boardType',
  withBoardSetting({ boardAction: 'CREATE' }),
  csrfProtection,
  authCheck,
  article.create,
);

// 상세
router.get(
  '/:boardType/:articleId',
  withBoardSetting({ boardAction: 'READ' }),
  csrfProtection,
  authCheck,
  article.read,
);

// 수정
router.put(
  '/:boardType/:articleId',
  withBoardSetting({ boardAction: 'UPDATE' }),
  csrfProtection,
  authCheck,
  article.update,
);

// 삭제
router.delete(
  '/:boardType/:articleId',
  withBoardSetting({ boardAction: 'DELETE' }),
  csrfProtection,
  authCheck,
  article.delete,
);

// 첨부파일 업로드
router.post(
  '/:boardType/file',
  withBoardSetting({ boardAction: 'FILE_CREATE' }),
  csrfProtection,
  authCheck,
  article.file.upload,
);

// 첨부파일 다운로드
router.get(
  '/:boardType/file/:fileId',
  withBoardSetting({ boardAction: 'FILE_READ' }),
  authCheck,
  article.file.download,
);

// 본문 이미지 업로드
router.post(
  '/:boardType/img',
  withBoardSetting({ boardAction: 'FILE_CREATE' }),
  csrfProtection,
  authCheck,
  article.file.imageUpload,
);

// 본문 이미지 다운로드
router.get(
  '/:boardType/img/:imgId',
  withBoardSetting({ boardAction: 'FILE_READ' }),
  authCheck,
  article.file.imageDownload,
);

// 댓글 목록
router.get(
  '/:boardType/:articleId/comments',
  withBoardSetting({ boardAction: 'COMMENT_READ_LIST' }),
  csrfProtection,
  authCheck,
  article.comment.list,
);

// 댓글 등록
router.post(
  '/:boardType/:articleId/comments',
  withBoardSetting({ boardAction: 'COMMENT_CREATE' }),
  csrfProtection,
  authCheck,
  article.comment.create,
);

// 댓글 삭제
router.delete(
  '/:boardType/comments/:commentId',
  withBoardSetting({ boardAction: 'COMMENT_DELETE' }),
  csrfProtection,
  authCheck,
  article.comment.delete,
);

// 게시물 추천
router.post(
  '/:boardType/:articleId/like',
  withBoardSetting({ boardAction: 'LIKE' }),
  csrfProtection,
  authCheck,
  article.like.article,
);

// 댓글 추천
router.post(
  '/:boardType/comments/:commentId/like',
  withBoardSetting({ boardAction: 'COMMENT_LIKE' }),
  csrfProtection,
  authCheck,
  article.like.comment,
);

module.exports = router;
