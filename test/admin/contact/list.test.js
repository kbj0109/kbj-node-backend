const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/contact');
const { getContactObject } = require('../../../src/services/contact');

const contactProperties = Object.keys(getContactObject(schema));

const mockPost = {
  subject: '제목',
  content: '내용',
  attachFiles: [],
  name: 'guest',
  email: 'sample@sample.com',
  phoneNumber: '010-1234-5678',
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();

  await Promise.all([request.post(`/contact`).send(mockPost)]);
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/문의 목록'), () => {
  let response;

  beforeAll(async () => {
    await login(request, 'admin', 'admin');

    response = await request.get(`/admin/contact`);
  });

  describe(`GET /admin/contact`, () => {
    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      response.body.list.forEach(board => {
        contactProperties.forEach(prop => {
          expect(board).toHaveProperty(prop);
        });
      });
    });
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    await login(request, 'sample', 'sample');
    const getRes = await request.get(`/admin/contact`);

    expect(getRes.statusCode).toBe(403);
  });

  test(`실패] 비회원 권한 부족`, async () => {
    await request.post(`/auth/logout`);
    const getRes = await request.get(`/admin/contact`);

    expect(getRes.statusCode).toBe(400);
  });
});
