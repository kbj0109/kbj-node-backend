const chalk = require('chalk');
const { testAppHelper } = require('../util');

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('인증/로그아웃'), () => {
  describe(`POST /auth/logout`, () => {
    test(`성공] 로그아웃시 토큰 제거됨`, async () => {
      const loginRes = await request
        .post(`/auth/login`)
        .send({ userId: 'sample', password: 'sample' });

      const response = await request
        .post(`/auth/logout`)
        .set('csrf_token', loginRes.body.csrfToken);

      expect(response.statusCode).toBe(200);

      const cookieHeader = response.headers['set-cookie'].join();
      expect(cookieHeader.includes('access_token=;')).toBe(true);
      expect(cookieHeader.includes('csrf_token=;')).toBe(true);
    });
  });

  describe(`POST /auth/logout/all`, () => {
    test(`성공] 모든 장치 로그아웃시 토큰 제거됨`, async () => {
      const loginRes = await request
        .post(`/auth/login`)
        .send({ userId: 'sample', password: 'sample' });

      const response = await request
        .post(`/auth/logout/all`)
        .set('csrf_token', loginRes.body.csrfToken);

      expect(response.statusCode).toBe(200);

      const cookieHeader = response.headers['set-cookie'].join();
      expect(cookieHeader.includes('access_token=;')).toBe(true);
      expect(cookieHeader.includes('csrf_token=;')).toBe(true);
    });
  });
});
