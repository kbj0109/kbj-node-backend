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
let postRes;

beforeAll(async () => {
  request = await testAppHelper.init();

  await login(request, 'admin', 'admin');
  postRes = await request.post(`/admin/popups`).send(mockPost);
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/팝업 수정'), () => {
  describe(`PUT /admin/popups/{popupId}`, () => {
    let response;

    beforeAll(async () => {
      response = await request
        .put(`/admin/popups/${postRes.body.id}`)
        .send(mockPost);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      popupProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });

    test(`성공] 수정자 아이디가 기록됨`, async () => {
      expect(response.body.updater).toBe('admin');
    });
  });

  describe('visibleStart, visibleEnd 값 검증', () => {
    test('실패] visibleStart가 visibleEnd 보다 미래', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() - 1);

      const response = await request
        .put(`/admin/popups/${postRes.body.id}`)
        .send({
          ...mockPost,
          visibleStart: startDate.toISOString(),
          visibleEnd: endDate.toISOString(),
        });

      expect(response.statusCode).toBe(400);
    });

    test('실패] 유효하지 않은 날짜 형식', async () => {
      const response = await request
        .put(`/admin/popups/${postRes.body.id}`)
        .send({
          ...mockPost,
          visibleStart: 'abc',
          visibleEnd: 'abc',
        });

      expect(response.statusCode).toBe(400);
    });
  });
});
