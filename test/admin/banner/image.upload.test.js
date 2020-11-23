const chalk = require('chalk');
const path = require('path');
const { DUMMY_FILE_PATH } = require('../../config');
const { testAppHelper, login } = require('../../util');

const fileProperties = ['id', 'fileName', 'fileSize'];
const mockPost = { fileName: 'sample1.jpg' };

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/배너 이미지 첨부'), () => {
  describe(`POST /admin/banners/img`, () => {
    let response;

    beforeAll(async () => {
      response = await request
        .post(`/admin/banners/img`)
        .set('Connection', 'keep-alive')
        .attach('file', path.join(DUMMY_FILE_PATH, mockPost.fileName));
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      fileProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });

    test(`실패] 이미지 외 파일 첨부 불가`, async () => {
      const response = await request
        .post(`/admin/banners/img`)
        .set('Connection', 'keep-alive')
        .attach('file', path.join(DUMMY_FILE_PATH, 'sample1.txt'));

      expect(response.statusCode).toBe(400);
    });
  });
});
