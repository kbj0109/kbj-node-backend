const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper, login } = require('../util');
const { schema } = require('../../src/database/models/user');
const { getUserObject } = require('../../src/services/user');

const objProperties = Object.keys(
  getUserObject(schema, { remove: ['createdAt', 'updatedAt', 'deletedAt'] }),
);

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('회원/탈퇴'), () => {
  const user = MOCK_USERS[0];
  let response;

  beforeAll(async () => {
    await login(request, user.id, user.password);

    response = await request
      .delete(`/user/withdrawal`)
      .set('password', user.password);
  });

  describe(`DELETE /user/withdrawal
    (userId: ${user.id})`, () => {
    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      objProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('salt');

      expect(response.body).not.toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('updatedAt');
      expect(response.body).not.toHaveProperty('deletedAt');

      expect(response.body).toHaveProperty('role');
    });

    test(`성공] 탈퇴 후 쿠키에서 토큰 제거됨`, async () => {
      const cookieHeader = response.headers['set-cookie'].join();
      expect(cookieHeader.includes('access_token=;')).toBe(true);
      expect(cookieHeader.includes('csrf_token=;')).toBe(true);
    });
  });
});
