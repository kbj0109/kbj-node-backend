const JWTStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const { db } = require('../database/models');
const { JWT_SECRET_KEY, ERROR_TYPE } = require('../config');

/** local login */
exports.localStrategy = new LocalStrategy(
  { usernameField: 'userId', passwordField: 'password' },
  async (userId, password, callback) => {
    try {
      const user = await db.User.findOne({ where: { userId } });

      if (!user)
        return callback(
          {
            type: ERROR_TYPE.COM.NOT_FOUND,
            message: '존재하지 않는 회원',
          },
          null,
        );

      // Salt와 Hash 조합해서 비밀번호 확인
      const passwordMatch = await bcryptjs.compare(
        password,
        `${user.salt}${user.password}`,
      );
      if (passwordMatch) {
        return callback(null, user);
      }
      return callback(
        {
          type: ERROR_TYPE.AUTH.WRONG_PASSWORD,
          message: '잘못된 비밀번호',
        },
        null,
      );
    } catch (err) {
      return callback(err, null);
    }
  },
);

/** Access Token 검증 */
exports.jwtAuthAccessToken = new JWTStrategy(
  {
    jwtFromRequest: req => req.cookies.access_token,
    secretOrKey: JWT_SECRET_KEY,
  },
  (jwtPayload, callback) => {
    callback(null, jwtPayload);
  },
);

/** 토큰 갱신에 필요한 검증 */
exports.jwtRenewToken = new JWTStrategy(
  {
    jwtFromRequest: req => req.cookies.access_token,
    secretOrKey: JWT_SECRET_KEY,
    ignoreExpiration: true,
    passReqToCallback: true,
  },
  async (req, jwtPayload, callback) => {
    try {
      // Access Token에 들어있는 Refresh Token 정보로 DB에서 Refresh Token을 가져온다
      const refreshToken = await db.Token.findOne({
        where: { idx: jwtPayload.rTokenIndex },
      });

      callback(null, {
        user: jwtPayload,
        refreshToken,
      });
    } catch (err) {
      callback(err, null);
    }
  },
);
