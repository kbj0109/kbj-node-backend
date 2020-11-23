const chalk = require('chalk');
const { testAppHelper, login } = require('../../../util');

const boardType = 'default';

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
  content: '댓글 입니다.',
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/댓글 추천'), () => {
  const mockComment = {};

  beforeAll(async () => {
    const postRes = await request.post(`/articles/${boardType}`).send(mockPost);
    const postCommentRes = await request
      .post(`/admin/articles/${boardType}/${postRes.body.id}/comments`)
      .send(mockPostComment);

    mockComment.body = postCommentRes.body;
  });

  describe(`POST /admin/articles/${boardType}/comments/{commentId}/like`, () => {
    let response;

    beforeAll(async () => {
      response = await request.post(
        `/admin/articles/${boardType}/comments/${mockComment.body.id}/like`,
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
        `/admin/articles/${boardType}/comments/${mockComment.body.id}/like`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
