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

describe(chalk.bold.cyan('관리자/게시물 상세'), () => {
  const mockArticle = {};

  beforeAll(async () => {
    const postRes = await request.post(`/articles/${boardType}`).send(mockPost);
    mockArticle.body = postRes.body;
  });

  describe(`GET /admin/articles/${boardType}/{articleId}`, () => {
    let response;

    beforeAll(async () => {
      response = await request.get(
        `/admin/articles/${boardType}/${mockArticle.body.id}`,
      );
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
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin2', 'admin2');
      const response = await request.get(
        `/admin/articles/${boardType}/${mockArticle.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
