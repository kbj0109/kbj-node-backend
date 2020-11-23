const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper, login } = require('../util');
const { db } = require('../../src/database/models');

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('회원/비밀번호 찾기 - 비밀번호 재설정'), () => {
  describe(`POST /user/find-pw/change`, () => {
    const user = MOCK_USERS[0];

    test(`성공] 변경된 아이디/비밀번호 로그인`, async () => {
      await request.post(`/user/find-pw/cert-num`).send({
        ...user,
        userId: user.id,
      });
      const { token } = await db.Token.findOne({
        where: { userId: user.id, type: 'FIND_PW' },
      });
      const confirmRes = await request.post(`/user/find-pw/cert-confirm`).send({
        userId: user.id,
        token,
      });

      const res1 = await request.post(`/user/find-pw/change`).send({
        userId: user.id,
        newPassword: 'bar',
        newPasswordConfirm: 'abc',
        token: confirmRes.body.token,
      });
      expect(res1.statusCode).toBe(400);

      const res2 = await request.post(`/user/find-pw/change`).send({
        userId: user.id,
        newPassword: 'bar',
        newPasswordConfirm: 'bar',
        token: confirmRes.body.token,
      });
      expect(res2.statusCode).toBe(200);

      const loginRes = await login(request, user.id, 'bar');
      expect(loginRes.statusCode).toBe(200);
    });

    test(`실패] 일치하지 않는 토큰`, async () => {
      const response = await request.post(`/user/find-pw/change`).send({
        userId: user.id,
        newPassword: 'bar',
        newPasswordConfirm: 'bar',
        token: 'abc',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
