const passport = require('passport');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const { combineMiddleware, uuid } = require('../utils');
const passportStrategy = require('../middlewares/passportStrategy');
const { db } = require('../database/models');
const { JWT_SECRET_KEY, ERROR_TYPE } = require('../config');
const { globalCookieOptions } = require('../config/optionConfig');

// passport 초기화
passport.use('local', passportStrategy.localStrategy);
passport.use('jwt-authorize-access', passportStrategy.jwtAuthAccessToken);
passport.use('jwt-renew-access', passportStrategy.jwtRenewToken);

/** 로그인 */
exports.login = combineMiddleware([
  body('userId').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),

  (req, res, next) => {
    // body에 userId 와 password 가 없으면
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    passport.authenticate('local', { session: false }, (authError, user) => {
      try {
        if (authError || !user) {
          throw createError(404, authError);
        }

        req.login(user, { session: false }, async () => {
          try {
            // Refresh 토큰 발행, DB에 저장
            const accessTime = 60 * 60;
            const refreshTime = 60 * 60 * 24 * 14;
            const newRToken = uuid();
            // refresh Token 만료시간 (ms)
            const refreshExpired = new Date().getTime() + refreshTime * 1000;
            const rTokenInDB = await db.Token.create({
              token: newRToken,
              expired: refreshExpired,
              userId: user.userId,
              type: 'REFRESH',
            });
            // CSRF Token 생성
            const csrfToken = uuid();
            // Access Token
            const accessPayload = {
              userIdx: user.idx,
              userId: user.userId,
              rTokenIndex: rTokenInDB.idx,
              level: user.level,
              role: user.role.split(',').filter(Boolean),
            };
            const newAToken = jwt.sign(accessPayload, JWT_SECRET_KEY, {
              algorithm: 'HS256',
              expiresIn: accessTime,
            });

            // set cookie
            res.cookie('access_token', newAToken, {
              ...globalCookieOptions,
              httpOnly: true,
            });
            res.cookie('csrf_token', csrfToken, globalCookieOptions);

            // response
            res.json({
              csrfToken,
              refreshToken: newRToken,
              refreshExpired,
            });
          } catch (err) {
            next(err);
          }
        });
      } catch (err) {
        // remove cookie
        res.clearCookie('csrf_token', globalCookieOptions);
        res.clearCookie('access_token', {
          ...globalCookieOptions,
          httpOnly: true,
        });

        next(err);
      }
    })(req, res);
  },
]);

/** 토큰 갱신 */
exports.renewAccessToken = (req, res, next) => {
  passport.authenticate(
    'jwt-renew-access',
    { session: false },
    async (err, { user, refreshToken }, tokenError) => {
      if (err) {
        next(err);
      }

      try {
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

        if (tokenError) {
          throw createError(400, tokenError);
        }

        // 사용자가 보낸 Refresh Token이 Access Token이 가리키던 Refresh Token 값과 다른 경우
        if (req.header('refresh_token') !== refreshToken.token) {
          throw createError(400, {
            type: ERROR_TYPE.AUTH.INVAILD_TOKEN,
            message: '유효하지 않은 Refresh Token',
          });
        }

        // Refresh Token이 만료된 경우
        const now = new Date().getTime();
        const refreshExpired = new Date(refreshToken.expired).getTime();
        if (now >= refreshExpired) {
          throw createError(401, {
            type: ERROR_TYPE.AUTH.EXPIRED_TOKEN,
            message: 'Refresh Token 만료',
          });
        }

        const resData = {};

        // Access Token, Refresh Token 모두 유효한 경우
        // Refresh Token의 만료시간이 임박한 경우
        // Refresh Token 남은 시간이 Access Token 유효기간보다 적을 때
        const accessTokenPeriod = (user.exp - user.iat) * 1000;
        const needRenewRefreshToken = accessTokenPeriod + now > refreshExpired;

        let newRefreshToken = null;

        // errInvalidToken에 기존의 Refresh Token 정보가 들어온 경우
        // A Token은 만료, Refresh Token은 만료는 아니지만 만료가 다가오기 때문에 Refresh Token 갱신
        if (needRenewRefreshToken) {
          const token = uuid();
          const expired =
            new Date().getTime() + (user.exp - user.iat) * 3 * 1000;

          newRefreshToken = await db.Token.create({
            token,
            expired,
            userId: user.userId,
            type: 'REFRESH',
          });

          // 기존 Refresh Token DB에서 제거
          db.Token.destroy({
            where: {
              idx: refreshToken.idx,
              userId: user.userId,
            },
          });

          resData.refreshToken = token;
          resData.refreshExpired = expired;
        }

        // Access Token + CSRF Token 갱신
        const csrfToken = uuid();
        const newAccessPayload = {
          userIdx: user.userIdx,
          userId: user.userId,
          level: user.level,
          role: user.role,
          rTokenIndex: needRenewRefreshToken
            ? newRefreshToken.idx
            : user.rTokenIndex,
        };
        const originalAccessTime = user.exp - user.iat;
        const accessToken = jwt.sign(newAccessPayload, JWT_SECRET_KEY, {
          algorithm: 'HS256',
          expiresIn: originalAccessTime,
        });

        // 갱신된 Access Token 만료시간
        const accessExpired = new Date().getTime() + originalAccessTime * 1000;

        resData.csrfToken = csrfToken;
        resData.accessExpired = accessExpired;

        // set cookie
        res.cookie('access_token', accessToken, {
          ...globalCookieOptions,
          httpOnly: true,
        });
        res.cookie('csrf_token', csrfToken, globalCookieOptions);

        res.json(resData);
      } catch (err) {
        next(err);
      }
    },
  )(req, res, next);
};

/** 로그아웃 */
exports.logout = async (req, res) => {
  // remove cookie
  res.clearCookie('access_token', {
    ...globalCookieOptions,
    httpOnly: true,
  });
  res.clearCookie('csrf_token', globalCookieOptions);

  try {
    const decodedPayload = jwt.verify(
      req.cookies.access_token,
      JWT_SECRET_KEY,
      // 만료된 토큰도 해석
      { ignoreExpiration: true },
    );
    db.Token.destroy({ where: { idx: decodedPayload.rTokenIndex } });
  } catch (err) {
    console.warn(err);
  }

  res.end();
};

/** 모든 기기 로그아웃 */
exports.logoutAll = async (req, res) => {
  // remove cookie
  res.clearCookie('access_token', {
    ...globalCookieOptions,
    httpOnly: true,
  });
  res.clearCookie('csrf_token', globalCookieOptions);

  try {
    const decodedPayload = jwt.verify(
      req.cookies.access_token,
      JWT_SECRET_KEY,
      // 만료된 토큰도 해석
      { ignoreExpiration: true },
    );

    // 해당 사용자의 모든 Refresh Token 삭제
    db.Token.destroy({
      where: { userId: decodedPayload.userId, type: 'REFRESH' },
    });
  } catch (err) {
    console.warn(err);
  }

  res.end();
};
