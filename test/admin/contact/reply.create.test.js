const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/reply');
const { getReplyObject } = require('../../../src/services/reply');

const replyProperties = Object.keys(getReplyObject(schema));

const mockPost = {
  subject: '제목',
  content: '내용',
  attachFiles: [],
  name: 'guest',
  email: 'sample@sample.com',
  phoneNumber: '010-1234-5678',
};
const mockReply = { content: '관리자의 문의 답변' };

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

describe(chalk.bold.cyan('관리자/문의 답변 등록'), () => {
  describe(`POST /admin/contact/{contactId}/reply`, () => {
    let response;

    beforeAll(async () => {
      await login(request, 'admin', 'admin');

      response = await request
        .post(`/admin/contact/${mockContact.id}/reply`)
        .send(mockReply);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      replyProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });
  });

  test(`실패] 비회원 권한 부족 `, async () => {
    await request.post(`/auth/logout`);

    const response = await request
      .post(`/admin/contact/${mockContact.id}/reply`)
      .send(mockReply);

    expect(response.statusCode).toBe(400);
  });

  test(`실패] 일반 회원 권한 부족`, async () => {
    await login(request, 'sample', 'sample');

    const response = await request
      .post(`/admin/contact/${mockContact.id}/reply`)
      .send(mockReply);

    expect(response.statusCode).toBe(403);
  });
});
