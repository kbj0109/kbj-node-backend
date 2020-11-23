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

  await request.post('/admin/users').send({
    ...mockPost,
    userId: 'foo',
    password: 'foo',
    passwordConfirm: 'foo',
  });
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/회원수정'), () => {
  let response;

  describe(`PUT /admin/users/{userId}`, () => {
    const userId = 'foo';

    beforeAll(async () => {
      response = await request.put(`/admin/users/${userId}`).send(mockPost);
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
      expect(response.body.deletedAt).toBeNull();
    });
  });

  test('실패] 일치하지 않는 비밀번호', async () => {
    const userId = 'foo';

    const response = await request.put(`/admin/users/${userId}`).send({
      newPassword: 'baz',
      newPasswordConfirm: 'baz-abc',
      ...mockPost,
    });

    expect(response.statusCode).toBe(400);
  });

  test('성공] 새로운 비밀번호 전달시 비밀번호 변경', async () => {
    const userId = 'foo';

    const response = await request.put(`/admin/users/${userId}`).send({
      ...mockPost,
      newPassword: 'bar',
      newPasswordConfirm: 'bar',
    });

    expect(response.statusCode).toBe(200);

    const loginRes = await login(request, 'foo', 'bar');
    expect(loginRes.statusCode).toBe(200);
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    const userId = 'foo';

    await login(request, 'sample', 'sample');
    response = await request.put(`/admin/users/${userId}`).send({
      ...mockPost,
      newPassword: 'baz',
      newPasswordConfirm: 'baz',
    });

    expect(response.statusCode).toBe(403);
  });
});
