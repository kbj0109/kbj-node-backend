const express = require('express');
const admin = require('../../controllers/admin');
const { limitAuth } = require('../../middlewares/auth');

const router = express.Router();

// 목록
router.get(
  '/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.boardSetting.list,
);

// 등록
router.post('/', limitAuth({ admin: true }), admin.boardSetting.create);

// 상세
router.get('/:boardId', limitAuth({ admin: true }), admin.boardSetting.read);

// 수정
router.put('/:boardId', limitAuth({ admin: true }), admin.boardSetting.update);

// 삭제
router.delete(
  '/:boardId',
  limitAuth({ admin: true }),
  admin.boardSetting.delete,
);

module.exports = router;
