const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const parser = require('ua-parser-js');
const ContactService = require('../../services/contact');
const { wrapTransaction, combineMiddleware } = require('../../utils');
const { ERROR_TYPE } = require('../../config');
const { uuid } = require('../../utils');

module.exports = combineMiddleware([
  body('subject').isString().trim().notEmpty(),
  body('content').isString().trim().notEmpty(),
  body('name').isString().trim().notEmpty(),
  body('email').trim().isEmail(),
  body('phoneNumber').optional().isString(),
  body('attachFiles').optional().isArray(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const result = await ContactService.create({
      data: {
        ...req.body,
        id: uuid(),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        device: parser(req.headers['user-agent']).device.type,
      },
      user: req.user,
      transaction,
    });

    res.json(ContactService.getContactObject(result));
  }),
]);
