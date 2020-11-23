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
const mockContact = {};

beforeAll(async () => {
  request = await testAppHelper.init();

  const postRes = await request.post(`/contact`).send(mockPost);
  mockContact.id = postRes.body.id;
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/문의 상세'), () => {
  describe(`GET /admin/contact/{contactId}`, () => {
    let response;

    beforeAll(async () => {
      await login(request, 'admin', 'admin');

      response = await request.get(`/admin/contact/${mockContact.id}`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      contactProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });
  });

  test(`실패] 비회원 권한 부족 `, async () => {
    await request.post(`/auth/logout`);
    const response = await request.get(`/admin/contact/${mockContact.id}`);

    expect(response.statusCode).toBe(400);
  });

  test(`실패] 일반 회원 권한 부족`, async () => {
    await login(request, 'sample', 'sample');

    const response = await request.get(`/admin/contact/${mockContact.id}`);

    expect(response.statusCode).toBe(403);
  });

  test(`실패] 존재하지 않는 문의`, async () => {
    await login(request, 'admin', 'admin');

    const response = await request.get(`/admin/contact/abc`);

    expect(response.statusCode).toBe(404);
  });
});
