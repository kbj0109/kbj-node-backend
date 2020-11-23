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
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/팝업 삭제'), () => {
  describe(`DELETE /admin/popups/{popupId}`, () => {
    let response;

    beforeAll(async () => {
      const postRes = await request.post(`/admin/popups`).send(mockPost);

      response = await request.delete(`/admin/popups/${postRes.body.id}`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      expect(Array.isArray(response.body)).toBe(true);

      response.body.forEach(item => {
        popupProperties.forEach(prop => {
          expect(item).toHaveProperty(prop);
        });
      });
    });

    test('성공] 팝업 다중 삭제 가능', async () => {
      const postRes1 = await request.post(`/admin/popups`).send(mockPost);
      const postRes2 = await request.post(`/admin/popups`).send(mockPost);

      const response = await request.delete(
        `/admin/popups/${postRes1.body.id},${postRes2.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
