const chalk = require('chalk');
const { testAppHelper } = require('../util');

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('회원/아이디 중복 검증'), () => {
  describe(`GET /user/checkId`, () => {
    test(`성공] 가입되지 않은 회원 아이디`, async () => {
      const userId = 'foo';
      const response = await request.get(`/user/checkId/${userId}`);

      expect(response.statusCode).toBe(200);
    });

    test(`실패] 이미 가입된 회원 아이디`, async () => {
      const userId = 'admin';
      const response = await request.get(`/user/checkId/${userId}`);

      expect(response.statusCode).toBe(400);
    });
  });
});
