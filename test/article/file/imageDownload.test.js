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

let request;
const mockImages = {};

const filePath = path.join(DUMMY_FILE_PATH, 'sample1.jpg');

beforeAll(async () => {
  request = await testAppHelper.init();
  await login(request, 'admin', 'admin');

  // 각 게시물 이미지 첨부
  const postImgs = boardList.map(board => {
    return request.post(`/articles/${board.type}/img`).attach('file', filePath);
  });
  const files = await Promise.all(postImgs);

  mockImages.default = files[0].body;
  mockImages.private = files[1].body;
  mockImages.admin = files[2].body;
});

afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('게시물/이미지 다운'), () => {
  MOCK_USERS.forEach(requester => {
    beforeAll(async () => {
      await login(request, requester.id, requester.password);
    });

    boardList.forEach(board => {
      let response;

      beforeAll(async () => {
        response = await request.get(
          `/articles/${board.type}/img/${mockImages[board.type].id}`,
        );
      });

      const isForbidden = verifyAuth({
        auth: board.fileReadAuth,
        authLevel: board.fileReadLevel,
        userLevel: requester.level,
      });

      describe(`GET /articles/${board.type}/img/{imgId}
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
      const postRes = await request
        .post(`/articles/public/img`)
        .attach('file', filePath);

      expect(postRes.statusCode).toBe(200);

      const response = await request.get(
        `/articles/public/img/${postRes.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });

    test('실패] 비회원 이미지 다운로드가 허용되지 않음', async () => {
      await login(request, 'admin', 'admin');
      const postFile = await request
        .post(`/articles/private/img`)
        .attach('file', filePath);

      await request.post(`/auth/logout`);

      const response = await request.get(
        `/articles/private/img/${postFile.body.id}`,
      );

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Role 권한 검증', () => {
    test('성공] 요구되는 role을 가진 회원', async () => {
      await login(request, 'admin', 'admin');
      const postFile = await request
        .post(`/articles/admin/img`)
        .attach('file', filePath);

      await login(request, 'sample2', 'sample2');
      const response = await request.get(
        `/articles/admin/img/${postFile.body.id}`,
      );

      expect(response.statusCode).toBe(200);
    });
  });

  test(`실패] 존재하지 않는 이미지`, async () => {
    await login(request, 'admin', 'admin');
    const response = await request.get(`/articles/admin/img/abc`);

    expect(response.statusCode).toBe(404);
  });
});
