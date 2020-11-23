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

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/배너 삭제'), () => {
  describe(`DELETE /admin/banners/{bannerId}`, () => {
    let response;

    beforeAll(async () => {
      const postRes = await request.post(`/admin/banners`).send(mockPost);

      response = await request.delete(`/admin/banners/${postRes.body.id}`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      expect(Array.isArray(response.body)).toBe(true);

      response.body.forEach(item => {
        bannerProperties.forEach(prop => {
          expect(item).toHaveProperty(prop);
        });
      });
    });
  });

  describe('관리자 권한 검증', () => {
    test('성공] 배너 다중 삭제 가능', async () => {
      const postRes1 = await request.post(`/admin/banners`).send(mockPost);
      const postRes2 = await request.post(`/admin/banners`).send(mockPost);

      const response = await request.delete(
        `/admin/banners/${postRes1.body.id},${postRes2.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
