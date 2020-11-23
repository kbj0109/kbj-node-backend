const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/user');
const { getUserObject } = require('../../../src/services/user');

const userProperties = Object.keys(getUserObject(schema));

const mockPost = {
  userId: 'foo',
  password: 'foo',
  passwordConfirm: 'foo',
  name: '홍길동',
  email: 'foo@foo.com',
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

  await Promise.all([
    request
      .post('/admin/users')
      .send({ ...mockPost, userId: mockPost.userId + 1 }),
    request
      .post('/admin/users')
      .send({ ...mockPost, userId: mockPost.userId + 2 }),
    request
      .post('/admin/users')
      .send({ ...mockPost, userId: mockPost.userId + 3 }),
    request
      .post('/admin/users')
      .send({ ...mockPost, userId: mockPost.userId + 4 }),
  ]);
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan(' 관리자/회원목록'), () => {
  let response;

  describe(`GET /admin/users`, () => {
    beforeAll(async () => {
      response = await request.get('/admin/users');
    });

    test(`성공] Status code 200`, async () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('list');
      expect(response.body.list.length).toBeLessThanOrEqual(
        response.body.total,
      );

      response.body.list.forEach(item => {
        userProperties.forEach(prop => {
          expect(item).toHaveProperty(prop);
        });

        expect(item).not.toHaveProperty('password');
        expect(item).not.toHaveProperty('salt');

        expect(item).toHaveProperty('createdAt');
        expect(item).toHaveProperty('updatedAt');
        expect(item).toHaveProperty('deletedAt');

        expect(item).toHaveProperty('role');
      });
    });
  });

  test(`성공] withWithdrawal 옵션이 true일 때 탈퇴회원도 포함됨`, async () => {
    await Promise.all([
      request.delete(`/admin/users/${mockPost.userId + 1}`),
      request.delete(`/admin/users/${mockPost.userId + 2}`),
    ]);
    response = await request
      .get('/admin/users')
      .query({ withWithdrawal: 'true' });

    const hasDeleteUser = response.body.list.some(item => item.deletedAt);
    expect(hasDeleteUser).toBe(true);
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    await login(request, 'sample', 'sample');
    response = await request.get('/admin/users');

    expect(response.statusCode).toBe(403);
  });
});
