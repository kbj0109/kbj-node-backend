const chalk = require('chalk');
const path = require('path');
const { DUMMY_FILE_PATH } = require('../../config');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/banner');
const { getBannerObject } = require('../../../src/services/banner');

const bannerProperties = Object.keys(
  getBannerObject(schema, { remove: ['deletedAt'] }),
);

const mockPost = {
  subject: '제목',
  type: '구분',
  attachFiles: [],
  description: '',
  link: '',
  target: '',
  order: 1,
  visible: false,
  visibleStart: new Date().toISOString(),
  visibleEnd: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  })(),
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/배너 등록'), () => {
  describe(`POST /admin/banners`, () => {
    let response;

    beforeAll(async () => {
      const fileRes = await request
        .post(`/admin/banners/img`)
        .set('Connection', 'keep-alive')
        .attach('file', path.join(DUMMY_FILE_PATH, 'sample1.jpg'));
      response = await request
        .post(`/admin/banners`)
        .send({ ...mockPost, attachFiles: [fileRes.body] });
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      bannerProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });

      expect(Array.isArray(response.body.attachFiles)).toBe(true);
    });
  });

  describe('visibleStart, visibleEnd 값 검증', () => {
    test('실패] visibleStart가 visibleEnd 보다 미래', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() - 1);

      const response = await request.post(`/admin/banners`).send({
        ...mockPost,
        visibleStart: startDate.toISOString(),
        visibleEnd: endDate.toISOString(),
      });

      expect(response.statusCode).toBe(400);
    });

    test('실패] 유효하지 않은 날짜 형식', async () => {
      const response = await request.post(`/admin/banners`).send({
        ...mockPost,
        visibleStart: 'abc',
        visibleEnd: 'abc',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
