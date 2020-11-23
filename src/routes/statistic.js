const express = require('express');
const statistic = require('../controllers/statistic');

const router = express.Router();

router.post('/visit', statistic.visitPage);

module.exports = router;
