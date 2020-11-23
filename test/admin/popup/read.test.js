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

describe(chalk.bold.cyan('관리자/팝업 상세'), () => {
  describe(`GET /admin/popups/{popupId}`, () => {
    let response;

    beforeAll(async () => {
      response = await request.get(`/admin/popups/${postRes.body.id}`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      popupProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });
  });

  test('성공] visible, visibleStart, visibleEnd 무관하게 상세 확인 가능', async () => {
    const startDate = new Date();
    const endDate = new Date();
    startDate.setDate(startDate.getDate() - 2);
    endDate.setDate(endDate.getDate() - 1);

    const postRes = await request.post(`/admin/popups`).send({
      ...mockPost,
      visible: false,
      visibleStart: startDate,
      visibleEnd: endDate,
    });

    const response = await request.get(`/admin/popups/${postRes.body.id}`);

    expect(response.body.visible).toBe(false);

    const visibleEnd = new Date(response.body.visibleEnd).getTime();
    const now = new Date().getTime();
    expect(visibleEnd < now).toBe(true);
  });
});
