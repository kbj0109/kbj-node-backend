const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper, login, verifyAuth } = require('../util');
const { schema } = require('../../src/database/models/article');
const { getArticleObject } = require('../../src/services/article');

const boardList = [
  {
    type: 'default',
    readListAuth: '',
    readListLevel: 0,
  },
  {
    type: 'private',
    readListAuth: 'level',
    readListLevel: 0,
  },
  // {
  //   type: 'public',
  //   readListAuth: '',
  //   readListLevel: 0,
  // },
  {
    type: 'admin',
    readListAuth: 'level',
    readListLevel: 100,
  },
];

const articleProperties = Object.keys(
  getArticleObject(schema, { remove: ['content'] }),
);

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/목록'), () => {
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        response = await request.get(`/articles/${board.type}`);
      });

      const isForbidden = verifyAuth({
        auth: board.readListAuth,
        authLevel: board.readListLevel,
        userLevel: requester.level,
      });

      describe(`GET /articles/${board.type}
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
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('list');
            expect(response.body.list.length).toBeLessThanOrEqual(
              response.body.total,
            );

            response.body.list.forEach(item => {
              expect(item.boardType).toBe(board.type);

              expect(response.body).not.toHaveProperty('order');
              expect(response.body).not.toHaveProperty('visible');
              expect(response.body).not.toHaveProperty('visibleStart');
              expect(response.body).not.toHaveProperty('visibleEnd');

              expect(item).not.toHaveProperty('password');

              articleProperties.forEach(prop => {
                expect(item).toHaveProperty(prop);
              });
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

    test('성공] 비회원 게시물 목록', async () => {
      const response = await request.get(`/articles/public`);

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 게시물 목록 조회가 허용되지 않음', async () => {
      const response = await request.get(`/articles/private`);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'sample2', 'sample2');
      const response = await request.get(`/articles/admin`);

      expect(response.statusCode).toBe(200);
    });
  });
});
