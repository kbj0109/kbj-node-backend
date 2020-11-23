const chalk = require('chalk');
const { MOCK_USERS } = require('../../config');
const { testAppHelper, login, verifyAuth } = require('../../util');
const { schema } = require('../../../src/database/models/comment');
const { getCommentObject } = require('../../../src/services/comment');
const { db } = require('../../../src/database/models');

const boardList = [
  {
    type: 'default',
    commentDeleteAuth: 'writer,level',
    commentDeleteLevel: 100,
    useComment: true,
  },
  // {
  //   type: 'public',
  //   commentDeleteAuth: 'writer,level',
  //   commentDeleteLevel: 100,
  //   useComment: true,
  // },
  {
    type: 'private',
    commentDeleteAuth: 'writer,level',
    commentDeleteLevel: 100,
    useComment: true,
  },
  // {
  //   type: 'admin',
  //   commentDeleteAuth: 'level',
  //   commentDeleteLevel: 100,
  //   useComment: true,
  // },
];

const commentProperties = Object.keys(getCommentObject(schema));

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
  name: 'guest',
  password: 'guest',
};

let request;
const mockComments = {
  admin: {},
  sample: {},
};

beforeAll(async () => {
  request = await testAppHelper.init();

  // Article 등록
  await login(request, 'admin', 'admin');
  const [defaultArticle, privateArticle] = await Promise.all([
    request.post(`/articles/default`).send(mockPost),
    request.post(`/articles/private`).send(mockPost),
  ]);

  // Admin's Comment 등록
  const [
    adminAdminDefault,
    adminAdminPrivate,
    adminSampleDefault,
    adminSamplePrivate,
  ] = await Promise.all([
    request
      .post(`/articles/default/${defaultArticle.body.id}/comments`)
      .send(mockPostComment),
    request
      .post(`/articles/private/${privateArticle.body.id}/comments`)
      .send(mockPostComment),
    request
      .post(`/articles/default/${defaultArticle.body.id}/comments`)
      .send(mockPostComment),
    request
      .post(`/articles/private/${privateArticle.body.id}/comments`)
      .send(mockPostComment),
  ]);

  // Sample's Comment 등록
  await login(request, 'sample', 'sample');
  const [
    sampleAdminDefault,
    sampleAdminPrivate,
    sampleSampleDefault,
    sampleSamplePrivate,
  ] = await Promise.all([
    request
      .post(`/articles/default/${defaultArticle.body.id}/comments`)
      .send(mockPostComment),
    request
      .post(`/articles/private/${privateArticle.body.id}/comments`)
      .send(mockPostComment),
    request
      .post(`/articles/default/${defaultArticle.body.id}/comments`)
      .send(mockPostComment),
    request
      .post(`/articles/private/${privateArticle.body.id}/comments`)
      .send(mockPostComment),
  ]);

  // mockComments.작성자.삭제자.게시물
  mockComments.admin.admin = {
    default: adminAdminDefault.body,
    private: adminAdminPrivate.body,
  };
  mockComments.admin.sample = {
    default: adminSampleDefault.body,
    private: adminSamplePrivate.body,
  };
  mockComments.sample.admin = {
    default: sampleAdminDefault.body,
    private: sampleAdminPrivate.body,
  };
  mockComments.sample.sample = {
    default: sampleSampleDefault.body,
    private: sampleSamplePrivate.body,
  };
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/댓글삭제'), () => {
  // Mock Comment Writer
  MOCK_USERS.forEach(writer => {
    // Delete User
    MOCK_USERS.forEach(requester => {
      beforeAll(async () => {
        await login(request, requester.id, requester.password);
      });

      // Delete Board
      boardList.forEach(board => {
        let response;

        beforeAll(async () => {
          const mockComment = mockComments[writer.id][requester.id][board.type];

          response = await request.delete(
            `/articles/${board.type}/comments/${mockComment.id}`,
          );
        });

        const isForbidden = verifyAuth({
          auth: board.commentDeleteAuth,
          authLevel: board.commentDeleteLevel,
          userLevel: requester.level,
          userId: requester.id,
          writerId: writer.id,
        });

        // 테스트 시작
        describe(`DELETE /articles/${board.type}/comments/{commentId}
        writer: ${writer.id} - userId: ${requester.id}`, () => {
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
              commentProperties.forEach(prop => {
                expect(response.body).toHaveProperty(prop);
              });

              expect(response.body.boardType).toBe(board.type);
            });
          }
        });
      });
    });
  });

  describe('비회원 권한 검증', () => {
    const mockArticles = {
      public: {},
    };

    beforeAll(async () => {
      await login(request, 'admin', 'admin');
      const response = await request.post(`/articles/public`).send(mockPost);

      mockArticles.public = response.body;

      await request.post(`/auth/logout`);
    });

    test('성공] 비회원 댓글 삭제', async () => {
      const postComment = await request
        .post(`/articles/public/${mockArticles.public.id}/comments`)
        .send(mockPostComment);

      const response = await request
        .delete(`/articles/public/comments/${postComment.body.id}`)
        .set('password', mockPostComment.password);

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 작성자 정보 불일치', async () => {
      const postComment = await request
        .post(`/articles/public/${mockArticles.public.id}/comments`)
        .send(mockPostComment);

      const response = await request
        .delete(`/articles/public/comments/${postComment.body.id}`)
        .set('password', 'abc');

      expect(response.statusCode).toBe(403);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin', 'admin');
      const postArticle = await request.post(`/articles/admin`).send(mockPost);
      const postComment = await request
        .post(`/articles/admin/${postArticle.body.id}/comments`)
        .send(mockPostComment);

      await login(request, 'sample2', 'sample2');
      const response = await request.delete(
        `/articles/admin/comments/${postComment.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });

  test('성공] 댓글 삭제시 해당 댓글의 추천도 삭제됨', async () => {
    const boardType = 'default';

    await login(request, 'admin', 'admin');
    const postArticle = await request
      .post(`/articles/${boardType}`)
      .send(mockPost);
    const postComment = await request
      .post(`/articles/${boardType}/${postArticle.body.id}/comments`)
      .send({ content: mockPost.content });
    const postLikeComment = await request.post(
      `/articles/${boardType}/comments/${postComment.body.id}/like`,
    );
    const response = await request.delete(
      `/articles/${boardType}/comments/${postComment.body.id}`,
    );

    // 테스트 시작
    expect(postArticle.statusCode).toBe(200);
    expect(postComment.statusCode).toBe(200);
    expect(postLikeComment.statusCode).toBe(200);
    expect(response.statusCode).toBe(200);

    const commentId = response.body.id;
    const result = await Promise.all([
      db.Comment.findOne({ where: { id: commentId } }),
      db.Like.findOne({ where: { postId: commentId } }),
    ]);

    expect(result.filter(one => one === null).length).toBe(result.length);
  });
});
