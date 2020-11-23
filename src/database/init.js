require('../../env'); // 환경변수 로드
const { connectDB, disconnectDB } = require('.');

const initDB = async () => {
  try {
    console.log('DB 초기화');
    await connectDB();
    await disconnectDB();
  } catch (e) {
    console.log('DB 초기화 실패', e);
  }
};

initDB();
