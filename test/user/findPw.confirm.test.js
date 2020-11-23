const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper } = require('../util');
const { db } = require('../../src/database/models');

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('회원/비밀번호 찾기 - 인증번호 확인'), () => {
  describe(`POST /user/find-pw/cert-confirm`, () => {
    const user = MOCK_USERS[0];

    beforeAll(async () => {
      await request.post(`/user/find-pw/cert-num`).send({
        ...user,
        userId: user.id,
      });
    });

    test(`성공] 비밀번호 변경 토큰 리턴`, async () => {
      const { token } = await db.Token.findOne({
        where: { userId: user.id, type: 'FIND_PW' },
      });

      const response = await request.post(`/user/find-pw/cert-confirm`).send({
        userId: user.id,
        token,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test(`실패] 일치하지 않는 인증번호`, async () => {
      const response = await request.post(`/user/find-pw/cert-confirm`).send({
        userId: user.id,
        token: '12345',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
