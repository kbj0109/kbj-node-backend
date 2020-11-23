const createError = require('http-errors');
const bcryptjs = require('bcryptjs');
const { db } = require('../database/models');
const { wrapAsync } = require('../utils');
const { ERROR_TYPE } = require('../config');

const withBoardSetting = ({ boardAction = '' }) =>
  wrapAsync(async (req, res, next) => {
    const { boardType } = req.params;

    const item = await db.BoardSetting.findOne({
      where: { type: boardType },
    });
    if (!item) {
      throw createError(404, {
        type: ERROR_TYPE.COM.NOT_FOUND,
        message: '게시판을 찾을 수 없음',
      });
    }

    const boardSetting = item.get({ plain: true });

    req.BOARD_SETTING = Object.keys(boardSetting).reduce((setting, key) => {
      setting[key.replace(/([A-Z])/g, '_$1').toUpperCase()] = boardSetting[key];
      return setting;
    }, {});

    req.BOARD_ACTION = boardAction.toUpperCase();

    req.BOARD_SETTING.verifyAuth = ({ writer = {} } = {}) => {
      const AUTH = req.BOARD_SETTING[`${req.BOARD_ACTION}_AUTH`];
      const LEVEL = req.BOARD_SETTING[`${req.BOARD_ACTION}_LEVEL`];
      const ROLE = req.BOARD_SETTING[`${req.BOARD_ACTION}_ROLE`]
        .split(',')
        .filter(Boolean);
      const hasLevel = AUTH.includes('level');
      const hasRole = AUTH.includes('role');
      const hasWriter = AUTH.includes('writer');

      const authErrors = [
        {
          auth: 'level',
          isError: hasLevel && req.user && req.user.level < LEVEL,
        },
        {
          auth: 'role',
          isError: (() => {
            if (hasRole && ROLE.length > 0) {
              const userRole = (req.user && req.user.role) || [];
              if (ROLE.some(value => userRole.includes(value)) === false) {
                return true;
              }
            }
            return false;
          })(),
        },
        {
          auth: 'writer',
          isError: (() => {
            if (hasWriter) {
              const {
                ownerId = '', // Article 등의 등록자 userId
                ownerPassword = '', // Article 패스워드
                password = '', // 사용자 입력 패스워드
                usePasswordAuth = true,
              } = writer;

              // 회원 ID와 소유자 ID로 인증
              if (req.user && req.user.userId === ownerId) {
                return false;
              }

              // 비회원 기능일 경우 비밀번호로 검증
              const verifiedPassword =
                ownerPassword.length && password.length
                  ? bcryptjs.compareSync(password, ownerPassword)
                  : false;

              // 비밀번호 인증
              return usePasswordAuth ? verifiedPassword === false : true;
            }

            return false;
          })(),
        },
      ];

      // 액션에 정의된 권한 기준만 사용
      const matchErrors = authErrors.filter(({ auth }) => AUTH.includes(auth));
      // 권한 기준 통과된 항목이 있으면
      const isPassed =
        matchErrors.filter(({ isError }) => isError === false).length === 0;
      const isError = matchErrors.length > 0 && isPassed;

      return { isError };
    };

    next();
  });

module.exports = withBoardSetting;
