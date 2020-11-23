const chalk = require('chalk');
const { CronJob } = require('cron');
const fs = require('fs-extra');
const path = require('path');
const { Op } = require('sequelize');
const { db } = require('../database/models');
const { FILE_UPLOAD_PATH } = require('../config');
const { getDate } = require('../utils');
const { SERVER_TZ } = require('../config');

/** 24시간 동안 연결되지 않은 첨부파일 제거 */
const task = async () => {
  console.log(chalk.yellow(`미사용 첨부파일 정리 스케줄러 시작`));

  try {
    const period = 24 * 60 * 60 * 1000;
    const fileList = await db.File.findAll({
      attributes: ['idx', 'id', 'createdAt'],
      where: {
        postId: '',
        created_at: { [Op.lt]: new Date(Date.now() - period) },
      },
    });

    await db.File.destroy({
      where: { idx: fileList.map(file => file.idx) },
    });

    fileList.forEach(item => {
      const date = getDate(item.createdAt.getTime());
      const filePath = path.join(FILE_UPLOAD_PATH, date, item.id);

      fs.remove(filePath, err => {
        if (err) {
          console.log(chalk.red(`${filePath} 파일 제거 실패 - ${err}`));
        } else {
          console.log(chalk.yellow(`${filePath} 파일 제거 완료`));
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const deleteUnlinkedFiles = new CronJob(
  '0 0 9 * * *',
  task,
  null,
  false,
  SERVER_TZ,
);

module.exports = deleteUnlinkedFiles;
