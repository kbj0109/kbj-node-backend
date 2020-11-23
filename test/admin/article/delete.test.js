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

describe(chalk.bold.cyan('관리자/게시물 삭제'), () => {
  describe(`DELETE /articles/${boardType}/{articleId}`, () => {
    let response;

    beforeAll(async () => {
      const postRes = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);

      response = await request.delete(
        `/admin/articles/${boardType}/${postRes.body.id}`,
      );
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      expect(Array.isArray(response.body)).toBe(true);

      response.body.forEach(item => {
        expect(item).toHaveProperty('order');
        expect(item).toHaveProperty('visible');
        expect(item).toHaveProperty('visibleStart');
        expect(item).toHaveProperty('visibleEnd');
        expect(item).not.toHaveProperty('password');

        articleProperties.forEach(prop => {
          expect(item).toHaveProperty(prop);
        });
      });
    });

    test('성공] 게시물 다중 삭제 가능', async () => {
      const postRes1 = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);
      const postRes2 = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);

      const response = await request.delete(
        `/admin/articles/${boardType}/${postRes1.body.id},${postRes2.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      const postRes = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);

      await login(request, 'admin2', 'admin2');

      const response = await request.delete(
        `/admin/articles/${boardType}/${postRes.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
