const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper, login, verifyAuth } = require('../util');

const boardList = [
  { type: 'default', readListAuth: '', readListLevel: 0 },
  { type: 'private', readListAuth: 'level', readListLevel: 0 },
  // { type: 'public', readListAuth: '', readListLevel: 0 },
  { type: 'admin', readListAuth: 'level', readListLevel: 100 },
];

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

const tagList = ['tag1', 'tag1,tag2', 'tag1,tag2,tag3'];

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');

  const postArticleList = tagList.map(tags => {
    return [
      request.post(`/articles/default`).send({ ...mockPost, tags }),
      request.post(`/articles/private`).send({ ...mockPost, tags }),
      request.post(`/articles/admin`).send({ ...mockPost, tags }),
    ];
  });

  await Promise.all(postArticleList.flat());
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/태그목록'), () => {
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        response = await request.get(`/articles/${board.type}/tags`);
      });

      const isForbidden = verifyAuth({
        auth: board.readListAuth,
        authLevel: board.readListLevel,
        userLevel: requester.level,
      });

      describe(`GET /articles/${board.type}/tags
      (userId: ${requester.id})`, () => {
        if (isForbidden) {
          test(`실패] 권한 부족`, () => {
            expect(response.statusCode).toBe(403);
          });
          return;
        }

        if (isForbidden === false) {
          test(`성공] Status code 200`, () => {
            expect(response.statusCode).toBe(200);
          });

          test(`성공] 구조 검증`, () => {
            expect(Array.isArray(response.body)).toBe(true);
          });

          test('성공] 태그 목록이 인기순 정렬인지 검증', () => {
            ['tag1', 'tag2', 'tag3'].forEach((item, index) => {
              expect(item).toBe(response.body[index]);
            });
          });
        }
      });
    });
  });

  describe('비회원 권한 검증', () => {
    beforeAll(async () => {
      await request.post(`/auth/logout`);
    });

    test('성공] 비회원 태그 목록', async () => {
      const response = await request.get(`/articles/public`);

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 태그 목록 조회가 허용되지 않음', async () => {
      const response = await request.get(`/articles/private`);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'sample2', 'sample2');
      const response = await request.get(`/articles/admin/tags`);

      expect(response.statusCode).toBe(200);
    });
  });
});
