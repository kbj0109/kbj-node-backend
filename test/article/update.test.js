const chalk = require('chalk');
const path = require('path');
const { MOCK_USERS, DUMMY_FILE_PATH } = require('../config');
const {
  testAppHelper,
  login,
  verifyAuth,
  isObjectArrayEqual,
} = require('../util');
const { schema } = require('../../src/database/models/article');
const { getArticleObject } = require('../../src/services/article');

const boardList = [
  {
    type: 'default',
    updateAuth: 'writer,level,role',
    updateLevel: 100,
  },
  {
    type: 'public',
    updateAuth: 'writer,level',
    updateLevel: 100,
  },
  // {
  //   type: 'private',
  //   updateAuth: 'writer,level',
  //   updateLevel: 100,
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
const newPost = {
  subject: '수정된 제목',
  content: '수정된 내용',
  tags: '간장,고추장,된장',
};

let request;
const mockArticles = {};

beforeAll(async () => {
  request = await testAppHelper.init();

  await login(request, 'admin', 'admin');
  const [adminDefault, adminPublic] = await Promise.all([
    request.post(`/articles/default`).send(mockPost),
    request.post(`/articles/public`).send(mockPost),
  ]);
  mockArticles.admin = {
    default: adminDefault.body,
    public: adminPublic.body,
  };

  await login(request, 'sample', 'sample');
  const [sampleDefault, samplePublic] = await Promise.all([
    request.post(`/articles/default`).send(mockPost),
    request.post(`/articles/public`).send(mockPost),
  ]);
  mockArticles.sample = {
    default: sampleDefault.body,
    public: samplePublic.body,
  };
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/수정'), () => {
  // Mock Writer
  MOCK_USERS.forEach(writer => {
    // Update User
    MOCK_USERS.forEach(requester => {
      beforeAll(async () => {
        await login(request, requester.id, requester.password);
      });

      // Update Board
      boardList.forEach(board => {
        let response;

        beforeAll(async () => {
          const mockArticle = mockArticles[writer.id][board.type];

          response = await request
            .put(`/articles/${board.type}/${mockArticle.id}`)
            .send({ ...mockPost, ...newPost });
        });

        const isForbidden = verifyAuth({
          auth: board.updateAuth,
          authLevel: board.updateLevel,
          userId: requester.id,
          userLevel: requester.level,
          writerId: writer.id,
        });

        // 테스트 시작
        describe(`PUT /articles/${board.type}/{articleId}
        (userId: ${requester.id}) - writer: ${writer.id}`, () => {
          if (isForbidden) {
            test(`실패] 권한 부족`, () => {
              expect(response.statusCode).toBe(403);
            });
            return;
          }

          test(`성공] Status code 200`, () => {
            expect(response.statusCode).toBe(200);
          });

          test(`성공] 구조 검증`, async () => {
            expect(response.body).not.toHaveProperty('order');
            expect(response.body).not.toHaveProperty('visible');
            expect(response.body).not.toHaveProperty('visibleStart');
            expect(response.body).not.toHaveProperty('visibleEnd');

            expect(response.body).not.toHaveProperty('password');

            articleProperties.forEach(prop => {
              expect(response.body).toHaveProperty(prop);
            });
          });

          test(`성공] 수정자 아이디가 기록됨`, async () => {
            expect(response.body.updater).toBe(requester.id);
          });
        });
      });
    });
  });

  describe('비회원 권한 검증', () => {
    const boardType = 'public';

    const mockArticle = {};

    beforeAll(async () => {
      await request.post(`/auth/logout`);

      const postRes = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);

      mockArticle.id = postRes.body.id;
    });

    test('성공] 비회원 게시물 수정', async () => {
      const response = await request
        .put(`/articles/${boardType}/${mockArticle.id}`)
        .send({ ...mockPost, ...newPost });

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 작성자 정보 불일치', async () => {
      const response = await request
        .put(`/articles/${boardType}/${mockArticle.id}`)
        .send({ ...mockPost, ...newPost, password: 'abc' });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      const boardType = 'admin';

      await login(request, 'admin', 'admin');
      const postRes = await request
        .post(`/articles/${boardType}`)
        .send(mockPost);

      await login(request, 'sample2', 'sample2');
      const response = await request
        .put(`/articles/${boardType}/${postRes.body.id}`)
        .send({ ...mockPost, ...newPost });

      expect(response.statusCode).toBe(200);
    });
  });

  test('성공] 첨부파일이 수정된 파일로 대체됨', async () => {
    const boardType = 'default';
    await login(request, 'admin', 'admin');

    // 파일 첨부 및 글 등록
    const fileRes = await request
      .post(`/articles/${boardType}/file`)
      .attach('file', path.join(DUMMY_FILE_PATH, 'sample1.jpg'));
    const postRes = await request
      .post(`/articles/${boardType}`)
      .send({ ...mockPost, attachFiles: [fileRes.body] });

    // 새로운 파일 첨부 및 글 수정
    const newFileRes = await request
      .post(`/articles/${boardType}/file`)
      .attach('file', path.join(DUMMY_FILE_PATH, 'sample2.jpg'));
    const putRes = await request
      .put(`/articles/${boardType}/${postRes.body.id}`)
      .send({ ...mockPost, attachFiles: [newFileRes.body] });

    expect(putRes.statusCode).toBe(200);
    expect(Array.isArray(putRes.body.attachFiles)).toBe(true);
    expect(isObjectArrayEqual(putRes.body.attachFiles, [newFileRes.body])).toBe(
      true,
    );
  });
});
