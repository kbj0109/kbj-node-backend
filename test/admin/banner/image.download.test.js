const chalk = require('chalk');
const path = require('path');
const { DUMMY_FILE_PATH } = require('../../config');
const { testAppHelper, login } = require('../../util');

const mockPost = { fileName: 'sample1.jpg' };

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/배너 이미지 다운'), () => {
  describe(`GET /admin/banners/img/{imgId}`, () => {
    test(`성공] Status code 200`, async () => {
      const postImgs = await request
        .post(`/admin/banners/img`)
        .set('Connection', 'keep-alive')
        .attach('file', path.join(DUMMY_FILE_PATH, mockPost.fileName));

      const response = await request.get(
        `/admin/banners/img/${postImgs.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });

    test(`실패] 존재하지 않는 이미지`, async () => {
      await login(request, 'admin', 'admin');
      const response = await request.get(`/admin/banners/img/abc`);

      expect(response.statusCode).toBe(404);
    });
  });
});
