const chalk = require('chalk');
const { testAppHelper, login } = require('../../../util');
const { schema } = require('../../../../src/database/models/comment');
const { getCommentObject } = require('../../../../src/services/comment');

const boardType = 'default';
const commentProperties = Object.keys(
  getCommentObject(schema, { remove: ['postId', 'boardType'] }),
);

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
const mockPostComment = {
  content: '댓글 내용입니다',
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/댓글 목록'), () => {
  const mockArticle = {};

  beforeAll(async () => {
    const postRes = await request.post(`/articles/${boardType}`).send(mockPost);
    mockArticle.body = postRes.body;
  });

  describe(`GET /admin/articles/${boardType}/{articleId}/comments`, () => {
    let response;

    beforeAll(async () => {
      await request
        .post(`/articles/${boardType}/${mockArticle.body.id}/comments`)
        .send(mockPostComment);

      response = await request.get(
        `/admin/articles/${boardType}/${mockArticle.body.id}/comments`,
      );
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      response.body.forEach(comment => {
        commentProperties.forEach(prop => {
          expect(comment).toHaveProperty(prop);
        });
      });
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin2', 'admin2');

      const response = await request.get(
        `/admin/articles/admin/${mockArticle.body.id}/comments`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
