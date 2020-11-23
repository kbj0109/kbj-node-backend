const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/popup');
const { getPopupObject } = require('../../../src/services/popup');

const popupProperties = Object.keys(getPopupObject(schema));

const mockPost = {
  subject: '제목',
  content: '내용',
  type: '구분',
  width: '',
  height: '',
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
  await Promise.all([
    request.post(`/admin/popups`).send(mockPost),
    request.post(`/admin/popups`).send(mockPost),
  ]);
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/팝업 목록'), () => {
  describe(`GET /admin/popups`, () => {
    let response;

    beforeAll(async () => {
      response = await request.get(`/admin/popups`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('list');
      expect(Array.isArray(response.body.list)).toBe(true);

      response.body.list.forEach(item => {
        popupProperties.forEach(prop => {
          expect(item).toHaveProperty(prop);
        });
      });
    });

    test('성공] visible, visibleStart, visibleEnd 무관하게 목록 확인 가능', async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
      endDate.setDate(endDate.getDate() - 1);

      await request.post(`/admin/popups`).send({
        ...mockPost,
        visible: false,
        visibleStart: startDate,
        visibleEnd: endDate,
      });

      const response = await request.get(`/admin/popups`);
      expect(response.body.list[0].visible).toBe(false);

      const visibleEnd = new Date(response.body.list[0].visibleEnd).getTime();
      const now = new Date().getTime();
      expect(visibleEnd < now).toBe(true);
    });
  });
});
