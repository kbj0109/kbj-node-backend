const express = require('express');
const { csrfProtection, authCheck } = require('../../middlewares/auth');
const boardSetting = require('./boardSetting');
const article = require('./article');
const comment = require('./comment');
const user = require('./user');
const contact = require('./contact');
const banner = require('./banner');
const popup = require('./popup');

const router = express.Router();

// 관리자 기능으로 들어오는 모든 요청에 인증과 레벨 확인
router.use(csrfProtection, authCheck);

router.use('/board-settings', boardSetting);
router.use('/articles', article);
router.use('/comments', comment);
router.use('/users', user);
router.use('/contact', contact);
router.use('/banners', banner);
router.use('/popups', popup);

module.exports = router;
