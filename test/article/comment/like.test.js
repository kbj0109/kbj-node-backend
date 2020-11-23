const chalk = require('chalk');
const { MOCK_USERS } = require('../../config');
const { testAppHelper, login, verifyAuth } = require('../../util');

const boardList = [
  {
    type: 'default',
    commentLikeAuth: 'level',
    commentLikeLevel: 0,
    useComment: true,
  },
  // {
  //   type: 'public',
  //   commentLikeAuth: '',
  //   commentLikeLevel: 0,
  //   useComment: true,
  // },
  {
    type: 'admin',
    commentLikeAuth: 'level',
    commentLikeLevel: 100,
    useComment: true,
  },
];

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
  content: '댓글 입니다.',
};

let request;
const mockComments = {};

beforeAll(async () => {
  request = await testAppHelper.init();

  await login(request, 'admin', 'admin');
  const [defaultPost, publicPost, adminPost] = await Promise.all([
    request.post(`/articles/default`).send(mockPost),
    request.post(`/articles/public`).send(mockPost),
    request.post(`/articles/admin`).send(mockPost),
  ]);

  const [defaultComment, publicComment, adminComment] = await Promise.all([
    request
      .post(`/articles/default/${defaultPost.body.id}/comments`)
      .send(mockPostComment),
    request
      .post(`/articles/public/${publicPost.body.id}/comments`)
      .send(mockPostComment),
    request
      .post(`/articles/admin/${adminPost.body.id}/comments`)
      .send(mockPostComment),
  ]);

  mockComments.default = defaultComment.body;
  mockComments.public = publicComment.body;
  mockComments.admin = adminComment.body;
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/댓글추천'), () => {
  // Like User
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    // Board
    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        const mockComment = mockComments[board.type];

        response = await request.post(
          `/articles/${board.type}/comments/${mockComment.id}/like`,
        );
      });

      const isForbidden = verifyAuth({
        auth: board.commentLikeAuth,
        authLevel: board.commentLikeLevel,
        userLevel: requester.level,
      });

      // 테스트 시작
      describe(`POST /articles/${board.type}/comments/{commentId}/like
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
            expect(response.body).toHaveProperty('postId');
            expect(response.body).toHaveProperty('liked');
            expect(response.body).toHaveProperty('likeCount');
          });
        }
      });
    });
  });

  test(`성공] 이미 추천한 Comment를 다시 추천하면 취소됨`, async () => {
    await login(request, 'admin', 'admin');
    const articleRes = await request.post(`/articles/default`).send(mockPost);
    const commentRes = await request
      .post(`/articles/default/${articleRes.body.id}/comments`)
      .send(mockPostComment);
    const likeRes = await request.post(
      `/articles/default/comments/${commentRes.body.id}/like`,
    );

    expect(likeRes.body.liked).toBe(true);
    expect(likeRes.body.likeCount).toBe(1);

    // 다시 추천 요청시 추천 취소
    const likeRes2 = await request.post(
      `/articles/default/comments/${commentRes.body.id}/like`,
    );
    expect(likeRes2.body.liked).toBe(false);
    expect(likeRes2.body.likeCount).toBe(0);
  });
});
