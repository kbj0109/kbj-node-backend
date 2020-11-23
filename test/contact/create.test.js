const chalk = require('chalk');
const path = require('path');
const {
  testAppHelper,
  isObjectArrayEqual,
  createMockFile,
} = require('../util');
const { schema } = require('../../src/database/models/contact');
const { getContactObject } = require('../../src/services/contact');
const { TEMP_FILE_PATH, DUMMY_FILE_PATH } = require('../config');

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

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('문의하기/등록'), () => {
  describe('POST /contact', () => {
    let response;

    beforeAll(async () => {
      response = await request.post(`/contact`).send(mockPost);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      contactProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });
  });

  test('실패] name/email 필수값 없음', async () => {
    const [postRes1] = await Promise.all([
      request.post(`/contact`).send({ ...mockPost, name: '', email: '' }),
    ]);

    expect(postRes1.statusCode).toBe(400);
  });

  test('성공] 첨부파일 포함 등록시 응답에 파일정보가 포함됨', async () => {
    const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');
    const fileRes = await request
      .post(`/contact/file`)
      .attach('file', filePath);
    const postRes = await request
      .post(`/contact`)
      .send({ ...mockPost, attachFiles: [fileRes.body] });

    expect(postRes.statusCode).toBe(200);
    expect(Array.isArray(postRes.body.attachFiles)).toBe(true);
    expect(isObjectArrayEqual(postRes.body.attachFiles, [fileRes.body])).toBe(
      true,
    );
  });

  test('실패] 전체 파일첨부 허용 크기 초과', async () => {
    const mockFilePath = path.join(TEMP_FILE_PATH, 'mock.txt');
    await createMockFile(mockFilePath, 1024 * 1024 * 8);

    const postFiles = await Promise.all([
      request.post(`/contact/file`).attach('file', mockFilePath),
      request.post(`/contact/file`).attach('file', mockFilePath),
      request.post(`/contact/file`).attach('file', mockFilePath),
      request.post(`/contact/file`).attach('file', mockFilePath),
    ]);

    const attachFiles = postFiles.map(file => file.body);

    const postRes = await request
      .post(`/contact`)
      .send({ ...mockPost, attachFiles });

    expect(postRes.statusCode).toBe(400);
  });
});
