const express = require('express');
const { limitAuth } = require('../../middlewares/auth');
const admin = require('../../controllers/admin');

const router = express.Router();

// 목록
router.get(
  '/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.comment.list,
);

// 삭제 - 관리자 한정의 다중삭제 포함
router.delete(
  '/:commentId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.comment.delete,
);

module.exports = router;
