const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');

const boardType = 'admin';

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
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/게시물 추천'), () => {
  const mockArticle = {};

  beforeAll(async () => {
    const postRes = await request.post(`/articles/${boardType}`).send(mockPost);
    mockArticle.body = postRes.body;
  });

  describe(`POST /admin/articles/${boardType}/{articleId}/like`, () => {
    let response;

    beforeAll(async () => {
      const postRes = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);

      response = await request.post(
        `/admin/articles/${boardType}/${postRes.body.id}/like`,
      );
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      expect(response.body).toHaveProperty('postId');
      expect(response.body).toHaveProperty('liked');
      expect(response.body).toHaveProperty('likeCount');
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin2', 'admin2');

      const response = await request.post(
        `/admin/articles/${boardType}/${mockArticle.body.id}/like`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
