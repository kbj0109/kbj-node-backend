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

describe(chalk.bold.cyan('회원/아이디 찾기'), () => {
  describe(`POST /user/find-id`, () => {
    const user = MOCK_USERS[0];

    test(`성공] name, email 과 일치하는 회원 아이디 리턴`, async () => {
      const response = await request.post(`/user/find-id`).send({
        name: user.name,
        email: user.email,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.userId).toBe(user.id);
    });

    test(`실패] name, email 과 일치하는 회원 없음`, async () => {
      const response = await request.post(`/user/find-id`).send({
        name: user.name,
        email: 'abc@abc.com',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
