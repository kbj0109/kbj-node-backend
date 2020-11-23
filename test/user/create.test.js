const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper } = require('../util');
const { schema } = require('../../src/database/models/user');
const { getUserObject } = require('../../src/services/user');

const userProperties = Object.keys(
  getUserObject(schema, { remove: ['createdAt', 'updatedAt', 'deletedAt'] }),
);

const mockPost = {
  name: '홍길동',
  email: 'sample@sample.com',
  phoneNumber: '010-1234-5678',
  address: '서울특별시 서초구',
  address2: '신반포로 320-5',
  zipCode: '06534',
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('회원/등록'), () => {
  const user = MOCK_USERS[0];
  let response;

  describe(`POST /user/join`, () => {
    beforeAll(async () => {
      response = await request.post(`/user/join`).send({
        userId: 'foo',
        password: 'foo',
        passwordConfirm: 'foo',
        ...mockPost,
      });
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
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

  test(`실패] 이미 가입된 중복 아이디 가입 불가`, async () => {
    const response = await request.post('/user/join').send({
      userId: user.id,
      password: user.password,
      passwordConfirm: user.password,
      ...mockPost,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.type).toBe('DUPLICATE');
  });

  test('실패] 일치하지 않는 비밀번호', async () => {
    const response = await request.post('/user/join').send({
      id: 'baz',
      password: 'baz',
      passwordConfirm: 'baz-abc',
      ...mockPost,
    });

    expect(response.statusCode).toBe(400);
  });

  test(`실패] level 정보 포함 가입시 level 저장 불가`, async () => {
    const response = await request.post('/user/join').send({
      ...mockPost,
      userId: 'bar',
      password: 'bar',
      passwordConfirm: 'bar',
      level: 100,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.level).toBeFalsy();
  });

  test(`실패] role 정보 포함 가입시 role 저장 불가`, async () => {
    const response = await request.post('/user/join').send({
      ...mockPost,
      userId: 'bar2',
      password: 'bar2',
      passwordConfirm: 'bar2',
      role: 'ADMIN',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.role).toBeFalsy();
  });
});
