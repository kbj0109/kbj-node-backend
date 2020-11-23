require('./env'); // 환경변수 로드

const chalk = require('chalk');
const ip = require('ip');
const { connectDB } = require('./src/database');
const insertDefaultData = require('./src/database/models/insertDefaultData');
const app = require('./src/app');
const { startSchedulers } = require('./src/scheduler'); // 스케줄러 설정

const port = process.env.PORT || 6100;

// 서버 Open
const startServer = async () => {
  try {
    // DB 연결
    await connectDB();

    // 스케줄러 설정
    startSchedulers();

    // 초기 데이터 설정
    await insertDefaultData();

    app.listen(port, () => {
      console.log(
        chalk.green.bold(
          `*** Server is Ready with http://localhost:${port} | http://${ip.address()}:${port}`,
        ),
      );
    });
  } catch (e) {
    console.log(chalk.red.bold('DB 연결 실패', e));
  }
};

startServer();
