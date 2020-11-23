const express = require('express');
const file = require('../controllers/file');

const router = express.Router();

router.get('/:fileId', file.download);

module.exports = router;
