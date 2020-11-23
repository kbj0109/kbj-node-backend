const express = require('express');
const contact = require('../controllers/contact');

const router = express.Router();

// 등록
router.post('/', contact.create);

// 파일 등록
router.post('/file', contact.file.upload);

module.exports = router;
