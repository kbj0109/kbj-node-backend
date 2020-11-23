const express = require('express');
const morgan = require('morgan'); // 로그를 기록 미들웨어
const helmet = require('helmet'); // 보안 향상을 위한 미들웨어
const hpp = require('hpp'); // 보안 향상을 위한 미들웨어
const cookieParser = require('cookie-parser'); // 쿠키 정보를 저장/추출, 그리고 암호화 등을 할 수 있는 미들웨어
const cors = require('cors');
const initRouter = require('./routes');

const app = express();

// 미들웨어
app.use(morgan('dev')); // 로그 기록
app.use(helmet()); // 보안 강화 (Header 설정) - 추가 설정 예정
app.use(hpp()); // 보안 강화 - 전달되는 데이터형 검증
app.use(
  express.json({
    limit: '100mb',
  }),
);
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser()); // 쿠키 암호화 없이
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? (process.env.CORS_DOMAINS || '').split(',')
        : (origin, callback) => {
            callback(null, true); // 모두 허용
          },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// 라우터 초기화
initRouter(app);

// Exception 에러 핸들링
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isDev = req.app.get('env') === 'development';
  if (isDev) {
    console.log(err);
  }

  res.status(err.status || 500).json({
    status: err.status || 500,
    type: err.type,
    stack: isDev ? err.stack : '',
    message: isDev ? err.message : 'Internal Server Error',
    errors: err.errors,
  });
});

module.exports = app;
