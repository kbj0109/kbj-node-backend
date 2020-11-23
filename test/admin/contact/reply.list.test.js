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

  // 문의 등록 후 답글 등록
  const postRes = await request.post(`/contact`).send(mockPost);
  mockContact.id = postRes.body.id;

  await login(request, 'admin', 'admin');

  await Promise.all([
    request.post(`/admin/contact/${mockContact.id}/reply`).send(mockReply),
  ]);
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/문의 답변 목록'), () => {
  describe(`GET /admin/contact/{contactId}/reply`, () => {
    let response;

    beforeAll(async () => {
      await login(request, 'admin', 'admin');

      response = await request.get(`/admin/contact/${mockContact.id}/reply`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      expect(Array.isArray(response.body)).toBe(true);

      response.body.forEach(one => {
        replyProperties.forEach(prop => {
          expect(one).toHaveProperty(prop);
        });
      });
    });
  });

  test(`실패] 비회원 권한 부족 `, async () => {
    await request.post(`/auth/logout`);

    const response = await request.get(
      `/admin/contact/${mockContact.id}/reply`,
    );

    expect(response.statusCode).toBe(400);
  });

  test(`실패] 일반 회원 권한 부족`, async () => {
    await login(request, 'sample', 'sample');

    const response = await request.get(
      `/admin/contact/${mockContact.id}/reply`,
    );

    expect(response.statusCode).toBe(403);
  });
});
