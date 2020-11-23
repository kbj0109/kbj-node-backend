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

describe(chalk.bold.cyan('관리자/게시판 읽기'), () => {
  let response;

  beforeAll(async () => {
    await login(request, 'admin', 'admin');
    const postRes = await request
      .post(`/admin/board-settings`)
      .send(mockBoardSetting);

    response = await request.get(`/admin/board-settings/${postRes.body.id}`);
  });

  describe(`GET /admin/board-settings/{boardId}
      (userId: admin)`, () => {
    test(`성공] Status code 200`, () => {
      expect(response.statusCode).toBe(200);
    });

    test(`성공] 구조 검증`, async () => {
      boardProperties.forEach(prop => {
        expect(response.body).toHaveProperty(prop);
      });
    });
  });

  test(`실패] 일반회원 권한 부족`, async () => {
    const postRes = await request
      .post(`/admin/board-settings`)
      .send({ ...mockBoardSetting, type: mockBoardSetting.type + 1 });

    await login(request, 'sample', 'sample');
    const getRes = await request.get(
      `/admin/board-settings/${postRes.body.id}`,
    );

    expect(getRes.statusCode).toBe(403);
  });
});
