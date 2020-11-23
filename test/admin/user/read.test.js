const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/user');
const { getUserObject } = require('../../../src/services/user');

const userProperties = Object.keys(getUserObject(schema));

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/회원상세'), () => {
  let response;

  describe(`GET /admin/users/{userId}`, () => {
    const userId = 'sample';

    beforeAll(async () => {
      response = await request.get(`/admin/users/${userId}`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      userProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('salt');

      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('deletedAt');

      expect(response.body).toHaveProperty('role');
    });
  });

  test(`실패] 존재하지 않는 회원`, async () => {
    const userId = 'abc';
    response = await request.get(`/admin/users/${userId}`);

    expect(response.statusCode).toBe(404);
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    await login(request, 'sample', 'sample');
    response = await request.get(`/admin/users/sample`);

    expect(response.statusCode).toBe(403);
  });
});
