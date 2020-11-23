const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/article');
const { getArticleObject } = require('../../../src/services/article');

const boardType = 'default';
const articleProperties = Object.keys(getArticleObject(schema));

const mockPost = {
  subject: '제목',
  content: '내용',
  attachFiles: [],
  category: '',
  description: '',
  link: '',
  secret: false,
  field1: '',
  field2: '',
  field3: '',
  tags: '사과,배,귤,망고',
  notice: true,
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

describe(chalk.bold.cyan('관리자/게시물 등록'), () => {
  describe(`POST /admin/articles/${boardType}`, () => {
    let response;

    beforeAll(async () => {
      response = await request
        .post(`/admin/articles/${boardType}`)
        .send(mockPost);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('visible');
      expect(response.body).toHaveProperty('visibleStart');
      expect(response.body).toHaveProperty('visibleEnd');

      expect(response.body).not.toHaveProperty('password');

      articleProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });

    test('성공] notice 설정 가능', async () => {
      expect(response.body.notice).toBe(mockPost.notice);
    });

    test('성공] order 설정 가능', async () => {
      expect(response.body.order).toBe(mockPost.order);
    });

    test('성공] visible, visibleStart, visibleEnd 설정 가능', async () => {
      expect(response.body.visible).toBe(mockPost.visible);
      expect(response.body.visibleStart).toBe(mockPost.visibleStart);
      expect(response.body.visibleEnd).toBe(mockPost.visibleEnd);
    });

    test('실패] visibleStart가 visibleEnd 보다 미래', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() - 1);

      const response = await request.post(`/admin/articles/${boardType}`).send({
        ...mockPost,
        visibleEnd: endDate.toISOString(),
      });

      expect(response.statusCode).toBe(400);
    });

    test('실패] 유효하지 않은 날짜 형식', async () => {
      const response = await request.post(`/admin/articles/${boardType}`).send({
        ...mockPost,
        visibleStart: 'abc',
        visibleEnd: 'abc',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin2', 'admin2');

      const response = await request
        .post(`/admin/articles/${boardType}`)
        .send(mockPost);

      expect(response.statusCode).toBe(200);
    });
  });
});
