const chalk = require('chalk');
const { CronJob } = require('cron');
const { Op } = require('sequelize');
const { db } = require('../database/models');
const { SERVER_TZ } = require('../config');

/** 만료된 토큰 제거 */
const task = async () => {
  console.log(chalk.yellow(`만료 토큰 정리 스케줄러 시작`));

  try {
    await db.Token.destroy({ where: { expired: { [Op.lt]: new Date() } } });
  } catch (err) {
    console.log(err);
  }
};

const deleteExpiredTokens = new CronJob(
  '0 30 9 * * *',
  task,
  null,
  false,
  SERVER_TZ,
);

module.exports = deleteExpiredTokens;
