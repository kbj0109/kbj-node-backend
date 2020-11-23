const chalk = require('chalk');
const { db, mysqlCon: mysqlPool } = require('./models');

// DB 스케줄러 생성 ***** 스케줄 사용을 위해 mysql 환경변수 event_scheduler = on 상태 필요 (SET GLOBAL event_scheduler = ON;)
const scheduleDatabase = () => {
  return new Promise((resolve, reject) => {
    const eventName = 'CLEAR_REFRESH_TOKENS';
    const intervalDay = 1;
    const eventTime = 3; // 3 AM
    const eventQuery =
      'DELETE FROM refresh_tokens where expired < CURRENT_DATE()';

    const scheduleQuery = `CREATE EVENT IF NOT EXISTS ${db.config.database}.${eventName} ON SCHEDULE EVERY ${intervalDay} DAY STARTS (CURRENT_DATE + INTERVAL ${eventTime} HOUR) DO ${eventQuery}`;

    mysqlPool.query(scheduleQuery, err => {
      if (err) {
        console.log(chalk.red('**** Database Scheduler Setting Error - ', err));
        reject(err);
      } else {
        console.log(chalk.yellow(`** Database Scheduler Setting Is Verified`));
        resolve();
      }
    });
  });
};

// DB 제거
exports.resetDatabase = () => {
  return new Promise((resolve, reject) => {
    // 연결하려는 Database가 없다면 생성
    mysqlPool.query(
      `DROP DATABASE IF EXISTS \`${db.config.database}\``,
      err => {
        if (err) {
          console.log(chalk.red('**** Database 리셋 Error - ', err));
          reject(err);
          return;
        }

        if (process.env.NODE_ENV !== 'test') {
          console.log(
            chalk.yellow(`** Database ${db.config.database} Has Been Reset`),
          );
        }
        resolve();
      },
    );
  });
};

// DB 확인/생성
exports.checkDatabase = function checkDatabase() {
  return new Promise((resolve, reject) => {
    // 연결하려는 Database가 없다면 생성
    mysqlPool.query(
      `CREATE DATABASE IF NOT EXISTS \`${db.config.database}\` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci`,
      err => {
        if (err) {
          console.log(chalk.red('**** Database 생성 Error - ', err));
          reject(err);
          return;
        }

        if (process.env.NODE_ENV !== 'test') {
          console.log(
            chalk.yellow(`** Database ${db.config.database} Is Verified`),
          );
        }
        resolve();
      },
    );
  });
};

// DB 연결
exports.connectDB = async () => {
  try {
    await this.checkDatabase();
    await scheduleDatabase();
    await db.sequelize.sync();

    console.log(chalk.yellow(`** Connected to Database ${db.config.database}`));
  } catch (err) {
    console.log(
      chalk.red(`** Failed of Connection to Database ${db.config.database} - `),
      err,
    );
  }
};

exports.disconnectDB = () => {
  return new Promise((resolve, reject) => {
    mysqlPool.end(err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
