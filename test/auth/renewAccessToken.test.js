const chalk = require('chalk');
const cookie = require('set-cookie-parser');
const { testAppHelper, login } = require('../util');
const { ERROR_TYPE } = require('../../src/config');
const { db } = require('../../src/database/models');

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('인증/토큰 갱신'), () => {
  describe(`POST /auth/renew`, () => {
    test(`성공]  CSRF & Access 토큰이 새로 발급됨`, async () => {
      const loginRes = await login(request, 'sample', 'sample');
      const orgCookies = cookie.parse(loginRes);
      const orgAccToken = orgCookies.find(item => item.name === 'access_token');
      const orgCsrfToken = orgCookies.find(item => item.name === 'csrf_token');

      const renewRes = await request
        .post(`/auth/renew`)
        .set('csrf_token', loginRes.body.csrfToken)
        .set('refresh_token', loginRes.body.refreshToken);

      const newCookies = cookie.parse(renewRes);
      const newAccToken = newCookies.find(item => item.name === 'access_token');
      const newCsrfToken = newCookies.find(item => item.name === 'csrf_token');

      expect(renewRes.statusCode).toBe(200);
      expect(renewRes.body).toHaveProperty('csrfToken');
      expect(renewRes.body).toHaveProperty('accessExpired');

      expect(orgAccToken.value).not.toBe(newAccToken.value);
      expect(orgCsrfToken.value).not.toBe(newCsrfToken.value);
    });

    test(`실패] 유효하지 않은 Refresh 토큰`, async () => {
      const loginRes = await login(request, 'sample', 'sample');
      const renewRes = await request
        .post(`/auth/renew`)
        .set('csrf_token', loginRes.body.csrfToken)
        .set('refresh_token', 'abc');

      expect(renewRes.statusCode).toBe(400);
      expect(renewRes.body.type).toBe(ERROR_TYPE.AUTH.INVAILD_TOKEN);
    });

    test(`실패] 만료된 Refresh 토큰`, async () => {
      const loginRes = await login(request, 'sample', 'sample');

      // Refresh Token 정보 강제 수정
      const date = new Date();
      date.setHours(date.getHours() - 1);
      await db.Token.update({ expired: date }, { where: {} });

      const renewRes = await request
        .post(`/auth/renew`)
        .set('csrf_token', loginRes.body.csrfToken)
        .set('refresh_token', loginRes.body.refreshToken);

      expect(renewRes.statusCode).toBe(401);
      expect(renewRes.body.type).toBe(ERROR_TYPE.AUTH.EXPIRED_TOKEN);
    });

    test(`성공] 만료 직전 Refresh 토큰으로 갱신시 Refresh 토큰도 갱신됨`, async () => {
      const loginRes = await login(request, 'sample', 'sample');

      // Refresh Token 정보 강제 수정
      const date = new Date();
      date.setMinutes(date.getMinutes() + 1);
      await db.Token.update({ expired: date }, { where: {} });

      const renewRes = await request
        .post(`/auth/renew`)
        .set('csrf_token', loginRes.body.csrfToken)
        .set('refresh_token', loginRes.body.refreshToken);

      expect(renewRes.statusCode).toBe(200);
      expect(renewRes.body).toHaveProperty('csrfToken');
      expect(renewRes.body).toHaveProperty('accessExpired');
      expect(renewRes.body).toHaveProperty('refreshToken');
      expect(renewRes.body).toHaveProperty('refreshExpired');

      expect(renewRes.body.refreshToken).not.toBe(loginRes.body.refreshToken);
      expect(renewRes.body.refreshExpired).not.toBe(
        loginRes.body.refreshExpired,
      );
    });
  });
});
