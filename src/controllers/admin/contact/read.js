const createError = require('http-errors');
const ContactService = require('../../../services/contact');
const { combineMiddleware, wrapAsync } = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');

module.exports = combineMiddleware([
  wrapAsync(async (req, res) => {
    const result = await ContactService.getContactInfo({
      data: { id: req.params.contactId },
    });
    if (!result) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    res.json(ContactService.getContactObject(result));
  }),
]);
