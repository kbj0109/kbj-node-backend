const createError = require('http-errors');
const { query, validationResult } = require('express-validator');
const UserService = require('../../../services/user');
const { wrapAsync, combineMiddleware } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  query('limit')
    .customSanitizer(v => {
      if (Number(v) > 0 === false) {
        return 10;
      }
      return v;
    })
    .toInt(),
  query('offset')
    .customSanitizer(v => {
      if (Number(v) >= 0 === false) {
        return 0;
      }
      return v;
    })
    .toInt(),
  query('sort')
    .optional()
    .isIn([
      'createDesc',
      'createAsc',
      'updateDesc',
      'updateAsc',
      'levelDesc',
      'levelAsc',
      '',
    ]),
  query('search')
    .optional()
    .isIn(['userId', 'level', 'name', 'email', 'phoneNumber', 'role', '']),
  query('withWithdrawal').customSanitizer(v => v !== 'true'),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const result = await UserService.list({
      data: req.query,
      isAdmin: true,
    });

    res.json({
      total: result.count,
      list: result.list.map(item =>
        UserService.getUserObject(item, { isAdmin: true }),
      ),
    });
  }),
]);
