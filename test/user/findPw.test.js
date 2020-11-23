const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper } = require('../util');

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('회원/비밀번호 찾기'), () => {
  describe(`POST /user/find-pw/cert-num`, () => {
    const user = MOCK_USERS[0];

    test(`성공] 일치하는 회원 이메일로 인증번호 전송`, async () => {
      const response = await request.post(`/user/find-pw/cert-num`).send({
        userId: user.id,
        name: user.name,
        email: user.email,
      });

      expect(response.statusCode).toBe(200);
      expect(Date.parse(response.body.tokenExpired)).not.toBeNaN();
    });

    test(`실패] 일치하는 회원 없음`, async () => {
      const response = await request.post(`/user/find-id`).send({
        userId: user.id,
        name: user.name,
        email: 'abc@abc.com',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
