const chalk = require('chalk');
const { MOCK_USERS } = require('../../config');
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

describe(chalk.bold.cyan('관리자/회원등록'), () => {
  const user = MOCK_USERS[0];
  let response;

  describe(`POST /admin/users`, () => {
    beforeAll(async () => {
      response = await request.post('/admin/users').send({
        userId: 'foo',
        password: 'foo',
        passwordConfirm: 'foo',
        ...mockPost,
      });
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

      expect(response.body).toHaveProperty('role');
    });

    test(`성공] 회원 아이디와 LEVEL, ROLE이 기록됨`, async () => {
      expect(response.body.userId).toBe('foo');
      expect(response.body.level).toBe(mockPost.level);
      expect(response.body.role).toBe(mockPost.role);
    });
  });

  test(`실패] 이미 가입된 중복 아이디 가입 불가`, async () => {
    response = await request.post('/admin/users').send({
      userId: user.id,
      password: user.password,
      passwordConfirm: user.password,
      ...mockPost,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.type).toBe('DUPLICATE');
  });

  test('실패] 일치하지 않는 비밀번호', async () => {
    const response = await request.post(`/admin/users`).send({
      id: 'baz',
      password: 'baz',
      passwordConfirm: 'baz-abc',
      ...mockPost,
    });

    expect(response.statusCode).toBe(400);
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    await login(request, 'sample', 'sample');
    response = await request.post('/admin/users').send({
      userId: 'baz',
      password: 'baz',
      passwordConfirm: 'baz',
      ...mockPost,
    });

    expect(response.statusCode).toBe(403);
  });
});
