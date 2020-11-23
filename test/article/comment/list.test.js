const chalk = require('chalk');
const { MOCK_USERS } = require('../../config');
const { testAppHelper, login, verifyAuth } = require('../../util');
const { schema } = require('../../../src/database/models/comment');
const { getCommentObject } = require('../../../src/services/comment');

const boardList = [
  {
    type: 'default',
    commentReadListAuth: '',
    commentReadListLevel: 0,
    useComment: true,
  },
  // {
  //   type: 'public',
  //   commentReadListAuth: '',
  //   commentReadListLevel: 0,
  //   useComment: true,
  // },
  {
    type: 'private',
    commentReadListAuth: 'level',
    commentReadListLevel: 0,
    useComment: true,
  },
  {
    type: 'admin',
    commentReadListAuth: 'level',
    commentReadListLevel: 100,
    useComment: true,
  },
];

const commentProperties = Object.keys(
  getCommentObject(schema, { remove: ['postId', 'boardType'] }),
);

const mockPost = {
  subject: '제목',
  content: '내용',
  attachFiles: [],
  category: '',
  description: '',
  // email: '',
  link: '',
  secret: false,
  field1: '',
  field2: '',
  field3: '',
  tags: '사과,배,귤,망고',
};
const mockPostComment = {
  content: '댓글 내용입니다',
  name: 'guest',
  password: 'guest',
};

let request;
const mockArticles = {};

beforeAll(async () => {
  request = await testAppHelper.init();

  await login(request, 'admin', 'admin');
  const [adminDefault, adminPrivate, adminAdmin] = await Promise.all([
    request.post(`/articles/default`).send(mockPost),
    request.post(`/articles/private`).send(mockPost),
    request.post(`/articles/admin`).send(mockPost),
  ]);

  mockArticles.admin = {
    default: adminDefault.body,
    private: adminPrivate.body,
    admin: adminAdmin.body,
  };

  const postCommentList = Object.keys(mockArticles.admin).map(boardType => {
    const articleId = mockArticles.admin[boardType].id;
    return [
      request
        .post(`/articles/${boardType}/${articleId}/comments`)
        .send(mockPostComment),
      request
        .post(`/articles/${boardType}/${articleId}/comments`)
        .send(mockPostComment),
      request
        .post(`/articles/${boardType}/${articleId}/comments`)
        .send(mockPostComment),
    ];
  });

  await Promise.all(postCommentList.flat());
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/댓글목록'), () => {
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        const mockArticle = mockArticles.admin[board.type];

        response = await request.get(
          `/articles/${board.type}/${mockArticle.id}/comments`,
        );
      });

      const isForbidden = verifyAuth({
        auth: board.commentReadListAuth,
        authLevel: board.commentReadListLevel,
        userLevel: requester.level,
      });

      describe(`GET /articles/${board.type}/{articleId}/comments
      (userId: ${requester.id})`, () => {
        if (isForbidden || !board.useComment) {
          test(`실패] 권한 부족`, () => {
            expect(response.statusCode).toBe(403);
          });
          return;
        }

        if (isForbidden === false && board.useComment) {
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
        }
      });
    });
  });

  describe('비회원 권한 검증', () => {
    const mockArticles = {
      public: {},
      private: {},
    };

    beforeAll(async () => {
      await login(request, 'admin', 'admin');
      const [publicArticle, privateArticle] = await Promise.all([
        request.post(`/articles/public`).send(mockPost),
        request.post(`/articles/private`).send(mockPost),
      ]);
      mockArticles.public = publicArticle.body;
      mockArticles.private = privateArticle.body;

      await request.post(`/auth/logout`);
    });

    test('성공] 비회원 댓글 목록', async () => {
      const response = await request.get(
        `/articles/public/${mockArticles.public.id}/comments`,
      );

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 댓글 목록이 허용되지 않음', async () => {
      const response = await request.get(
        `/articles/private/${mockArticles.private.id}/comments`,
      );

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin', 'admin');
      const postRes = await request.post(`/articles/admin`).send(mockPost);

      await login(request, 'sample2', 'sample2');
      const response = await request.get(
        `/articles/admin/${postRes.body.id}/comments`,
      );

      expect(response.statusCode).toBe(200);
    });
  });
});
