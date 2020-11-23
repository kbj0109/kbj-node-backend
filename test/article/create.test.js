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
    createAuth: 'level',
    createLevel: 0,
  },
  {
    type: 'public',
    createAuth: '',
    createLevel: 0,
  },
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

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/등록'), () => {
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        response = await request.post(`/articles/${board.type}`).send(mockPost);
      });

      const isForbidden = verifyAuth({
        auth: board.createAuth,
        authLevel: board.createLevel,
        userLevel: requester.level,
      });

      describe(`POST /articles/${board.type}
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
            expect(response.body).not.toHaveProperty('order');
            expect(response.body).not.toHaveProperty('visible');
            expect(response.body).not.toHaveProperty('visibleStart');
            expect(response.body).not.toHaveProperty('visibleEnd');

            expect(response.body).not.toHaveProperty('password');

            articleProperties.forEach(prop => {
              expect(response.body).toHaveProperty(prop);
            });
          });

          test(`성공] 게시물 타입과 작성자 아이디가 기록됨`, async () => {
            expect(response.body.userId).toBe(requester.id);
            expect(response.body.boardType).toBe(board.type);
          });
        }
      });
    });
  });

  describe('비회원 권한 검증', () => {
    beforeAll(async () => {
      await request.post(`/auth/logout`);
    });

    test('성공] 비회원 게시물 등록', async () => {
      const response = await request.post(`/articles/public`).send(mockPost);

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 게시물 등록이 허용되지 않음', async () => {
      const response = await request.post(`/articles/private`).send(mockPost);

      expect(response.statusCode).toBe(400);
    });

    test('실패] 비회원 게시물 등록시 name, password 없음', async () => {
      const postRes = await request
        .post(`/articles/public`)
        .send({ ...mockPost, name: '', password: '' });

      expect(postRes.statusCode).toBe(400);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'sample2', 'sample2');
      const postRes = await request.post(`/articles/admin`).send(mockPost);

      expect(postRes.statusCode).toBe(200);
    });
  });

  test('성공] 첨부파일 포함 등록시 응답에 파일정보가 포함됨', async () => {
    const boardType = 'default';
    await login(request, 'admin', 'admin');

    // 파일 첨부 및 글 등록
    const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');
    const fileRes = await request
      .post(`/articles/${boardType}/file`)
      .attach('file', filePath);
    const postRes = await request
      .post(`/articles/${boardType}`)
      .send({ ...mockPost, attachFiles: [fileRes.body] });

    expect(postRes.statusCode).toBe(200);
    expect(Array.isArray(postRes.body.attachFiles)).toBe(true);
    expect(isObjectArrayEqual(postRes.body.attachFiles, [fileRes.body])).toBe(
      true,
    );
  });
});
