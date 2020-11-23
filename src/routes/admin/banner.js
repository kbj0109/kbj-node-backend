const express = require('express');
const admin = require('../../controllers/admin');
const { limitAuth } = require('../../middlewares/auth');

const router = express.Router();

// 목록
router.get(
  '/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.banner.list,
);

// 등록
router.post(
  '/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.banner.create,
);

// 상세
router.get(
  '/:bannerId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.banner.read,
);

// 수정
router.put(
  '/:bannerId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.banner.update,
);

// 삭제
router.delete(
  '/:bannerId',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.banner.delete,
);

// 이미지 첨부
router.post(
  '/img',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.banner.file.imageUpload,
);

// 이미지 다운로드
router.get(
  '/img/:imgId/',
  limitAuth({ admin: true, role: ['SUB_ADMIN'] }),
  admin.banner.file.imageDownload,
);

module.exports = router;
