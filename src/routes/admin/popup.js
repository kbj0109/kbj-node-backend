const express = require('express');
const admin = require('../../controllers/admin');
const { limitAuth } = require('../../middlewares/auth');

const router = express.Router();

// 목록
router.get(
  '/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.popup.list,
);

// 등록
router.post(
  '/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.popup.create,
);

// 상세
router.get(
  '/:popupId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.popup.read,
);

// 수정
router.put(
  '/:popupId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.popup.update,
);

// 삭제
router.delete(
  '/:popupId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.popup.delete,
);

// 이미지 첨부
router.post(
  '/img',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.popup.file.imageUpload,
);

// 이미지 다운로드
router.get(
  '/img/:imgId/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.popup.file.imageDownload,
);

module.exports = router;
