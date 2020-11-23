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
  visibleStart: new Date().toISOString(),
  visibleEnd: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  })(),
};

let request;
let postRes;

beforeAll(async () => {
  request = await testAppHelper.init();

  await login(request, 'admin', 'admin');
  postRes = await request.post(`/admin/banners`).send(mockPost);
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/배너 상세'), () => {
  describe(`GET /admin/banners/{bannerId}`, () => {
    let response;

    beforeAll(async () => {
      response = await request.get(`/admin/banners/${postRes.body.id}`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      bannerProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });
  });

  describe('관리자 권한 검증', () => {
    let response;

    beforeAll(async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
      endDate.setDate(endDate.getDate() - 1);

      const postRes = await request.post(`/admin/banners`).send({
        ...mockPost,
        visible: false,
        visibleStart: startDate,
        visibleEnd: endDate,
      });

      response = await request.get(`/admin/banners/${postRes.body.id}`);
    });

    test('성공] visible, visibleStart, visibleEnd 무관하게 상세 확인 가능', async () => {
      expect(response.body.visible).toBe(false);

      const visibleEnd = new Date(response.body.visibleEnd).getTime();
      const now = new Date().getTime();
      expect(visibleEnd < now).toBe(true);
    });
  });
});
