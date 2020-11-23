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

describe(chalk.bold.cyan('관리자/댓글관리 목록'), () => {
  let response;

  beforeAll(async () => {
    const postArticle = await request
      .post(`/admin/articles/${boardType}`)
      .send(mockPost);

    await request
      .post(`/admin/articles/${boardType}/${postArticle.body.id}/comments`)
      .send(mockPostComment);

    await request.get(
      `/admin/articles/${boardType}/${postArticle.body.id}/comments`,
    );

    response = await request.get('/admin/comments');
  });

  test(`성공] Status code 200`, () => {
    expect(response.statusCode).toBe(200);
  });

  test(`성공] 구조 검증`, () => {
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('list');
    expect(Array.isArray(response.body.list)).toBe(true);

    response.body.list.forEach(item => {
      expect(item).toHaveProperty('postSubject');
      expect(item).toHaveProperty('postCommentCount');

      commentProperties.forEach(prop => {
        expect(item).toHaveProperty(prop);
      });
    });
  });
});
