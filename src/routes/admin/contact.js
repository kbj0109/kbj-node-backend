const express = require('express');
const admin = require('../../controllers/admin');
const { limitAuth } = require('../../middlewares/auth');

const router = express.Router();

router.get(
  '/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.contact.list,
);
router.get(
  '/:contactId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.contact.read,
);
router.delete(
  '/:contactId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.contact.delete,
);

// 파일 다운
router.get(
  '/file/:fileId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.contact.file.download,
);

// 답변 등록
router.post(
  '/:contactId/reply',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.contact.reply.create,
);

// 답변 목록
router.get(
  '/:contactId/reply',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.contact.reply.list,
);

module.exports = router;
