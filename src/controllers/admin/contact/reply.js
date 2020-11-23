const createError = require('http-errors');
const { body, query, validationResult } = require('express-validator');
const ContactService = require('../../../services/contact');
const ReplyService = require('../../../services/reply');
const MailService = require('../../../services/mail');
const {
  wrapTransaction,
  combineMiddleware,
  templateRender,
  wrapAsync,
} = require('../../../utils');
const { ERROR_TYPE } = require('../../../config');
const { uuid } = require('../../../utils');

/** 등록 */
exports.create = combineMiddleware([
  body('content').isString().trim().notEmpty(),

  wrapTransaction(async (req, res, next, transaction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { content } = req.body;
    const { contactId } = req.params;
    const replyId = uuid();

    const item = await ContactService.getContactInfo({
      data: { id: contactId },
    });
    if (!item) {
      throw createError(404, { type: ERROR_TYPE.COM.NOT_FOUND });
    }

    const result = await ReplyService.create({
      data: {
        id: replyId,
        postId: contactId,
        content,
      },
      user: req.user,
      transaction,
    });

    ContactService.updateCommentCount({
      id: item.id,
      commentIds: replyId,
      addComment: true,
    });

    MailService.sendMail({
      to: item.email,
      subject: `${item.name}님의 문의에 답변이 등록되었습니다..`,
      content: templateRender({
        htmlPath: 'html/mail/admin.contact.reply.html',
        data: {
          name: item.name,
          content: item.content,
          reply: result.content,
        },
      }),
    });

    res.json(ReplyService.getReplyObject(result));
  }),
]);

exports.list = combineMiddleware([
  query('sort').optional().isIn(['createDesc', 'createAsc', '']),

  wrapAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(400, {
        type: ERROR_TYPE.COM.INVALID_INPUT,
        errors: errors.array(),
      });
    }

    const { contactId } = req.params;
    const { sort = 'createDesc' } = req.query;

    const result = await ReplyService.list({
      data: {
        postId: contactId,
        sort,
      },
    });

    res.json(result.list.map(item => ReplyService.getReplyObject(item)));
  }),
]);
