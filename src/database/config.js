require('../../env'); // 환경변수 로드

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'mysql',
};

module.exports = config;
