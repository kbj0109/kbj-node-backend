const chalk = require('chalk');
const deleteUnlinkedFiles = require('./deleteUnlinkedFiles');
const deleteExpiredTokens = require('./deleteExpiredTokens');

exports.startSchedulers = () => {
  if (
    process.env.NODE_APP_INSTANCE === undefined ||
    process.env.NODE_APP_INSTANCE === '0'
  ) {
    deleteUnlinkedFiles.start();
    console.log(chalk.yellow('** 미사용 첨부파일 정리 스케줄러 설정'));

    deleteExpiredTokens.start();
    console.log(chalk.yellow('** 만료 토큰 정리 스케줄러 설정'));
  }
};
