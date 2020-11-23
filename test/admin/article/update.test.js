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
  notice: false,
  order: 1,
  visible: true,
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

describe(chalk.bold.cyan('관리자/게시물 수정'), () => {
  const mockArticle = {};

  beforeAll(async () => {
    const postRes = await request.post(`/articles/${boardType}`).send(mockPost);
    mockArticle.body = postRes.body;
  });

  describe(`PUT /admin/articles/${boardType}/{articleId}`, () => {
    let response;

    const newMockPost = {
      notice: !mockPost.notice,
      order: mockPost.order + 1,
      visible: !mockPost.visible,
      visibleStart: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 2);
        date.setMilliseconds(0);
        return date.toISOString();
      })(),
      visibleEnd: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 2);
        date.setMilliseconds(0);
        return date.toISOString();
      })(),
    };

    beforeAll(async () => {
      response = await request
        .put(`/admin/articles/${boardType}/${mockArticle.body.id}`)
        .send({ ...mockPost, ...newMockPost });
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

    test('성공] notice 수정 가능', () => {
      expect(response.body.notice).toBe(newMockPost.notice);
    });

    test('성공] order 수정 가능', () => {
      expect(response.body.order).toBe(newMockPost.order);
    });

    test('성공] visible, visibleStart, visibleEnd 수정 가능', () => {
      expect(response.body.visible).toBe(newMockPost.visible);
      expect(response.body.visibleStart).toBe(newMockPost.visibleStart);
      expect(response.body.visibleEnd).toBe(newMockPost.visibleEnd);
    });

    test('실패] visibleStart가 visibleEnd 보다 미래', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() - 1);

      const response = await request
        .put(`/admin/articles/${boardType}/${mockArticle.body.id}`)
        .send({
          ...mockPost,
          visibleStart: startDate.toISOString(),
          visibleEnd: endDate.toISOString(),
        });

      expect(response.statusCode).toBe(400);
    });

    test('실패] 유효하지 않은 날짜 형식', async () => {
      const response = await request
        .put(`/admin/articles/${boardType}/${mockArticle.body.id}`)
        .send({
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
        .put(`/admin/articles/${boardType}/${mockArticle.body.id}`)
        .send(mockPost);

      expect(response.statusCode).toBe(200);
    });
  });
});
