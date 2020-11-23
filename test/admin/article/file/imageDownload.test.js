const chalk = require('chalk');
const path = require('path');
const { DUMMY_FILE_PATH } = require('../../../config');
const { testAppHelper, login } = require('../../../util');

let request;

const boardType = 'default';
const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/게시물 이미지 다운'), () => {
  const mockFile = {};

  beforeAll(async () => {
    const postFile = await request
      .post(`/articles/${boardType}/img`)
      .attach('file', filePath);

    mockFile.body = postFile.body;
  });

  describe(`GET /admin/articles/${boardType}/img/{imgId}`, () => {
    let response;

    beforeAll(async () => {
      response = await request.get(
        `/admin/articles/${boardType}/img/${mockFile.body.id}`,
      );
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin2', 'admin2');
      const response = await request.get(
        `/admin/articles/${boardType}/img/${mockFile.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
