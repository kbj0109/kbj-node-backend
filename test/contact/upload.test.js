const chalk = require('chalk');
const path = require('path');
const { TEMP_FILE_PATH, DUMMY_FILE_PATH } = require('../config');
const { testAppHelper, createMockFile } = require('../util');

const fileProperties = ['id', 'fileName', 'fileSize'];

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('문의하기/파일첨부'), () => {
  describe(`POST /contact/file`, () => {
    let response;

    const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');

    beforeAll(async () => {
      response = await request.post(`/contact/file`).attach('file', filePath);
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

  test(`실패] 파일첨부 허용 초과`, async () => {
    const mockFilePath = path.join(TEMP_FILE_PATH, 'mock.txt');
    await createMockFile(mockFilePath, 1024 * 1024 * 20);

    const response = await request
      .post(`/contact/file`)
      .attach('file', mockFilePath);

    expect(response.statusCode).toBe(400);
  });
});
