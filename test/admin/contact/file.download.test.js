const chalk = require('chalk');
const path = require('path');
const { testAppHelper, login } = require('../../util');
const { DUMMY_FILE_PATH } = require('../../config');

const mockPost = {
  subject: '제목',
  content: '내용',
  attachFiles: [],
  name: 'guest',
  email: 'sample@sample.com',
  phoneNumber: '010-1234-5678',
};

let request;
const mockFile = {};

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/문의 파일 다운'), () => {
  beforeAll(async () => {
    const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');

    const fileRes = await request
      .post(`/contact/file`)
      .attach('file', filePath);
    const postRes = await request
      .post(`/contact`)
      .send({ ...mockPost, attachFiles: [fileRes.body] });

    mockFile.id = postRes.body.attachFiles[0].id;
  });

  describe(`GET /admin/contact/file/{fileId}`, () => {
    test(`실패] 비회원 권한 부족 `, async () => {
      const response = await request.get(`/admin/contact/file/${mockFile.id}`);

      expect(response.statusCode).toBe(400);
    });

    test(`실패] 일반 회원 권한 부족`, async () => {
      await login(request, 'sample', 'sample');
      const response = await request.get(`/admin/contact/file/${mockFile.id}`);

      expect(response.statusCode).toBe(403);
    });

    test(`성공] Status code 200`, async () => {
      await login(request, 'admin', 'admin');
      const response = await request.get(`/admin/contact/file/${mockFile.id}`);

      expect(response.statusCode).toBe(200);
    });

    test(`실패] 존재하지 않는 파일`, async () => {
      await login(request, 'admin', 'admin');
      const response = await request.get(`/admin/contact/file/abc`);

      expect(response.statusCode).toBe(404);
    });
  });
});
