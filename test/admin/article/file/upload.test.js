const chalk = require('chalk');
const path = require('path');
const { DUMMY_FILE_PATH } = require('../../../config');
const { testAppHelper, login } = require('../../../util');

const boardType = 'default';
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

describe(chalk.bold.cyan('관리자/게시물 파일첨부'), () => {
  describe(`POST /admin/articles/${boardType}/file`, () => {
    let response;

    beforeAll(async () => {
      response = await request
        .post(`/admin/articles/${boardType}/file`)
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
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin2', 'admin2');
      const response = await request
        .post(`/admin/articles/${boardType}/file`)
        .set('Connection', 'keep-alive')
        .attach('file', path.join(DUMMY_FILE_PATH, mockPost.fileName));

      expect(response.statusCode).toBe(200);
    });
  });
});
