const createError = require('http-errors');
const { param } = require('express-validator');
const ContactService = require('../../../services/contact');
const { combineMiddleware } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');
const { wrapTransaction } = require('../../../utils');

module.exports = combineMiddleware([
  param('contactId').customSanitizer(ids => {
    return ids.split(',').filter(Boolean);
  }),

  wrapTransaction(async (req, res, next, transaction) => {
    const { contactId } = req.params;
    const deleter = req.user.userId;
    const deletedAt = new Date();

    const items = await ContactService.getContactInfo({
      data: { id: contactId },
      transaction,
    });
    if (items.length !== contactId.length) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    await ContactService.delete({
      data: { ids: contactId, deleter, deletedAt },
      transaction,
    });

    res.json(
      items.map(item =>
        ContactService.getContactObject(item, { set: { deleter, deletedAt } }),
      ),
    );
  }),
]);
