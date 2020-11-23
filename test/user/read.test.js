const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper, login } = require('../util');
const { schema } = require('../../src/database/models/user');
const { getUserObject } = require('../../src/services/user');

const userProperties = Object.keys(
  getUserObject(schema, { remove: ['createdAt', 'updatedAt', 'deletedAt'] }),
);

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('회원/개인 정보 가져오기'), () => {
  const user = MOCK_USERS[0];
  let response;

  beforeAll(async () => {
    await login(request, user.id, user.password);
    response = await request.get(`/user/profile`);
  });

  describe(`GET /user/profile
      (userId: ${user.id})`, () => {
    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      userProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('salt');

      expect(response.body).not.toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('updatedAt');
      expect(response.body).not.toHaveProperty('deletedAt');

      expect(response.body).toHaveProperty('role');
    });
  });
});
