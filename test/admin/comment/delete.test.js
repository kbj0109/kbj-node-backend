const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/comment');
const { getCommentObject } = require('../../../src/services/comment');

const boardType = 'default';

const commentProperties = Object.keys(getCommentObject(schema));

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

describe(chalk.bold.cyan('관리자/댓글관리 삭제'), () => {
  let response;

  beforeAll(async () => {
    const postArticle = await request
      .post(`/admin/articles/${boardType}`)
      .send(mockPost);

    const postComment1 = await request
      .post(`/admin/articles/${boardType}/${postArticle.body.id}/comments`)
      .send(mockPostComment);
    const postComment2 = await request
      .post(`/admin/articles/${boardType}/${postArticle.body.id}/comments`)
      .send(mockPostComment);

    response = await request.delete(
      `/admin/comments/${postComment1.body.id},${postComment2.body.id}`,
    );
  });

  test(`성공] Status code 200`, () => {
    expect(response.statusCode).toBe(200);
  });

  test(`성공] 구조 검증`, () => {
    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach(item => {
      commentProperties.forEach(prop => {
        expect(item).toHaveProperty(prop);
      });
    });
  });

  test(`성공] 다중 삭제 가능`, () => {
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length > 1).toBe(true);
  });
});
