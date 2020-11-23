const passport = require('passport');
const createError = require('http-errors');
const _ = require('lodash');
const { ERROR_TYPE } = require('../config');

// 게시판 설정에서 인증 미들웨어 로직 적용여부 확인
const checkAuthSkip = req => {
  // 게시판 설정을 사용하는 경우
  const existBoardSetting = req.BOARD_SETTING && req.BOARD_ACTION;

  if (existBoardSetting) {
    const boardAuth = req.BOARD_SETTING[`${req.BOARD_ACTION}_AUTH`];
    const hasToken = Boolean(req.cookies.access_token);

    // 회원 인증을 사용하지 않는 설정인 경우
    if (
      boardAuth.includes('level') === false &&
      boardAuth.includes('writer') === false
    ) {
      return true;
    }

    // 작성자 인증을 사용하는 설정이지만 비회원 접속인 경우
    if (boardAuth.includes('writer') === true && hasToken === false) {
      return true;
    }
  }
  return false;
};

// csrf 체크
exports.csrfProtection = (req, res, next) => {
  // 게시판 설정 확인하여 Skip
  if (checkAuthSkip(req)) {
    next();
    return;
  }

  // csrf 체크 조건
  const useCsrfBlock =
    // API 문서에서의 요청이 아니고
    req.headers.referer &&
    req.headers.referer.indexOf('/docs') < 0 &&
    // production env 이면
    process.env.NODE_ENV === 'production';

  // csrf_token이 헤더에 있는지 && 쿠키와 헤더의 csrf_token이 일치하는지
  const isCsrfBlocked =
    !req.header('csrf_token') ||
    req.header('csrf_token') !== req.cookies.csrf_token;

  if (useCsrfBlock && isCsrfBlocked) {
    next(
      createError(400, {
        type: ERROR_TYPE.AUTH.CSRF_ERROR,
        message: 'CSRF Token 검증 실패',
      }),
    );
    return;
  }

  next();
};

// 인증 미들웨어
exports.authCheck = (req, res, next) => {
  passport.authenticate(
    'jwt-authorize-access',
    { session: false },
    (err, user, tokenError) => {
      try {
        if (err) {
          throw createError(400, { type: ERROR_TYPE.COM.UNEXPECTED });
        }

        if (tokenError && tokenError.message === 'No auth token') {
          throw createError(400, {
            type: ERROR_TYPE.AUTH.NOT_EXIST_TOKEN,
            message: 'Access Token 없음',
          });
        }

        if (tokenError && tokenError.name === 'JsonWebTokenError') {
          throw createError(400, {
            type: ERROR_TYPE.AUTH.INVAILD_TOKEN,
            message: '유효하지 않은 Access Token',
          });
        }

        if (tokenError && tokenError.name === 'TokenExpiredError') {
          throw createError(401, {
            type: ERROR_TYPE.AUTH.EXPIRED_TOKEN,
            message: '만료된 Access Token',
          });
        }

        if (tokenError) {
          throw createError(400, tokenError);
        }

        // req.user로 사용자 정보 전달
        req.user = user;
        req.isAdmin = user && user.level >= 100;

        next();
      } catch (err) {
        // 게시판 설정 확인하여 Skip
        if (checkAuthSkip(req)) {
          next();
        } else {
          next(err);
        }
      }
    },
  )(req, res, next);
};

/** 회원 레벨 검증 미들웨어 */
exports.limitAuth = ({ admin, level, role = [] }) => (req, res, next) => {
  const check = {
    admin: admin ? req.isAdmin : undefined,
    level: level !== undefined ? req.user.level >= level : undefined,
    role:
      role.length > 0
        ? _.intersection(role, req.user.role).length > 0
        : undefined,
  };

  const isForbidden =
    // 요구하는 권한이 있는데
    Object.keys(check).filter(key => check[key] !== undefined).length > 0 &&
    // 충족되는 권한이 없으면
    Object.keys(check).filter(key => check[key] === true).length === 0;

  if (isForbidden) {
    throw createError(403, { type: ERROR_TYPE.COM.FORBIDDEN });
  }

  next();
};
