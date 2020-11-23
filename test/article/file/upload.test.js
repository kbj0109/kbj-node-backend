const chalk = require('chalk');
const path = require('path');
const { MOCK_USERS, TEMP_FILE_PATH, DUMMY_FILE_PATH } = require('../../config');
const {
  testAppHelper,
  login,
  verifyAuth,
  createMockFile,
} = require('../../util');

const boardList = [
  {
    type: 'default',
    fileCreateAuth: 'level',
    fileCreateLevel: 0,
    attachFileSize: 5242880,
  },
  { type: 'public', fileCreateAuth: '', fileCreateLevel: 0 },
  { type: 'admin', fileCreateAuth: 'level', fileCreateLevel: 100 },
];

const fileProperties = ['id', 'fileName', 'fileSize'];

const mockPost = { fileName: 'sample1.jpg' };

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/파일첨부'), () => {
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        response = await request
          .post(`/articles/${board.type}/file`)
          .set('Connection', 'keep-alive')
          .attach('file', path.join(DUMMY_FILE_PATH, mockPost.fileName));
      });

      const isForbidden = verifyAuth({
        auth: board.fileCreateAuth,
        authLevel: board.fileCreateLevel,
        userLevel: requester.level,
      });

      describe(`POST /articles/${board.type}/file
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
            fileProperties.forEach(prop => {
              expect(response.body).toHaveProperty(prop);
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

    test('성공] 비회원 파일첨부', async () => {
      const response = await request
        .post(`/articles/public/file`)
        .set('Connection', 'keep-alive')
        .attach('file', path.join(DUMMY_FILE_PATH, mockPost.fileName));

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 파일 첨부가 허용되지 않음', async () => {
      const response = await request
        .post(`/articles/private/file`)
        .set('Connection', 'keep-alive')
        .attach('file', path.join(DUMMY_FILE_PATH, mockPost.fileName));

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'sample2', 'sample2');
      const response = await request
        .post(`/articles/admin/file`)
        .set('Connection', 'keep-alive')
        .attach('file', path.join(DUMMY_FILE_PATH, mockPost.fileName));

      expect(response.statusCode).toBe(200);
    });
  });

  test(`실패] 파일첨부 허용 크기 초과`, async () => {
    const boardType = boardList[0].type;

    const mockFilePath = path.join(TEMP_FILE_PATH, 'mock.txt');
    const mockCreated = await createMockFile(
      mockFilePath,
      boardList[0].attachFileSize * 2,
    );

    if (mockCreated) {
      await login(request, 'admin', 'admin');
      const response = await request
        .post(`/articles/${boardType}/file`)
        .set('Connection', 'keep-alive')
        .attach('file', mockFilePath);

      expect(response.statusCode).toBe(400);
    }
  });

  test(`실패] 존재하지 않는 게시물`, async () => {
    await login(request, 'admin', 'admin');
    const response = await request
      .post(`/articles/fake/file`)
      .set('Connection', 'keep-alive')
      .attach('file', path.join(DUMMY_FILE_PATH, mockPost.fileName));

    expect(response.statusCode).toBe(404);
  });
});
