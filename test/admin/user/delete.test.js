const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/user');
const { getUserObject } = require('../../../src/services/user');

const userProperties = Object.keys(getUserObject(schema));

const mockPost = {
  name: '홍길동',
  email: 'sample@sample.com',
  phoneNumber: '010-1234-5678',
  address: '서울특별시 서초구',
  address2: '신반포로 320-5',
  zipCode: '06534',
  level: 0,
  role: '',
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/회원탈퇴'), () => {
  let response;

  describe(`POST /admin/users/{userId}`, () => {
    const userId = 'sample';

    beforeAll(async () => {
      response = await request.delete(`/admin/users/${userId}`);
    });

    test(`성공] Status code 200`, async () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
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

  test(`실패] 자기 자신 탈퇴 불가`, async () => {
    response = await request.delete(`/admin/users/admin`);

    expect(response.statusCode).toBe(400);
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    const userId = 'foo';
    const password = 'foo';

    await request.post('/admin/users').send({
      ...mockPost,
      userId,
      password,
      passwordConfirm: password,
    });

    await login(request, userId, password);
    response = await request.delete(`/admin/users/${userId}`);

    expect(response.statusCode).toBe(403);
  });
});
