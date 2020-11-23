const chalk = require('chalk');
const { MOCK_USERS } = require('../config');
const { testAppHelper, login, verifyAuth } = require('../util');

const boardList = [
  {
    type: 'default',
    likeAuth: 'level',
    likeLevel: 0,
  },
  {
    type: 'public',
    likeAuth: '',
    likeLevel: 0,
  },
  {
    type: 'admin',
    likeAuth: 'level',
    likeLevel: 100,
  },
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
  tags: '사과,배,귤,망고',
};

let request;
const mockArticles = {};

beforeAll(async () => {
  request = await testAppHelper.init();

  await login(request, 'admin', 'admin');
  const [adminDefault, adminPublic, adminAdmin] = await Promise.all([
    request.post(`/articles/default`).send(mockPost),
    request.post(`/articles/public`).send(mockPost),
    request.post(`/articles/admin`).send(mockPost),
  ]);

  mockArticles.default = adminDefault.body;
  mockArticles.public = adminPublic.body;
  mockArticles.admin = adminAdmin.body;
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/추천'), () => {
  // Like User
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    // Board
    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        const mockArticle = mockArticles[board.type];

        response = await request.post(
          `/articles/${board.type}/${mockArticle.id}/like`,
        );
      });

      const isForbidden = verifyAuth({
        auth: board.likeAuth,
        authLevel: board.likeLevel,
        userLevel: requester.level,
      });

      // 테스트 시작
      describe(`POST /articles/${board.type}/{articleId}/like
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

          test(`성공] 구조 검증`, async () => {
            expect(response.body).toHaveProperty('postId');
            expect(response.body).toHaveProperty('liked');
            expect(response.body).toHaveProperty('likeCount');
          });
        }
      });
    });
  });

  test(`성공] 이미 추천한 Article를 다시 추천하면 취소됨`, async () => {
    await login(request, 'admin', 'admin');
    const articleRes = await request.post(`/articles/default`).send(mockPost);
    const likeRes = await request.post(
      `/articles/default/${articleRes.body.id}/like`,
    );
    expect(likeRes.body.liked).toBe(true);
    expect(likeRes.body.likeCount).toBe(1);

    // 다시 추천 요청시 추천 취소
    const likeRes2 = await request.post(
      `/articles/default/${articleRes.body.id}/like`,
    );
    expect(likeRes2.body.liked).toBe(false);
    expect(likeRes2.body.likeCount).toBe(0);

    await request.post(`/articles/default/${articleRes.body.id}/like`);
  });
});
