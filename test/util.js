const supertest = require('supertest');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const app = require('../src/app');
const { FILE_UPLOAD_PATH, IMAGE_UPLOAD_PATH } = require('../src/config');
const { deleteFolders } = require('../src/utils');
const insertDefaultData = require('./insertDefaultData');
const { TEMP_FILE_PATH } = require('./config');
const { db } = require('../src/database/models');
const {
  checkDatabase,
  resetDatabase,
  disconnectDB,
} = require('../src/database');

exports.testAppHelper = {
  init: async () => {
    jest.setTimeout(40000);

    await deleteFolders([FILE_UPLOAD_PATH, IMAGE_UPLOAD_PATH]);
    await resetDatabase();
    await checkDatabase();
    await db.sequelize.sync();
    await insertDefaultData();

    // supertest.agent 사용시 쿠키 유지
    const request = supertest.agent(app);
    return request;
  },
  destroy: async () => {
    await disconnectDB();

    if (fs.existsSync(TEMP_FILE_PATH)) {
      fs.removeSync(TEMP_FILE_PATH);
    }
  },
};

exports.login = async (request, userId, password) => {
  const loginRes = await request.post('/auth/login').send({ userId, password });
  if (loginRes.status !== 200) {
    throw new Error('테스트 로그인 실패 - Invalid Mock User');
  }
  return loginRes;
};

exports.verifyAuth = ({ auth, authLevel, userId, userLevel, writerId }) => {
  let isForbidden = false;
  if (auth === undefined) {
    isForbidden = userLevel < authLevel;
  }
  if (auth && auth.includes('level')) {
    isForbidden = userLevel < authLevel;
  }
  if (auth && auth.includes('writer')) {
    isForbidden = userId !== writerId;
  }
  if (auth && auth.includes('writer') && auth.includes('level')) {
    isForbidden = userId !== writerId && userLevel < authLevel;
  }

  return isForbidden;
};

/** Objecct 배열 Deep Compare  */
exports.isObjectArrayEqual = function (x, y) {
  return _(x).differenceWith(y, _.isEqual).isEmpty();
};

/** 특정 경로에 특정 사이즈의 파일 생성  */
exports.createMockFile = (fileFullPath, fileSize) => {
  return new Promise(resolve => {
    const folderPath = path.dirname(fileFullPath);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fh = fs.openSync(fileFullPath, 'w');
    fs.writeSync(fh, 'ok', Math.max(0, fileSize - 2));
    fs.closeSync(fh);
    resolve(true);
  });
};
