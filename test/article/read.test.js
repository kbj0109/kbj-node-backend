const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper, login, verifyAuth } = require('../util');
const { schema } = require('../../src/database/models/article');
const { getArticleObject } = require('../../src/services/article');
const { db } = require('../../src/database/models');

const boardList = [
  {
    type: 'default',
    readAuth: '',
    readLevel: 0,
  },
  {
    type: 'private',
    readAuth: 'level',
    readLevel: 0,
  },
  // {
  //   type: 'admin',
  //   readAuth: 'level',
  //   readLevel: 100,
  // },
];

const articleProperties = Object.keys(getArticleObject(schema));

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
  tags: '사과,배,귤,망고',
};

let request;
const mockArticles = {};

beforeAll(async () => {
  request = await testAppHelper.init();

  await login(request, 'admin', 'admin');
  const [adminDefault, adminPrivate] = await Promise.all([
    request.post(`/articles/default`).send(mockPost),
    request.post(`/articles/private`).send(mockPost),
  ]);
  mockArticles.admin = {
    default: adminDefault.body,
    private: adminPrivate.body,
  };

  await login(request, 'sample', 'sample');
  const [sampleDefault, samplePrivate] = await Promise.all([
    request.post(`/articles/default`).send(mockPost),
    request.post(`/articles/private`).send(mockPost),
  ]);
  mockArticles.sample = {
    default: sampleDefault.body,
    private: samplePrivate.body,
  };
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/상세'), () => {
  // Mock Writer
  MOCK_USERS.forEach(writer => {
    // Read User
    MOCK_USERS.forEach(requester => {
      beforeAll(async () => {
        await login(request, requester.id, requester.password);
      });

      // Read Board
      boardList.forEach(board => {
        let response;

        beforeAll(async () => {
          const mockArticle = mockArticles[writer.id][board.type];

          response = await request.get(
            `/articles/${board.type}/${mockArticle.id}`,
          );
        });

        const isForbidden = verifyAuth({
          auth: board.readAuth,
          authLevel: board.readLevel,
          userId: requester.id,
          userLevel: requester.level,
          writerId: writer.id,
        });

        describe(`GET /articles/${board.type}/{articleId}
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
              expect(response.body).not.toHaveProperty('order');
              expect(response.body).not.toHaveProperty('visible');
              expect(response.body).not.toHaveProperty('visibleStart');
              expect(response.body).not.toHaveProperty('visibleEnd');

              expect(response.body).not.toHaveProperty('password');

              articleProperties.forEach(prop => {
                expect(response.body).toHaveProperty(prop);
              });
            });
          }
        });
      });
    });
  });

  describe('비회원 권한 검증', () => {
    const boardType = 'public';

    beforeAll(async () => {
      await Promise.all([
        request.post(`/auth/logout`),

        db.BoardSetting.update(
          { createAuth: '', readAuth: 'writer' },
          { where: { type: boardType } },
        ),
      ]);
    });

    test('성공] 비회원 게시물 상세', async () => {
      const postRes = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);

      const response = await request
        .get(`/articles/${boardType}/${postRes.body.id}`)
        .set('password', mockPost.password);

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 작성자 정보 불일치', async () => {
      const postRes = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);

      const response = await request
        .get(`/articles/${boardType}/${postRes.body.id}`)
        .set('password', 'abc');

      expect(response.statusCode).toBe(403);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'sample2', 'sample2');
      const postRes = await request.post(`/articles/admin`).send(mockPost);
      const response = await request.get(`/articles/admin/${postRes.body.id}`);

      expect(response.statusCode).toBe(200);
    });
  });

  describe(`GET /articles/default/{articleId} - 조회수 증가 테스트
  (userId: admin)`, () => {
    test('성공] Article 조회시 첫 조회에만 조회수 증가됨', async () => {
      const boardType = 'default';

      await login(request, 'admin', 'admin');
      const postRes = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);
      expect(postRes.statusCode).toBe(200);
      expect(postRes.body.viewCount).toBe(0);

      // 첫 읽기에 조회수 +1
      const readRes1 = await request.get(
        `/articles/${boardType}/${postRes.body.id}`,
      );
      expect(readRes1.statusCode).toBe(200);
      expect(readRes1.body.viewCount).toBe(1);

      // 두번째 읽기에 조회수 +0
      const readRes2 = await request.get(
        `/articles/${boardType}/${postRes.body.id}`,
      );
      expect(readRes2.statusCode).toBe(200);
      expect(readRes2.body.viewCount).toBe(readRes1.body.viewCount);
    });
  });
});
