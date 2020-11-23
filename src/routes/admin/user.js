const express = require('express');
const admin = require('../../controllers/admin');
const { limitAuth } = require('../../middlewares/auth');

const router = express.Router();

// 목록
router.get('/', limitAuth({ admin: true }), admin.user.list);

// 등록
router.post('/', limitAuth({ admin: true }), admin.user.create);

// 상세
router.get('/:userId', limitAuth({ admin: true }), admin.user.read);

// 수정
router.put('/:userId', limitAuth({ admin: true }), admin.user.update);

// 삭제
router.delete('/:userId', limitAuth({ admin: true }), admin.user.delete);

module.exports = router;
