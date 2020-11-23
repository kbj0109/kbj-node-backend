const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/banner');
const { getBannerObject } = require('../../../src/services/banner');

const bannerProperties = Object.keys(getBannerObject(schema));

const mockPost = {
  subject: '제목',
  type: '구분',
  attachFiles: [],
  description: '',
  link: '',
  target: '',
  order: 1,
  visible: false,
  visibleStart: (() => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return date.toISOString();
  })(),
  visibleEnd: (() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString();
  })(),
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();

  await login(request, 'admin', 'admin');
  await Promise.all([
    request.post(`/admin/banners`).send(mockPost),
    request.post(`/admin/banners`).send(mockPost),
  ]);
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/배너 목록'), () => {
  describe(`GET /admin/banners`, () => {
    let response;

    beforeAll(async () => {
      response = await request.get(`/admin/banners`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('list');
      expect(Array.isArray(response.body.list)).toBe(true);

      response.body.list.forEach(item => {
        bannerProperties.forEach(prop => {
          expect(item).toHaveProperty(prop);
        });
      });
    });
  });

  describe('관리자 권한 검증', () => {
    let response;

    beforeAll(async () => {
      response = await request.get(`/admin/banners`);
    });

    test('성공] visible, visibleStart, visibleEnd 무관하게 목록 확인 가능', async () => {
      expect(response.body.list[0].visible).toBe(false);

      const visibleEnd = new Date(response.body.list[0].visibleEnd).getTime();
      const now = new Date().getTime();
      expect(visibleEnd < now).toBe(true);
    });
  });
});
