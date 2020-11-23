const express = require('express');
const { csrfProtection, authCheck } = require('../middlewares/auth');
const user = require('../controllers/user');
const auth = require('../controllers/auth');

const router = express.Router();

// 가입 아이디 유효성 검사
router.get('/checkId/:userId', user.checkDuplicate);

// 새로운 회원 가입
router.post('/join', user.create);

// 회원 상세
router.get('/profile', csrfProtection, authCheck, user.read);

// 회원 수정
router.put('/profile', csrfProtection, authCheck, user.update);

// 회원 탈퇴
router.delete(
  '/withdrawal',
  csrfProtection,
  authCheck,
  user.delete,
  auth.logoutAll,
);

/** 아이디 찾기 */
router.post('/find-id', user.findId);

/** 비밀번호 찾기 - 인증번호 요청 (인증번호 이메일 전송) */
router.post('/find-pw/cert-num', user.findPw);

/** 비밀번호 찾기 - 인증번호 확인 후, 비밀번호 변경 토큰 생성 */
router.post('/find-pw/cert-confirm', user.findPwConfirm);

/** 비밀번호 찾기 - 비밀번호 변경 토큰 확인 후 비밀번호 변경 */
router.post('/find-pw/change', user.changePw);

module.exports = router;
