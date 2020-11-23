const express = require('express');
const { csrfProtection } = require('../middlewares/auth');
const auth = require('../controllers/auth');

const router = express.Router();

// 로그인
router.post('/login', auth.login);

// 토큰 갱신
router.post('/renew', csrfProtection, auth.renewAccessToken);

// 로그아웃
router.post('/logout', csrfProtection, auth.logout);

// 모든 기기 로그아웃
router.post('/logout/all', csrfProtection, auth.logoutAll);

module.exports = router;
