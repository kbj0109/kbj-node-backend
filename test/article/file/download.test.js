const chalk = require('chalk');
const path = require('path');
const { MOCK_USERS, DUMMY_FILE_PATH } = require('../../config');
const { testAppHelper, login, verifyAuth } = require('../../util');

const boardList = [
  { type: 'default', fileReadAuth: '', fileReadLevel: 0 },
  // { type: 'public', fileReadAuth: '', fileReadLevel: 0 },
  { type: 'private', fileReadAuth: 'level', fileReadLevel: 0 },
  { type: 'admin', fileReadAuth: 'level', fileReadLevel: 100 },
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
const mockFiles = {};

const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');

  // 각 게시물 파일 첨부 후 Article 등록
  const postFiles = boardList.map(board => {
    return request
      .post(`/articles/${board.type}/file`)
      .attach('file', filePath);
  });
  const files = await Promise.all(postFiles);

  const postArticles = boardList.map((board, index) =>
    request
      .post(`/articles/${board.type}`)
      .send({ ...mockPost, attachFiles: [files[index].body] }),
  );
  await Promise.all(postArticles);

  mockFiles.default = files[0].body;
  mockFiles.private = files[1].body;
  mockFiles.admin = files[2].body;
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/첨부파일 다운'), () => {
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        response = await request.get(
          `/articles/${board.type}/file/${mockFiles[board.type].id}`,
        );
      });

      const isForbidden = verifyAuth({
        auth: board.fileReadAuth,
        authLevel: board.fileReadLevel,
        userLevel: requester.level,
      });

      describe(`GET /articles/${board.type}/file/{fileId}
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
        }
      });
    });
  });

  describe('비회원 권한 검증', () => {
    beforeAll(async () => {
      await request.post(`/auth/logout`);
    });

    test('성공] 비회원 요청', async () => {
      const postFile = await request
        .post(`/articles/public/file`)
        .attach('file', filePath);
      const postRes = await request
        .post(`/articles/public`)
        .send({ ...mockPost, attachFiles: [postFile.body] });
      expect(postRes.statusCode).toBe(200);

      const response = await request.get(
        `/articles/public/file/${postFile.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 파일 다운로드가 허용되지 않음', async () => {
      await login(request, 'admin', 'admin');
      const postFile = await request
        .post(`/articles/private/file`)
        .attach('file', filePath);
      await request
        .post(`/articles/private`)
        .send({ ...mockPost, attachFiles: [postFile.body] });

      await request.post(`/auth/logout`);

      const response = await request.get(
        `/articles/private/file/${postFile.id}`,
      );

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      const boardType = 'admin';

      await login(request, 'admin', 'admin');
      const postFile = await request
        .post(`/articles/${boardType}/file`)
        .attach('file', filePath);
      await request
        .post(`/articles/${boardType}`)
        .send({ ...mockPost, attachFiles: [postFile.body] });

      await login(request, 'sample2', 'sample2');
      const response = await request.get(
        `/articles/${boardType}/file/${postFile.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });

  test(`실패] 존재하지 않는 파일`, async () => {
    await login(request, 'admin', 'admin');
    const response = await request.get(`/articles/admin/file/abc`);

    expect(response.statusCode).toBe(404);
  });
});
