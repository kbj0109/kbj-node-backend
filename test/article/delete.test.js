const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const { MOCK_USERS, DUMMY_FILE_PATH } = require('../config');
const { testAppHelper, login, verifyAuth } = require('../util');
const { schema } = require('../../src/database/models/article');
const { getArticleObject } = require('../../src/services/article');
const { db } = require('../../src/database/models');
const { getDate } = require('../../src/utils');
const { FILE_UPLOAD_PATH } = require('../../src/config');

const boardList = [
  {
    type: 'default',
    deleteAuth: 'writer,level,role',
    deleteLevel: 100,
  },
  {
    type: 'public',
    deleteAuth: 'writer,level',
    deleteLevel: 100,
  },
  // {
  //   type: 'admin',
  //   deleteAuth: 'level',
  //   deleteLevel: 100,
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
const mockArticles = {
  admin: {},
  sample: {},
};

beforeAll(async () => {
  request = await testAppHelper.init();
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/단일삭제'), () => {
  beforeAll(async () => {
    await login(request, 'sample', 'sample');
    // 작성자 => 수정자 => 게시물
    const [
      sampleAdminDefault,
      sampleAdminPublic,
      sampleSampleDefault,
      sampleSamplePublic,
    ] = await Promise.all([
      request.post(`/articles/default`).send(mockPost),
      request.post(`/articles/public`).send(mockPost),
      request.post(`/articles/default`).send(mockPost),
      request.post(`/articles/public`).send(mockPost),
    ]);

    mockArticles.sample.admin = {
      default: sampleAdminDefault.body,
      public: sampleAdminPublic.body,
    };
    mockArticles.sample.sample = {
      default: sampleSampleDefault.body,
      public: sampleSamplePublic.body,
    };

    await login(request, 'admin', 'admin');
    const [
      adminAdminDefault,
      adminAdminPublic,
      adminSampleDefault,
      adminSamplePublic,
    ] = await Promise.all([
      request.post(`/articles/default`).send(mockPost),
      request.post(`/articles/public`).send(mockPost),
      request.post(`/articles/default`).send(mockPost),
      request.post(`/articles/public`).send(mockPost),
    ]);

    mockArticles.admin.admin = {
      default: adminAdminDefault.body,
      public: adminAdminPublic.body,
    };
    mockArticles.admin.sample = {
      default: adminSampleDefault.body,
      public: adminSamplePublic.body,
    };
  });

  // Mock Writer
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
          const mockArticle = mockArticles[writer.id][requester.id][board.type];

          response = await request.delete(
            `/articles/${board.type}/${mockArticle.id}`,
          );
        });

        const isForbidden = verifyAuth({
          auth: board.deleteAuth,
          authLevel: board.deleteLevel,
          userId: requester.id,
          userLevel: requester.level,
          writerId: writer.id,
        });

        // 테스트 시작
        describe(`DELETE /articles/${board.type}/{articleId}
        (userId: ${requester.id}) - writer: ${writer.id}`, () => {
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
              const article = response.body[0];
              expect(response.body).not.toHaveProperty('order');
              expect(response.body).not.toHaveProperty('visible');
              expect(response.body).not.toHaveProperty('visibleStart');
              expect(response.body).not.toHaveProperty('visibleEnd');

              expect(article).not.toHaveProperty('password');

              articleProperties.forEach(prop => {
                expect(article).toHaveProperty(prop);
              });
            });

            test(`성공] 삭제 시간과 삭제자 아이디가 기록됨`, async () => {
              const article = response.body[0];
              expect(article.deleter).toBe(requester.id);
              expect(article.deletedAt).not.toBeFalsy();
            });
          }
        });
      });
    });
  });

  describe('비회원 권한 검증', () => {
    beforeAll(async () => {
      await request.post(`/auth/logout`);
    });

    test('성공] 비회원 게시물 삭제', async () => {
      const postRes = await request.post(`/articles/public`).send(mockPost);

      const response = await request
        .delete(`/articles/public/${postRes.body.id}`)
        .set('password', mockPost.password);

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 작성자 정보 불일치', async () => {
      const postRes = await request.post(`/articles/public`).send(mockPost);

      const response = await request
        .delete(`/articles/public/${postRes.body.id}`)
        .set('password', 'abc');

      expect(response.statusCode).toBe(403);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin', 'admin');
      const postRes = await request.post(`/articles/admin`).send(mockPost);

      await login(request, 'sample2', 'sample2');
      const response = await request.delete(
        `/articles/admin/${postRes.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });

  test('성공] Article 삭제시 연관 데이터 모두 삭제됨', async () => {
    const boardType = 'default';

    // 파일 첨부 및 Article 등록
    await login(request, 'admin', 'admin');
    const fileRes1 = await request
      .post(`/articles/${boardType}/file`)
      .attach('file', path.join(DUMMY_FILE_PATH, 'sample1.jpg'));
    const postArticle = await request
      .post(`/articles/${boardType}`)
      .send({ ...mockPost, attachFiles: [fileRes1.body] });

    // 등록된 Article 댓글 및 추천 + 댓글 추천
    const postComment = await request
      .post(`/articles/${boardType}/${postArticle.body.id}/comments`)
      .send({ content: mockPost.content });
    const postLikeArticle = await request.post(
      `/articles/${boardType}/${postArticle.body.id}/like`,
    );
    const postLikeComment = await request.post(
      `/articles/${boardType}/comments/${postComment.body.id}/like`,
    );

    const response = await request.delete(
      `/articles/${boardType}/${postArticle.body.id}`,
    );

    // 테스트 시작
    expect(fileRes1.statusCode).toBe(200);
    expect(postArticle.statusCode).toBe(200);
    expect(postComment.statusCode).toBe(200);
    expect(postLikeArticle.statusCode).toBe(200);
    expect(postLikeComment.statusCode).toBe(200);
    expect(response.statusCode).toBe(200);

    const articleId = response.body[0].id;
    const result = await Promise.all([
      db.Article.findOne({ where: { id: articleId } }),
      db.Tag.findOne({ where: { postId: articleId } }),
      db.File.findOne({ where: { postId: articleId } }),
      db.Comment.findOne({ where: { postId: articleId } }),
      db.Like.findOne({ where: { postId: articleId } }),
      db.Like.findOne({ where: { postId: postComment.body.id } }),
    ]);

    expect(result.filter(one => one === null).length).toBe(result.length);

    // 파일 삭제 확인
    const fileList = await db.File.findAll({
      where: { postId: articleId },
      paranoid: false,
    });
    fileList.forEach(file => {
      const date = getDate(file.createdAt.getTime());
      const filePath = path.join(FILE_UPLOAD_PATH, date, file.id);

      expect(fs.existsSync(filePath)).toBe(false);
    });
  });
});
