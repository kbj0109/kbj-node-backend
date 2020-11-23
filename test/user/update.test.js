const chalk = require('chalk');
const { testAppHelper, login } = require('../util');
const { schema } = require('../../src/database/models/user');
const { getUserObject } = require('../../src/services/user');

const userProperties = Object.keys(getUserObject(schema));

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
  await login(request, 'admin', 'admin');
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('회원/개인 정보 수정'), () => {
  let response;

  describe(`PUT /user/profile`, () => {
    beforeAll(async () => {
      response = await request.put(`/user/profile`).send({
        ...mockPost,
        password: 'admin',
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

      expect(response.body).not.toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('updatedAt');
      expect(response.body).not.toHaveProperty('deletedAt');
    });
  });

  test('실패] 기존 비밀번호 검증 오류', async () => {
    const response = await request.put(`/user/profile`).send({
      ...mockPost,
      password: 'abc',
    });

    expect(response.statusCode).toBe(400);
  });

  test('실패] 일치하지 않는 비밀번호', async () => {
    const response = await request.put(`/user/profile`).send({
      ...mockPost,
      password: 'admin',
      newPassword: 'bar',
      newPasswordConfirm: 'abc',
    });

    expect(response.statusCode).toBe(400);
  });

  test('성공] 새로운 비밀번호 전달시 비밀번호 변경', async () => {
    const response = await request.put(`/user/profile`).send({
      ...mockPost,
      password: 'admin',
      newPassword: 'bar',
      newPasswordConfirm: 'bar',
    });

    expect(response.statusCode).toBe(200);

    const loginRes = await login(request, 'admin', 'bar');
    expect(loginRes.statusCode).toBe(200);
  });
});
