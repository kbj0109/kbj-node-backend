const chalk = require('chalk');
const { testAppHelper } = require('../util');

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('인증/로그인'), () => {
  describe(`POST /auth/login`, () => {
    test(`성공] 로그인시 토큰 발급됨 `, async () => {
      const response = await request
        .post(`/auth/login`)
        .send({ userId: 'sample', password: 'sample' });

      ['csrfToken', 'refreshToken', 'refreshExpired'].forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });

    test(`실패] 아이디&비밀번호 불일치`, async () => {
      const response = await request
        .post(`/auth/login`)
        .send({ userId: 'admin', password: 'sample' });

      expect(response.statusCode).toBe(404);
    });

    test(`실패] 존재하지 않는 회원`, async () => {
      const response = await request
        .post(`/auth/login`)
        .send({ userId: 'foo', password: 'foo' });

      expect(response.statusCode).toBe(404);
    });
  });
});
