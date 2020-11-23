const chalk = require('chalk');
const { testAppHelper, login } = require('../../util');
const { schema } = require('../../../src/database/models/boardSetting');
const {
  getBoardSettingObject,
} = require('../../../src/services/boardSetting/common');

const boardProperties = Object.keys(getBoardSettingObject(schema));

const mockBoardSetting = {
  type: 'temp',
  subject: 'temp 설명 내용',
  createAuth: '',
  createLevel: 0,
  readListAuth: '',
  readListLevel: 0,
  readAuth: '',
  readLevel: 0,
  updateAuth: '',
  updateLevel: 0,
  deleteAuth: '',
  deleteLevel: 0,
  noticeLevel: 0,
  orderLevel: 0,
  visibleAuth: '',
  visibleLevel: 0,
  likeAuth: '',
  likeLevel: 0,
  useComment: true,
  commentCreateAuth: '',
  commentCreateLevel: 0,
  commentReadListAuth: '',
  commentReadListLevel: 0,
  commentDeleteAuth: '',
  commentDeleteLevel: 0,
  commentLikeAuth: '',
  commentLikeLevel: 0,
  fileCreateAuth: '',
  fileCreateLevel: 0,
  fileReadAuth: '',
  fileReadLevel: 0,
  attachImageSize: 1024 * 1024 * 1024,
  attachFileSize: 1024 * 1024 * 1024,
  attachFileSizeTotal: 1024 * 1024 * 1024 * 3,
};

let request;

beforeAll(async () => {
  request = await testAppHelper.init();
});
afterAll(async () => {
  await testAppHelper.destroy();
});

describe(chalk.bold.cyan('관리자/게시판 등록'), () => {
  let response;

  beforeAll(async () => {
    await login(request, 'admin', 'admin');
    response = await request
      .post(`/admin/board-settings`)
      .send(mockBoardSetting);
  });

  describe(`POST /admin/board-settings
      (userId: admin)`, () => {
    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      boardProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });

    test(`성공] 게시판 타입과 생성자 아이디가 기록됨`, async () => {
      expect(response.body.userId).toBe('admin');
      expect(response.body.type).toBe(mockBoardSetting.type);
    });
  });

  test(`실패] 중복된 type의 게시판 생성 불가`, async () => {
    const postRes = await request
      .post(`/admin/board-settings`)
      .send(mockBoardSetting);

    expect(postRes.statusCode).toBe(400);
  });

  test(`실패] 유효하지 않은 Board 속성값`, async () => {
    const [res1, res2, res3, res4] = await Promise.all([
      request
        .post(`/admin/board-settings`)
        .send({ ...mockBoardSetting, type: ' ' }),
      request
        .post(`/admin/board-settings`)
        .send({ ...mockBoardSetting, subject: ' ' }),
      request
        .post(`/admin/board-settings`)
        .send({ ...mockBoardSetting, createAuth: 0 }),
      request
        .post(`/admin/board-settings`)
        .send({ ...mockBoardSetting, createLevel: 'abc' }),
    ]);

    expect(res1.statusCode).toBe(400);
    expect(res2.statusCode).toBe(400);
    expect(res3.statusCode).toBe(400);
    expect(res4.statusCode).toBe(400);
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    await login(request, 'sample', 'sample');
    const postRes = await request
      .post(`/admin/board-settings`)
      .send({ ...mockBoardSetting, type: mockBoardSetting.type + 1 });

    expect(postRes.statusCode).toBe(403);
  });
});
