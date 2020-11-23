const chalk = require('chalk');
const path = require('path');
const { testAppHelper, login } = require('../util');
const { DUMMY_FILE_PATH } = require('../config');

let request;
const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('파일/등록 전 첨부파일 다운'), () => {
  let response;

  beforeAll(async () => {
    response = await request
      .post(`/articles/admin/file`)
      .attach('file', filePath);
  });

  describe(`GET /file/{fileId}`, () => {
    test(`성공] Status code 200`, async () => {
      const downloadRes = await request.get(`/file/${response.body.id}`);

      expect(downloadRes.statusCode).toBe(200);
    });

    test(`실패] 존재하지 않는 파일`, async () => {
      const response = await request.get(`/file/abc`);

      expect(response.statusCode).toBe(404);
    });
  });
});
