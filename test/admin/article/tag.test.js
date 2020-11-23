const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');

const boardType = 'default';
const tagList = ['tag1', 'tag1,tag2'];

const mockPost = {
  subject: '제목',
  content: '내용',
  attachFiles: [],
  category: '',
  description: '',
  name: 'guest',
  password: 'guest',
  link: '',
  secret: false,
  field1: '',
  field2: '',
  field3: '',
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/태그 목록'), () => {
  beforeAll(async () => {
    const postArticleList = tagList.map(tags => {
      return request.post(`/articles/${boardType}`).send({ ...mockPost, tags });
    });

    await Promise.all(postArticleList);
  });

  describe(`GET /admin/articles/${boardType}/tags`, () => {
    let response;

    beforeAll(async () => {
      response = await request.get(`/admin/articles/${boardType}/tags`);
    });

    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, () => {
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('성공] 태그 목록이 인기순 정렬인지 검증', () => {
      ['tag1', 'tag2'].forEach((item, index) => {
        expect(item).toBe(response.body[index]);
      });
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin2', 'admin2');
      const response = await request.get(`/admin/articles/${boardType}/tags`);

      expect(response.statusCode).toBe(200);
    });
  });
});
